import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AS_OF, COLUMNS, LIMITS, AGE_BUCKETS, DataError, parseCsv, validateRecords,
  dateNumber, filterTickets, ticketMetrics, decisionInsight, safeCsvValue, toCsv, exceptionsCsv,
} from './core.js';
import { GOOD_SAMPLE_ROWS, SAMPLE_CSV, FIXTURE_METADATA } from './fixtures.js';

const valid = (changes = {}) => ({ ...GOOD_SAMPLE_ROWS[0], id: 'TEST-1', title: 'Fictional test ticket', status: 'Open', priority: 'High', channel: 'Email', opened_at: '2026-10-20', due_at: '2026-10-23', resolved_at: '', effort_minutes: 30, ...changes });
const validate = rows => validateRecords(parseCsv(toCsv(rows)));
const rawRow = values => COLUMNS.map(column => values[column] ?? '').join(',');

test('sample reconciles exactly and keeps rejected data out of reporting', () => {
  const result = validateRecords(parseCsv(SAMPLE_CSV));
  assert.deepEqual(result.summary, { source: 50, accepted: 42, rejected: 8, issues: 8 });
  assert.equal(result.summary.accepted, FIXTURE_METADATA.expectedAccepted);
  assert.equal(result.summary.rejected, FIXTURE_METADATA.expectedRejected);
  assert.equal(result.summary.source, result.accepted.length + result.rejected.length);
  assert.ok(result.accepted.every(row => row.id.startsWith('DEMO-')));
});

test('quoted commas, escaped quotes and CRLF are parsed as one field', () => {
  const row = valid({ title: 'A comma, and a "quote"' });
  assert.equal(validate([row]).accepted[0].title, row.title);
});

test('quoted multiline fields preserve newlines and physical source lines', () => {
  const rows = [valid({ title: 'Line one\nLine two' }), valid({ id: 'TEST-2' })];
  const parsed = parseCsv(toCsv(rows));
  assert.equal(parsed.rows[0].values[1], 'Line one\nLine two');
  assert.equal(parsed.rows[0].line, 2);
  assert.equal(parsed.rows[1].line, 4);
});

test('BOM, LF endings and final record without newline work', () => {
  const text = toCsv([valid()]).replaceAll('\r\n', '\n').trimEnd();
  assert.equal(validateRecords(parseCsv(text)).accepted.length, 1);
});

test('blank physical records are excluded and counted', () => {
  const csv = toCsv([valid()]) + '\r\n , , \r\n';
  const parsed = parseCsv(csv);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.blankRows, 2);
});

test('trailing empty field remains a real column', () => {
  const csv = COLUMNS.join(',') + ',extra\n' + rawRow(valid()) + ',';
  const parsed = parseCsv(csv);
  assert.equal(parsed.rows[0].values.length, 10);
  assert.deepEqual(parsed.extraColumns, ['extra']);
  assert.equal(validateRecords(parsed).accepted.length, 1);
});

test('unterminated or misplaced quotes fail the file', () => {
  for (const tail of ['"unfinished', 'un"quoted', '"closed"x']) {
    assert.throws(() => parseCsv(COLUMNS.join(',') + '\n' + tail), DataError);
  }
});

test('missing, empty or duplicate headers fail without partial data', () => {
  assert.throws(() => parseCsv('id,title\nX,Hello'), error => error.code === 'MISSING_HEADER');
  assert.throws(() => parseCsv(COLUMNS.join(',') + ',\n'), error => error.code === 'EMPTY_HEADER');
  assert.throws(() => parseCsv(COLUMNS.join(',') + ', ID\n'), error => error.code === 'DUPLICATE_HEADER');
});

test('headers are trimmed and case-normalised', () => {
  const csv = COLUMNS.map(column => ' ' + column.toUpperCase() + ' ').join(',') + '\n' + rawRow(valid());
  assert.equal(validateRecords(parseCsv(csv)).accepted.length, 1);
});

test('an empty file fails, while a valid header-only file yields a zero-row run', () => {
  assert.throws(() => parseCsv(' \n'), error => error.code === 'EMPTY_FILE');
  assert.deepEqual(validateRecords(parseCsv(COLUMNS.join(','))).summary, { source: 0, accepted: 0, rejected: 0, issues: 0 });
});

test('size, rows, columns and field-length bounds are enforced', () => {
  assert.throws(() => parseCsv(SAMPLE_CSV, { ...LIMITS, bytes: 10 }), error => error.code === 'SIZE_LIMIT');
  assert.throws(() => parseCsv(SAMPLE_CSV, { ...LIMITS, rows: 2 }), error => error.code === 'ROW_LIMIT');
  assert.throws(() => parseCsv(SAMPLE_CSV, { ...LIMITS, columns: 3 }), error => error.code === 'COLUMN_LIMIT');
  assert.throws(() => parseCsv(SAMPLE_CSV, { ...LIMITS, fieldLength: 4 }), error => error.code === 'FIELD_LIMIT');
});

test('maximum row boundary accepts exactly the bounded number of records', () => {
  const csv = toCsv([valid(), valid({ id: 'TEST-2' })]);
  assert.equal(parseCsv(csv, { ...LIMITS, rows: 2 }).rows.length, 2);
});

test('all duplicate IDs are held after trimming and case normalisation', () => {
  const result = validate([valid(), valid({ id: ' test-1 ' })]);
  assert.equal(result.accepted.length, 0);
  assert.equal(result.rejected.length, 2);
  assert.equal(result.issueCounts.DUPLICATE_ID, 2);
});

test('required values and unsafe ID characters are rejected', () => {
  const result = validate([valid({ id: '<script>', title: '' })]);
  assert.deepEqual(result.rejected[0].issues.map(issue => issue.code), ['INVALID_ID', 'TITLE_REQUIRED']);
});

test('allowed enums are canonicalised without inventing unknown values', () => {
  const result = validate([valid({ status: ' in PROGRESS ', priority: 'hIGH', channel: 'email' })]);
  assert.equal(result.accepted[0].status, 'In progress');
  assert.equal(result.accepted[0].priority, 'High');
  assert.equal(result.accepted[0].channel, 'Email');
  const bad = validate([valid({ status: 'Pending', priority: 'Critical', channel: 'Other' })]);
  assert.equal(bad.rejected[0].issues.length, 3);
});

test('calendar validation rejects rollover dates and supports leap years', () => {
  assert.ok(Number.isNaN(dateNumber('2026-02-30')));
  assert.ok(Number.isNaN(dateNumber('2026-02-29')));
  assert.ok(Number.isFinite(dateNumber('2024-02-29')));
  assert.ok(Number.isNaN(dateNumber('2026-2-01')));
  assert.ok(Number.isNaN(dateNumber('1899-12-31')));
});

test('date order and reporting-snapshot rules are enforced', () => {
  const result = validate([valid({ opened_at: '2026-10-27', due_at: '2026-10-20' })]);
  assert.ok(result.rejected[0].issues.some(issue => issue.code === 'FUTURE_OPENED'));
  assert.ok(result.rejected[0].issues.some(issue => issue.code === 'DATE_ORDER'));
});

test('resolution date is conditional on status', () => {
  assert.ok(validate([valid({ status: 'Resolved' })]).issueCounts.RESOLUTION_REQUIRED);
  assert.ok(validate([valid({ resolved_at: '2026-10-21' })]).issueCounts.RESOLUTION_STATUS);
  assert.equal(validate([valid({ status: 'Resolved', resolved_at: '2026-10-21' })]).accepted.length, 1);
});

test('resolution before opening or after snapshot is rejected', () => {
  assert.ok(validate([valid({ status: 'Resolved', resolved_at: '2026-10-01' })]).issueCounts.DATE_ORDER);
  assert.ok(validate([valid({ status: 'Resolved', resolved_at: '2026-10-27' })]).issueCounts.FUTURE_RESOLVED);
});

test('effort is a bounded non-negative integer; zero is valid', () => {
  assert.equal(validate([valid({ effort_minutes: 0 })]).accepted[0].effort_minutes, 0);
  for (const value of ['-1', '1.5', '1e3', 'NaN', '', '1000001']) assert.ok(validate([valid({ effort_minutes: value })]).issueCounts.INVALID_EFFORT, value);
});

test('a mismatched column count holds the whole record for review', () => {
  const csv = COLUMNS.join(',') + '\n' + rawRow(valid()) + ',unexpected';
  const result = validateRecords(parseCsv(csv));
  assert.equal(result.accepted.length, 0);
  assert.ok(result.issueCounts.COLUMN_COUNT);
});

test('prototype-like unknown headers do not pollute objects and are omitted from accepted rows', () => {
  const csv = COLUMNS.join(',') + ',__proto__\n' + rawRow(valid()) + ',not-an-object';
  const result = validateRecords(parseCsv(csv));
  assert.equal(result.accepted.length, 1);
  assert.equal(Object.getPrototypeOf(result.accepted[0]), Object.prototype);
  assert.equal(result.accepted[0].__proto__, Object.prototype);
  assert.deepEqual(result.extraColumns, ['__proto__']);
});

test('date, channel, priority and text filters intersect with inclusive endpoints', () => {
  const tickets = [valid(), valid({ id: 'TEST-2', channel: 'Phone', priority: 'Low' }), valid({ id: 'TEST-3', opened_at: '2026-10-19' })];
  const result = filterTickets(tickets, { from: '2026-10-20', to: '2026-10-20', channel: 'Email', priority: 'High', query: 'fictional' });
  assert.deepEqual(result.map(row => row.id), ['TEST-1']);
  assert.equal(filterTickets(tickets, { query: 'does-not-exist' }).length, 0);
});

test('status and overdue filters respect resolved status and due-today boundary', () => {
  const tickets = [valid(), valid({ id: 'TODAY', due_at: AS_OF }), valid({ id: 'DONE', status: 'Resolved', resolved_at: '2026-10-24' })];
  assert.deepEqual(filterTickets(tickets, { overdue: true }).map(row => row.id), ['TEST-1']);
  assert.equal(filterTickets(tickets, { status: 'Resolved' }).length, 1);
});

test('metrics separate resolved, backlog, overdue, priority overdue and effort', () => {
  const tickets = [valid(), valid({ id: 'TODAY', due_at: AS_OF, priority: 'Low', effort_minutes: 0 }), valid({ id: 'DONE', status: 'Resolved', resolved_at: '2026-10-22', effort_minutes: 60 })];
  const metrics = ticketMetrics(tickets);
  assert.equal(metrics.total, 3); assert.equal(metrics.backlog, 2); assert.equal(metrics.overdue, 1);
  assert.equal(metrics.priorityOverdue, 1); assert.equal(metrics.resolved, 1); assert.equal(metrics.resolvedOnTime, 1);
  assert.equal(metrics.effortMinutes, 90);
  assert.equal(Object.values(metrics.statuses).reduce((a, b) => a + b, 0), metrics.total);
});

test('ageing bucket edges reconcile to unresolved backlog', () => {
  const offsets = [0, 2, 3, 7, 8, 14, 15, 28];
  const tickets = offsets.map((days, i) => {
    const opened = new Date(dateNumber(AS_OF) - days * 86400000).toISOString().slice(0, 10);
    return valid({ id: 'AGE-' + i, opened_at: opened, due_at: AS_OF });
  });
  tickets.push(valid({ id: 'RESOLVED', status: 'Resolved', resolved_at: '2026-10-22' }));
  const metrics = ticketMetrics(tickets);
  assert.deepEqual(Object.values(metrics.ageing), [2, 2, 2, 2]);
  assert.equal(Object.values(metrics.ageing).reduce((a, b) => a + b, 0), metrics.backlog);
  assert.equal(metrics.oldestDays, 28);
  assert.deepEqual(Object.keys(metrics.ageing), AGE_BUCKETS);
});

test('zero records produce finite zero metrics and an honest empty-view insight', () => {
  const metrics = ticketMetrics([]);
  assert.equal(metrics.total, 0); assert.equal(metrics.oldestDays, 0); assert.equal(metrics.effortMinutes, 0);
  assert.match(decisionInsight(metrics), /No tickets match/);
});

test('insights are derived from the current metrics, with no invented improvement', () => {
  assert.match(decisionInsight(ticketMetrics([valid()])), /1 high or urgent ticket is overdue/);
  assert.match(decisionInsight(ticketMetrics([valid({ priority: 'Low' })])), /1 unresolved ticket has/);
  assert.match(decisionInsight(ticketMetrics([valid({ due_at: AS_OF })])), /No overdue tickets/);
  assert.match(decisionInsight(ticketMetrics([valid({ status: 'Resolved', resolved_at: '2026-10-22' })])), /1 of 1/);
});

test('CSV exports neutralise spreadsheet formula prefixes and escape quotes', () => {
  for (const value of ['=1+1', '+SUM(A1)', '-1+2', '@SUM(A1)', '   =HYPERLINK("x")', '\t=1', '\r=1', '\n=1']) {
    assert.ok(safeCsvValue(value).startsWith('"\''), value);
  }
  assert.equal(safeCsvValue('ordinary "text"'), '"ordinary ""text"""');
});

test('accepted CSV round-trips commas and multiline text without formula execution', () => {
  const rows = [valid({ title: 'Quoted, "multiline"\ntext' })];
  const result = validateRecords(parseCsv(toCsv(rows)));
  assert.equal(result.accepted[0].title, rows[0].title);
  assert.ok(toCsv(rows).startsWith('\uFEFF'));
  assert.equal(parseCsv(toCsv([valid({ title: '=1+1' })])).rows[0].values[1], "'=1+1");
});

test('exception exports retain source context and neutralise dangerous rejected values', () => {
  const row = valid({ id: '=IMPORTXML("x")', title: '@formula', effort_minutes: -1 });
  const input = COLUMNS.join(',') + '\n' + COLUMNS.map(column => '"' + String(row[column]).replaceAll('"', '""') + '"').join(',');
  const result = validateRecords(parseCsv(input));
  const csv = exceptionsCsv(result);
  assert.match(csv, /source_record/);
  assert.match(csv, /source_line/);
  assert.match(csv, /INVALID|Use 1/);
  assert.match(csv, /'=IMPORTXML/);
  assert.match(csv, /'@formula/);
});

test('filter sort is deterministic and does not mutate source records', () => {
  const tickets = [valid({ id: 'B' }), valid({ id: 'A' }), valid({ id: 'C', opened_at: '2026-10-21' })];
  const before = JSON.stringify(tickets);
  assert.deepEqual(filterTickets(tickets).map(row => row.id), ['C', 'A', 'B']);
  assert.equal(JSON.stringify(tickets), before);
});

test('invalid report dates fail explicitly rather than yielding NaN metrics', () => {
  assert.throws(() => ticketMetrics([], 'not-a-date'), error => error.code === 'REPORT_DATE');
  assert.throws(() => validateRecords(parseCsv(SAMPLE_CSV), { asOf: '2026-02-30' }), error => error.code === 'REPORT_DATE');
});

test('binary control characters fail while ordinary tabs remain parseable', () => {
  assert.throws(() => parseCsv(SAMPLE_CSV + '\u0000'), error => error.code === 'CONTROL_CHARACTER');
  assert.equal(validate([valid({ title: 'An ordinary\ttab' })]).accepted.length, 1);
});

test('the full 2,000-row bound validates without silent truncation', () => {
  const rows = Array.from({ length: 2000 }, (_, i) => valid({ id: 'BOUND-' + i }));
  const result = validate(rows);
  assert.equal(result.summary.source, 2000);
  assert.equal(result.accepted.length, 2000);
  assert.equal(result.rejected.length, 0);
  assert.throws(() => validate([...rows, valid({ id: 'ONE-TOO-MANY' })]), error => error.code === 'ROW_LIMIT');
});

