export const AUTHOR = 'Dhruba Poudel';
export const AS_OF = '2026-10-26';
export const LIMITS = Object.freeze({ bytes: 1_048_576, rows: 2000, columns: 40, fieldLength: 10_000 });
export const COLUMNS = Object.freeze(['id', 'title', 'status', 'priority', 'channel', 'opened_at', 'due_at', 'resolved_at', 'effort_minutes']);
export const ENUMS = Object.freeze({
  status: ['Open', 'In progress', 'Resolved'],
  priority: ['Low', 'Medium', 'High', 'Urgent'],
  channel: ['Email', 'Portal', 'Phone', 'Chat'],
});
export const AGE_BUCKETS = Object.freeze(['0–2 days', '3–7 days', '8–14 days', '15+ days']);

export class DataError extends Error {
  constructor(message, code = 'CSV_FORMAT') { super(message); this.name = 'DataError'; this.code = code; }
}
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export function parseCsv(source, limits = LIMITS) {
  if (typeof source !== 'string') throw new DataError('Choose a UTF-8 CSV file.', 'INPUT_TYPE');
  const text = source.replace(/^\uFEFF/, '');
  if (new TextEncoder().encode(source).length > limits.bytes) throw new DataError('This file is too large. Use a CSV up to 1 MB.', 'SIZE_LIMIT');
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(text)) throw new DataError('This file contains binary or unsupported control characters. Save a plain UTF-8 CSV and try again.', 'CONTROL_CHARACTER');
  const records = [];
  let cells = [], value = '', quoted = false, closedQuote = false, line = 1, recordLine = 1, blankRows = 0;
  function pushCell() {
    if (value.length > limits.fieldLength) throw new DataError('A field exceeds the 10,000-character limit.', 'FIELD_LIMIT');
    cells.push(value); value = ''; closedQuote = false;
    if (cells.length > limits.columns) throw new DataError('A row has too many columns. Maximum: 40.', 'COLUMN_LIMIT');
  }
  function pushRecord() {
    pushCell();
    if (cells.every(cell => cell.trim() === '')) blankRows += 1;
    else {
      records.push({ line: recordLine, values: cells });
      if (records.length > limits.rows + 1) throw new DataError('This file has too many records. Maximum: 2,000 data rows.', 'ROW_LIMIT');
    }
    cells = [];
  }
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { value += '"'; i += 1; }
        else { quoted = false; closedQuote = true; }
      } else if (char === '\r' || char === '\n') {
        if (char === '\r' && text[i + 1] === '\n') i += 1;
        value += '\n'; line += 1;
      } else value += char;
    } else if (char === '"') {
      if (value !== '' || closedQuote) throw new DataError('Unexpected quote at line ' + line + '. Quote the entire field and double any internal quotes.');
      quoted = true;
    } else if (char === ',') {
      pushCell();
    } else if (char === '\r' || char === '\n') {
      pushRecord();
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      line += 1; recordLine = line;
    } else {
      if (closedQuote) throw new DataError('Unexpected text after a closing quote at line ' + line + '.');
      value += char;
    }
    if (value.length > limits.fieldLength) throw new DataError('A field exceeds the 10,000-character limit.', 'FIELD_LIMIT');
  }
  if (quoted) throw new DataError('A quoted field is not closed at the end of the file.');
  if (value !== '' || cells.length > 0 || closedQuote) pushRecord();
  if (!records.length) throw new DataError('This file is empty. Download the sample to see the required columns.', 'EMPTY_FILE');
  const headerRecord = records.shift();
  const headers = headerRecord.values.map(value => value.trim().toLowerCase());
  if (headers.some(value => !value)) throw new DataError('Every column needs a header.', 'EMPTY_HEADER');
  if (new Set(headers).size !== headers.length) throw new DataError('Column headers must be unique.', 'DUPLICATE_HEADER');
  const missing = COLUMNS.filter(column => !headers.includes(column));
  if (missing.length) throw new DataError('Missing required columns: ' + missing.join(', ') + '.', 'MISSING_HEADER');
  return {
    headers,
    rows: records.map((record, index) => ({ ...record, record: index + 1 })),
    blankRows,
    extraColumns: headers.filter(column => !COLUMNS.includes(column)),
  };
}

export function dateNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return NaN;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 2100) return NaN;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return NaN;
  return date.getTime();
}

export function validateRecords(parsed, { asOf = AS_OF } = {}) {
  if (!Number.isFinite(dateNumber(asOf))) throw new DataError('The reporting date is invalid.', 'REPORT_DATE');
  const idIndex = parsed.headers.indexOf('id');
  const idCounts = new Map();
  parsed.rows.forEach(row => {
    const id = String(row.values[idIndex] ?? '').trim().toUpperCase();
    if (id) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
  });
  const accepted = [], rejected = [], issueCounts = {};
  parsed.rows.forEach(row => {
    const raw = Object.create(null);
    parsed.headers.forEach((header, i) => { raw[header] = row.values[i] ?? ''; });
    const clean = Object.create(null), issues = [];
    const issue = (code, field, message) => { issues.push({ code, field, message }); issueCounts[code] = (issueCounts[code] ?? 0) + 1; };
    COLUMNS.forEach(column => { clean[column] = String(hasOwn(raw, column) ? raw[column] : '').trim(); });
    if (row.values.length !== parsed.headers.length) issue('COLUMN_COUNT', '', 'Expected ' + parsed.headers.length + ' columns; found ' + row.values.length + '.');
    clean.id = clean.id.toUpperCase();
    if (!/^[A-Z0-9_-]{1,40}$/.test(clean.id)) issue('INVALID_ID', 'id', 'Use 1–40 letters, numbers, underscores or hyphens.');
    if (clean.id && idCounts.get(clean.id) > 1) issue('DUPLICATE_ID', 'id', 'Duplicate ID. Every occurrence is held for review.');
    if (clean.title.length < 1 || clean.title.length > 160) issue('TITLE_REQUIRED', 'title', 'A title of 1–160 characters is required.');
    for (const field of ['status', 'priority', 'channel']) {
      const match = ENUMS[field].find(value => value.toLowerCase() === clean[field].toLowerCase());
      if (match) clean[field] = match;
      else issue('INVALID_' + field.toUpperCase(), field, 'Use: ' + ENUMS[field].join(', ') + '.');
    }
    for (const field of ['opened_at', 'due_at']) {
      if (!Number.isFinite(dateNumber(clean[field]))) issue('INVALID_DATE', field, 'Use a real calendar date as YYYY-MM-DD (1900–2100).');
    }
    if (clean.resolved_at && !Number.isFinite(dateNumber(clean.resolved_at))) issue('INVALID_DATE', 'resolved_at', 'Use a real calendar date as YYYY-MM-DD, or leave blank.');
    const opened = dateNumber(clean.opened_at), due = dateNumber(clean.due_at), resolved = dateNumber(clean.resolved_at), report = dateNumber(asOf);
    if (Number.isFinite(opened) && opened > report) issue('FUTURE_OPENED', 'opened_at', 'Opened date is after the reporting snapshot.');
    if (Number.isFinite(opened) && Number.isFinite(due) && due < opened) issue('DATE_ORDER', 'due_at', 'Due date cannot precede the opened date.');
    if (clean.status === 'Resolved' && !clean.resolved_at) issue('RESOLUTION_REQUIRED', 'resolved_at', 'Resolved tickets need a resolution date.');
    if (clean.status !== 'Resolved' && clean.resolved_at) issue('RESOLUTION_STATUS', 'resolved_at', 'Only resolved tickets can have a resolution date.');
    if (Number.isFinite(resolved) && Number.isFinite(opened) && resolved < opened) issue('DATE_ORDER', 'resolved_at', 'Resolution cannot precede the opened date.');
    if (Number.isFinite(resolved) && resolved > report) issue('FUTURE_RESOLVED', 'resolved_at', 'Resolution date is after the reporting snapshot.');
    if (!/^\d+$/.test(clean.effort_minutes) || Number(clean.effort_minutes) > 1_000_000) issue('INVALID_EFFORT', 'effort_minutes', 'Use whole minutes from 0 to 1,000,000.');
    else clean.effort_minutes = Number(clean.effort_minutes);
    if (issues.length) rejected.push({ record: row.record, line: row.line, raw, issues });
    else accepted.push({ ...clean });
  });
  return {
    accepted, rejected, issueCounts, sourceRows: parsed.rows.length, blankRows: parsed.blankRows,
    extraColumns: parsed.extraColumns, asOf,
    summary: { source: parsed.rows.length, accepted: accepted.length, rejected: rejected.length, issues: Object.values(issueCounts).reduce((sum, count) => sum + count, 0) },
  };
}

export function filterTickets(tickets, filters = {}) {
  const query = String(filters.query ?? '').trim().toLowerCase();
  return tickets.filter(ticket => {
    if (filters.from && ticket.opened_at < filters.from) return false;
    if (filters.to && ticket.opened_at > filters.to) return false;
    if (filters.channel && ticket.channel !== filters.channel) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.overdue && !(ticket.status !== 'Resolved' && ticket.due_at < (filters.asOf ?? AS_OF))) return false;
    return !query || [ticket.id, ticket.title, ticket.status, ticket.priority, ticket.channel].some(value => String(value).toLowerCase().includes(query));
  }).sort((a, b) => b.opened_at.localeCompare(a.opened_at) || a.id.localeCompare(b.id));
}

export function ticketMetrics(tickets, asOf = AS_OF) {
  const report = dateNumber(asOf);
  if (!Number.isFinite(report)) throw new DataError('The reporting date is invalid.', 'REPORT_DATE');
  const statuses = Object.fromEntries(ENUMS.status.map(status => [status, 0]));
  const ageing = Object.fromEntries(AGE_BUCKETS.map(bucket => [bucket, 0]));
  let overdue = 0, priorityOverdue = 0, oldestDays = 0, effort = 0, resolvedOnTime = 0, resolved = 0;
  for (const ticket of tickets) {
    statuses[ticket.status] = (statuses[ticket.status] ?? 0) + 1;
    effort += ticket.effort_minutes;
    if (ticket.status === 'Resolved') {
      resolved += 1;
      if (ticket.resolved_at <= ticket.due_at) resolvedOnTime += 1;
    } else {
      const age = Math.max(0, Math.floor((report - dateNumber(ticket.opened_at)) / 86400000));
      oldestDays = Math.max(oldestDays, age);
      const bucket = age <= 2 ? AGE_BUCKETS[0] : age <= 7 ? AGE_BUCKETS[1] : age <= 14 ? AGE_BUCKETS[2] : AGE_BUCKETS[3];
      ageing[bucket] += 1;
      if (ticket.due_at < asOf) {
        overdue += 1;
        if (['High', 'Urgent'].includes(ticket.priority)) priorityOverdue += 1;
      }
    }
  }
  return { total: tickets.length, statuses, ageing, backlog: tickets.length - resolved, overdue, priorityOverdue, oldestDays, effortMinutes: effort, resolved, resolvedOnTime };
}

export function decisionInsight(metrics) {
  if (!metrics.total) return 'No tickets match these filters. Widen the date range or clear a filter to explore the sample.';
  if (metrics.priorityOverdue) return metrics.priorityOverdue + ' high or urgent ' + (metrics.priorityOverdue === 1 ? 'ticket is' : 'tickets are') + ' overdue in this view. Review that queue first.';
  if (metrics.overdue) return metrics.overdue + ' unresolved ' + (metrics.overdue === 1 ? 'ticket has' : 'tickets have') + ' passed the due date in this view.';
  if (metrics.backlog) return 'No overdue tickets in this view. The oldest unresolved ticket is ' + metrics.oldestDays + ' ' + (metrics.oldestDays === 1 ? 'day' : 'days') + ' old.';
  return 'Every ticket in this view is resolved. ' + metrics.resolvedOnTime + ' of ' + metrics.resolved + ' were resolved on or before their due date.';
}

export function safeCsvValue(value) {
  let text = String(value ?? '');
  if (/^[\s\uFEFF]*[=+\-@]/u.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export function toCsv(rows, columns = COLUMNS) {
  const lines = [columns.map(safeCsvValue).join(',')];
  for (const row of rows) lines.push(columns.map(column => safeCsvValue(row[column])).join(','));
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

export function exceptionsCsv(result) {
  const columns = ['source_record', 'source_line', 'issue_count', 'issues', ...COLUMNS];
  return toCsv(result.rejected.map(row => ({
    source_record: row.record, source_line: row.line, issue_count: row.issues.length,
    issues: row.issues.map(issue => (issue.field ? issue.field + ': ' : '') + issue.message).join(' | '),
    ...Object.fromEntries(COLUMNS.map(column => [column, row.raw[column] ?? ''])),
  })), columns);
}

