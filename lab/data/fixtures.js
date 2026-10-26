import { AS_OF, COLUMNS, toCsv } from './core.js';

const names = [
  'Set up shared calendar access', 'Replace a worn keyboard', 'Review a new starter checklist',
  'Restore a missing dashboard shortcut', 'Investigate a slow test laptop', 'Update a fictional asset record',
  'Check a meeting-room display', 'Confirm a sample software licence', 'Review access to a test workspace',
  'Triage a sample import exception', 'Prepare a fictional device handover', 'Check a printer queue',
  'Review a training-page link', 'Create a test distribution group',
];
const day = (offset) => {
  const date = new Date(AS_OF + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const GOOD_SAMPLE_ROWS = Array.from({ length: 42 }, (_, i) => {
  const age = (i * 7 + 2) % 39;
  const opened = day(-age);
  const priority = ['Medium', 'Low', 'High', 'Urgent', 'Medium', 'High'][i % 6];
  const allowance = { Urgent: 1, High: 3, Medium: 7, Low: 12 }[priority];
  const state = i % 5 === 0 || i % 5 === 3 ? 'Resolved' : i % 3 === 0 ? 'Open' : 'In progress';
  return {
    id: 'DEMO-' + String(1001 + i),
    title: names[i % names.length] + (i >= names.length ? ' · sample ' + (Math.floor(i / names.length) + 1) : ''),
    status: state,
    priority,
    channel: ['Portal', 'Email', 'Phone', 'Chat'][i % 4],
    opened_at: opened,
    due_at: day(-age + allowance),
    resolved_at: state === 'Resolved' ? day(Math.min(0, -age + (i % 6) + 1)) : '',
    effort_minutes: [15, 30, 45, 60, 90, 20, 0][i % 7],
  };
});

const copy = (id, changes) => ({ ...GOOD_SAMPLE_ROWS[0], id, status: 'Open', resolved_at: '', ...changes });
export const BAD_SAMPLE_ROWS = [
  copy('CHECK-2001', { title: '' }),
  copy('CHECK-2002', { status: 'Pending' }),
  copy('CHECK-2003', { opened_at: '2026-02-30' }),
  copy('CHECK-2004', { effort_minutes: '-15' }),
  copy('CHECK-2005', { status: 'Resolved', resolved_at: '' }),
  copy('CHECK-2006', { channel: 'Carrier pigeon' }),
  copy('CHECK-2007', { title: 'Duplicate sample record A' }),
  copy('CHECK-2007', { title: 'Duplicate sample record B' }),
];

export const SAMPLE_ROWS = [...GOOD_SAMPLE_ROWS, ...BAD_SAMPLE_ROWS];
export const SAMPLE_CSV = toCsv(SAMPLE_ROWS, COLUMNS);
export const FIXTURE_METADATA = Object.freeze({
  name: 'Fictional service desk · teaching sample',
  asOf: AS_OF,
  rows: 50,
  expectedAccepted: 42,
  expectedRejected: 8,
  provenance: 'Original, deterministic fictional data. No employer, customer or employee records.',
});

