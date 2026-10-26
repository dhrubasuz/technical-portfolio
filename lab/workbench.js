import {
  AS_OF, LIMITS, COLUMNS, AGE_BUCKETS, parseCsv, validateRecords, filterTickets,
  ticketMetrics, decisionInsight, dateNumber, toCsv, exceptionsCsv,
} from './data/core.js';
import { SAMPLE_CSV, FIXTURE_METADATA } from './data/fixtures.js';

const $ = id => document.getElementById(id);
const state = { result: null, name: FIXTURE_METADATA.name, sample: true, run: 0, drill: null, page: 1, visible: [], base: [], busy: false };
const PAGE_SIZE = 10;
const EXCEPTION_PREVIEW = 12;
const number = value => new Intl.NumberFormat('en-AU').format(value);
const date = value => value ? new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z')) : '—';
const announce = message => { $('announcer').textContent = ''; requestAnimationFrame(() => { $('announcer').textContent = message; }); };
const element = (tag, text, className) => {
  const item = document.createElement(tag);
  if (text !== undefined) item.textContent = text;
  if (className) item.className = className;
  return item;
};
const preview = (value, length = 160) => {
  const text = String(value ?? '');
  return text.length > length ? text.slice(0, length) + '…' : text;
};

function setTab(name, focus = false) {
  for (const view of ['quality', 'operations']) {
    const selected = view === name;
    $(view + '-tab').setAttribute('aria-selected', String(selected));
    $(view + '-tab').tabIndex = selected ? 0 : -1;
    $(view + '-panel').hidden = !selected;
  }
  if (focus) $(name + '-tab').focus();
}
for (const view of ['quality', 'operations']) {
  $(view + '-tab').addEventListener('click', () => setTab(view));
  $(view + '-tab').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'quality' : event.key === 'End' ? 'operations' : view === 'quality' ? 'operations' : 'quality';
    setTab(next, true);
  });
}
$('explore-data').addEventListener('click', () => { setTab('operations', true); $('workspace').scrollIntoView({ block: 'start', behavior: 'smooth' }); });

function setBusy(busy) {
  state.busy = busy;
  $('workspace').classList.toggle('busy', busy);
  $('workspace').setAttribute('aria-busy', String(busy));
  $('loading-state').hidden = !busy;
  $('csv-file').disabled = busy;
  $('load-sample').disabled = busy;
}

async function runCheck(csv, name, sample) {
  setBusy(true);
  $('error-banner').hidden = true;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  try {
    const parsed = parseCsv(csv);
    const result = validateRecords(parsed);
    state.result = result;
    state.name = name;
    state.sample = sample;
    state.run += 1;
    state.drill = null;
    state.page = 1;
    $('filters').reset();
    renderQuality();
    renderOperations();
    announce('Run ' + state.run + ' complete. ' + result.summary.accepted + ' accepted, ' + result.summary.rejected + ' held for review. Source totals reconcile.');
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
    $('csv-file').value = '';
  }
}

function showError(error) {
  $('error-message').textContent = error instanceof Error ? error.message : 'Please check the file format and try again.';
  $('error-banner').hidden = false;
  announce('File could not be processed. The previous completed dataset is unchanged.');
}

$('csv-file').addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file || state.busy) return;
  if (!/\.csv$/i.test(file.name)) { showError(new Error('Choose a file with the .csv extension.')); event.target.value = ''; return; }
  if (file.size > LIMITS.bytes) { showError(new Error('This file is too large. Use a CSV up to 1 MB.')); event.target.value = ''; return; }
  setBusy(true);
  $('error-banner').hidden = true;
  try {
    const bytes = await file.arrayBuffer();
    let csv;
    try { csv = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { throw new Error('The file is not valid UTF-8 text. Save it as UTF-8 CSV and try again.'); }
    await runCheck(csv, file.name, false);
  } catch (error) {
    showError(error);
    setBusy(false);
    event.target.value = '';
  }
});

$('load-sample').addEventListener('click', () => runCheck(SAMPLE_CSV, FIXTURE_METADATA.name, true));

function download(name, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = element('a');
  link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce(name + ' downloaded. Data was generated in this browser.');
}
$('download-sample').addEventListener('click', () => download('fictional-service-tickets-sample.csv', SAMPLE_CSV));
$('download-clean').addEventListener('click', () => state.result && download('accepted-tickets-run-' + state.run + '.csv', toCsv(state.result.accepted)));
$('download-exceptions').addEventListener('click', () => state.result && download('exceptions-run-' + state.run + '.csv', exceptionsCsv(state.result)));
$('export-view').addEventListener('click', () => download('ticket-view-' + AS_OF + '.csv', toCsv(state.visible)));

function renderQuality() {
  const result = state.result, summary = result.summary;
  $('dataset-name').textContent = state.name;
  $('run-state').textContent = 'Run ' + String(state.run).padStart(2, '0') + ' · complete';
  const extra = result.extraColumns.length ? ' ' + result.extraColumns.length + ' extra columns excluded: ' + result.extraColumns.slice(0, 6).map(column => preview(column, 32)).join(', ') + (result.extraColumns.length > 6 ? '…' : '') + '.' : '';
  const blank = result.blankRows ? ' ' + result.blankRows + ' blank ' + (result.blankRows === 1 ? 'line ignored.' : 'lines ignored.') : '';
  $('run-note').textContent = (state.sample ? FIXTURE_METADATA.provenance : 'Your local file. No data is uploaded or stored after this page closes.') + blank + extra;
  $('source-count').textContent = number(summary.source);
  $('accepted-count').textContent = number(summary.accepted);
  $('rejected-count').textContent = number(summary.rejected);
  $('quality-badge').textContent = summary.rejected;
  $('operations-badge').textContent = summary.accepted;
  $('reconciliation-text').textContent = number(summary.source) + ' source records = ' + number(summary.accepted) + ' accepted + ' + number(summary.rejected) + ' held. Totals reconcile.';
  $('download-clean').disabled = summary.accepted === 0;
  $('download-exceptions').disabled = summary.rejected === 0;
  $('exceptions-description').textContent = summary.rejected
    ? 'Every held record includes its source line and all validation reasons.'
    : summary.source ? 'Every source record passed this schema check.' : 'The file contains headers but no data records.';
  $('exception-total').textContent = number(summary.issues) + ' ' + (summary.issues === 1 ? 'issue' : 'issues') + ' across ' + number(summary.rejected) + ' rows';
  $('exceptions-table-wrap').hidden = summary.rejected === 0;
  $('no-exceptions').hidden = summary.rejected !== 0;
  $('no-exceptions').querySelector('p').textContent = summary.source
    ? 'Every source record passed the rules for this schema and snapshot.'
    : 'The schema is valid, but this file has no data records to explore.';
  const body = $('exceptions-body');
  body.replaceChildren();
  result.rejected.slice(0, EXCEPTION_PREVIEW).forEach(row => {
    const tr = element('tr');
    const source = element('td', undefined, 'source-ref');
    source.append(element('strong', 'Row ' + row.record), element('br'), document.createTextNode('Line ' + row.line));
    const id = element('td', preview(row.raw.id, 45) || 'Missing ID', 'record-id');
    const title = element('td', preview(row.raw.title) || '(No title supplied)');
    const reasons = element('td');
    row.issues.forEach(issue => {
      const reason = element('div', undefined, 'exception-reason');
      if (issue.field) reason.append(element('span', issue.field + ': ', 'issue-field'));
      reason.append(document.createTextNode(issue.message));
      reasons.append(reason);
    });
    tr.append(source, id, title, reasons); body.append(tr);
  });
  $('exception-pagination').textContent = summary.rejected > EXCEPTION_PREVIEW
    ? 'Showing the first ' + EXCEPTION_PREVIEW + ' of ' + number(summary.rejected) + ' held rows. Download the exceptions report for every record.'
    : summary.rejected ? 'Source row = data-record number; line = physical starting line in the uploaded CSV. A quoted multiline field can span several lines.' : '';
}

function getFilters() {
  const filters = {
    from: $('date-from').value, to: $('date-to').value,
    channel: $('channel-filter').value, priority: $('priority-filter').value, query: $('search').value,
  };
  if ((filters.from && !Number.isFinite(dateNumber(filters.from))) || (filters.to && !Number.isFinite(dateNumber(filters.to)))) throw new Error('Enter valid dates from 1900 to 2100.');
  if (filters.from && filters.to && filters.from > filters.to) throw new Error('Opened from must be on or before Opened to.');
  if ((filters.from && filters.from > AS_OF) || (filters.to && filters.to > AS_OF)) throw new Error('Use dates on or before the 26 October 2026 snapshot.');
  return filters;
}

function drillRows(tickets) {
  if (!state.drill) return tickets;
  return tickets.filter(ticket => {
    const { kind, value } = state.drill;
    if (kind === 'backlog') return ticket.status !== 'Resolved';
    if (kind === 'overdue') return ticket.status !== 'Resolved' && ticket.due_at < AS_OF;
    if (kind === 'status') return ticket.status === value;
    if (kind === 'age') {
      if (ticket.status === 'Resolved') return false;
      const age = Math.floor((dateNumber(AS_OF) - dateNumber(ticket.opened_at)) / 86400000);
      const bucket = age <= 2 ? AGE_BUCKETS[0] : age <= 7 ? AGE_BUCKETS[1] : age <= 14 ? AGE_BUCKETS[2] : AGE_BUCKETS[3];
      return bucket === value;
    }
    return true;
  });
}

function setDrill(kind, value) {
  if (state.drill?.kind === kind && state.drill?.value === value) state.drill = null;
  else state.drill = kind ? { kind, value } : null;
  state.page = 1;
  renderOperations();
  const label = drillLabel();
  announce(label ? 'Register filtered to ' + label + '. ' + state.visible.length + ' records.' : 'Register drilldown cleared.');
}

function drillLabel() {
  if (!state.drill) return '';
  if (state.drill.kind === 'backlog') return 'Unresolved backlog';
  if (state.drill.kind === 'overdue') return 'Overdue tickets';
  if (state.drill.kind === 'status') return state.drill.value;
  return 'Backlog aged ' + state.drill.value;
}

$('filters').addEventListener('submit', event => event.preventDefault());
for (const id of ['date-from', 'date-to', 'channel-filter', 'priority-filter', 'search']) {
  $(id).addEventListener(id === 'search' ? 'input' : 'change', () => {
    state.page = 1;
    state.drill = null;
    renderOperations();
    if ($('filter-error').hidden) announce(state.base.length + ' tickets match the current filters.');
  });
}
function resetFilters() {
  $('filters').reset(); state.drill = null; state.page = 1; renderOperations(); announce('All filters cleared.');
}
$('filters').addEventListener('reset', () => { queueMicrotask(() => { state.drill = null; state.page = 1; renderOperations(); }); });
$('empty-reset').addEventListener('click', resetFilters);
$('clear-drill').addEventListener('click', () => setDrill(null));
$('review-overdue').addEventListener('click', () => {
  state.drill = { kind: 'overdue' }; state.page = 1; renderOperations();
  $('ticket-table-title').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  announce(state.visible.length + ' overdue tickets in the register.');
});
document.querySelectorAll('[data-drill]').forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.drill;
  if (value === 'Resolved') setDrill('status', 'Resolved');
  else setDrill(value || null);
}));

function renderOperations() {
  if (!state.result) return;
  let filters;
  try {
    filters = getFilters();
    $('filter-error').hidden = true;
    $('date-from').removeAttribute('aria-invalid'); $('date-to').removeAttribute('aria-invalid');
  } catch (error) {
    $('filter-error').textContent = error.message + ' The previous valid view remains shown.';
    $('filter-error').hidden = false;
    $('date-from').setAttribute('aria-invalid', 'true'); $('date-to').setAttribute('aria-invalid', 'true');
    return;
  }
  const tickets = filterTickets(state.result.accepted, filters);
  state.base = tickets;
  const metrics = ticketMetrics(tickets);
  state.visible = drillRows(tickets);
  $('operations-context').textContent = (state.sample ? 'Fictional sample' : 'Local CSV') + ' · ' + number(state.result.accepted.length) + ' accepted rows only';
  $('metric-total').textContent = number(metrics.total);
  $('metric-backlog').textContent = number(metrics.backlog);
  $('metric-overdue').textContent = number(metrics.overdue);
  $('metric-resolved').textContent = number(metrics.resolved);
  $('decision-insight').textContent = decisionInsight(metrics);
  $('review-overdue').hidden = metrics.overdue === 0;
  $('operations-empty').hidden = metrics.total !== 0;
  $('charts').hidden = metrics.total === 0;
  $('export-view').disabled = state.visible.length === 0;
  document.querySelectorAll('[data-drill]').forEach(button => {
    const key = button.dataset.drill;
    const active = !key ? !state.drill : key === 'Resolved'
      ? state.drill?.kind === 'status' && state.drill?.value === 'Resolved'
      : state.drill?.kind === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderCharts(metrics);
  renderTickets();
}

function renderCharts(metrics) {
  const ageing = $('ageing-chart'), statuses = $('status-chart');
  ageing.replaceChildren(); statuses.replaceChildren();
  const max = Math.max(1, ...Object.values(metrics.ageing));
  AGE_BUCKETS.forEach(bucket => {
    const count = metrics.ageing[bucket];
    const button = element('button', undefined, 'age-row');
    button.type = 'button';
    button.setAttribute('aria-label', bucket + ': ' + count + ' unresolved tickets. Filter the register.');
    const active = state.drill?.kind === 'age' && state.drill?.value === bucket;
    button.setAttribute('aria-pressed', String(active)); button.classList.toggle('active', active);
    const label = element('span', bucket);
    const track = element('span', undefined, 'bar-track');
    const fill = element('span', undefined, 'bar-fill');
    fill.style.width = (count / max * 100) + '%'; track.setAttribute('aria-hidden', 'true'); track.append(fill);
    button.append(label, track, element('span', number(count), 'age-number'));
    button.addEventListener('click', () => setDrill('age', bucket));
    ageing.append(button);
  });
  $('status-total').textContent = number(metrics.total) + ' tickets';
  Object.entries(metrics.statuses).forEach(([status, count]) => {
    const button = element('button', undefined, 'status-row'); button.type = 'button'; button.dataset.status = status;
    const active = state.drill?.kind === 'status' && state.drill?.value === status;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', status + ': ' + count + ' tickets. Filter the register.');
    const swatch = element('span', undefined, 'status-swatch'); swatch.setAttribute('aria-hidden', 'true');
    button.append(swatch, element('span', status), element('strong', number(count)), element('small', metrics.total ? Math.round(count / metrics.total * 100) + '%' : '0%'));
    button.addEventListener('click', () => setDrill('status', status));
    statuses.append(button);
  });
}

function renderTickets() {
  const count = state.visible.length, pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * PAGE_SIZE;
  const body = $('tickets-body'); body.replaceChildren();
  state.visible.slice(start, start + PAGE_SIZE).forEach(ticket => {
    const tr = element('tr'), title = element('td');
    const link = element('button', ticket.id, 'ticket-link'); link.type = 'button';
    link.setAttribute('aria-label', 'View ' + ticket.id + ': ' + ticket.title);
    link.addEventListener('click', () => openTicket(ticket));
    title.append(link, element('span', ticket.title, 'ticket-title'));
    const statusCell = element('td');
    statusCell.append(element('span', ticket.status, 'status-pill ' + ticket.status.toLowerCase().replaceAll(' ', '-')));
    const priorityCell = element('td'); priorityCell.append(element('span', ticket.priority, 'priority ' + ticket.priority.toLowerCase()));
    const due = element('td', date(ticket.due_at), 'date-text');
    if (ticket.status !== 'Resolved' && ticket.due_at < AS_OF) { due.classList.add('overdue-date'); due.append(element('span', ' · overdue', 'sr-only')); }
    const age = ticket.status === 'Resolved' ? '—' : Math.max(0, Math.floor((dateNumber(AS_OF) - dateNumber(ticket.opened_at)) / 86400000)) + 'd';
    tr.append(title, statusCell, priorityCell, element('td', ticket.channel), element('td', date(ticket.opened_at), 'date-text'), due, element('td', age, 'date-text'));
    body.append(tr);
  });
  if (!count) {
    const tr = element('tr'), td = element('td', state.drill ? 'No tickets match this drilldown. Clear it to return to the filtered register.' : 'No tickets match the current filters.');
    td.colSpan = 7; td.className = 'small'; tr.append(td); body.append(tr);
  }
  const label = drillLabel();
  $('ticket-table-title').textContent = label || 'Ticket register';
  $('ticket-table-description').textContent = (label ? 'Drilldown of the main filtered dataset. ' : '') + 'Select a ticket ID to inspect the accepted record.';
  $('clear-drill').hidden = !state.drill;
  $('table-count').textContent = count ? 'Showing ' + number(start + 1) + '–' + number(Math.min(start + PAGE_SIZE, count)) + ' of ' + number(count) + ' tickets' : '0 tickets in this register';
  $('page-number').textContent = state.page + ' / ' + pages;
  $('previous-page').disabled = state.page === 1;
  $('next-page').disabled = state.page >= pages;
}
$('previous-page').addEventListener('click', () => { if (state.page > 1) state.page -= 1; renderTickets(); announce('Register page ' + state.page + '.'); });
$('next-page').addEventListener('click', () => { if (state.page < Math.ceil(state.visible.length / PAGE_SIZE)) state.page += 1; renderTickets(); announce('Register page ' + state.page + '.'); });

function openTicket(ticket) {
  $('dialog-title').textContent = ticket.id;
  $('dialog-description').textContent = ticket.title;
  const dl = $('dialog-fields'); dl.replaceChildren();
  const labels = { status: 'Status', priority: 'Priority', channel: 'Channel', opened_at: 'Opened', due_at: 'Due', resolved_at: 'Resolved', effort_minutes: 'Recorded effort' };
  Object.entries(labels).forEach(([key, label]) => {
    const value = key.endsWith('_at') ? date(ticket[key]) : key === 'effort_minutes' ? number(ticket[key]) + ' minutes' : ticket[key];
    const row = element('div'); row.append(element('dt', label), element('dd', value)); dl.append(row);
  });
  $('ticket-dialog').showModal();
}
$('close-dialog').addEventListener('click', () => $('ticket-dialog').close());
$('ticket-dialog').addEventListener('click', event => {
  if (event.target !== $('ticket-dialog')) return;
  const rect = event.target.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
});

runCheck(SAMPLE_CSV, FIXTURE_METADATA.name, true);

