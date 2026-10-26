# Data Workbench

Author and maintainer: **Dhruba Poudel**

An original interactive demonstration that joins a browser-local data-quality workflow to an operational dashboard. The supplied dataset is entirely fictional and deterministic. It contains no employer, employee, customer or financial records.

## Run

Serve the parent portfolio's dist/ directory with a static HTTP server, then open /lab/. ES modules need an HTTP origin; opening index.html directly as a file is not the supported run mode.

This is a buildless application: HTML, CSS and vanilla JavaScript ES modules. It does not use React, a Node server, an API, cloud integration, accounts, cookies or browser storage. Node is used only to run the development tests.

From the portfolio project directory:

~~~text
node --test dist/lab/data/core.test.mjs
~~~

No dependencies need to be installed.

## Try the workflow

1. Open Data quality. The sample has **50 source records = 42 accepted + 8 held for review**.
2. Inspect the eight exceptions: missing title, invalid status, impossible date, negative effort, missing resolution date, invalid channel, and two occurrences of a duplicate ID.
3. Download accepted rows and the exceptions report. The full exceptions report includes record numbers, physical starting lines and all reasons.
4. Open Operations. Filter opened dates, channel, priority or a text search.
5. Select a backlog/overdue/status card, an age bar or a status group to drill into the register. Summary cards and charts continue to show the main filtered view.
6. Open a ticket ID to inspect its accepted record. Export includes all rows in the current register drilldown, not only the visible page.
7. Download the sample, edit it and choose the CSV locally. Malformed files show a clear error and do not replace the previous successful run.
8. Clear filters or restore the sample to return to the original state.

Files are read in the current browser tab's memory. No file content is uploaded, saved to browser storage or sent to an API by this application. Reloading restores the fictional sample.

## Schema and validation

Nine required headers:

~~~text
id,title,status,priority,channel,opened_at,due_at,resolved_at,effort_minutes
~~~

- Headers are trimmed and case-normalised; unknown extra columns are disclosed and excluded from accepted exports.
- IDs use 1–40 letters, digits, underscores or hyphens, normalised to uppercase. **Every occurrence** of a duplicate ID is held.
- Title: 1–160 characters.
- Status: Open, In progress, Resolved.
- Priority: Low, Medium, High, Urgent.
- Channel: Email, Portal, Phone, Chat.
- Dates: real calendar dates in YYYY-MM-DD, from 1900 to 2100.
- Opened and resolved dates cannot exceed the fixed reporting snapshot, **26 October 2026**.
- Due/resolved dates cannot precede the opened date.
- Resolved tickets require a resolution date; unresolved tickets must leave it blank.
- Effort: whole minutes from zero to 1,000,000.
- Column counts must match the header.
- Parser: quoted commas, escaped quotes, multiline fields, BOM and CRLF/LF supported.
- Bounds: 1 MB UTF-8, 2,000 non-blank data rows, 40 columns, 10,000 characters per field.
- Empty files, malformed quotes, invalid UTF-8 and binary control characters fail explicitly.

Blank records are ignored and counted. Source records always reconcile to accepted plus held records. A single held record can have multiple validation issues.

## Reporting definitions

The opened-date filter includes both endpoints. All dates use UTC calendar days.

- **Backlog:** Open + In progress.
- **Overdue:** unresolved with due date before the snapshot. Due on the snapshot is not overdue.
- **Age:** snapshot minus opened date; the chart includes unresolved tickets only.
- **Age groups:** 0–2, 3–7, 8–14 and 15+ calendar days.
- **Status counts:** all accepted records matching the main filters.
- **Decision signal:** computed from the current filtered metrics.

These counts demonstrate the tool's behavior. They are not personal performance, measured savings, SLA compliance, employer outcomes or production-system evidence.

## Safety and limitations

Exports quote every cell and prefix formula-like text with an apostrophe, including values beginning with =, +, -, @ or control whitespace. This changes the exported textual representation intentionally; spreadsheet software and downstream import behavior still need review.

Uploaded values are rendered with text nodes, not HTML. Long exception previews are shortened on screen; the exceptions CSV retains complete bounded field values.

This is a bounded demonstration, not a production ETL service. It has no authentication or immutable audit trail. A schema pass does not prove that a business fact is correct. There is no automatic persistence, multi-user state, live integration or background processing.

Keyboard support includes tab navigation, arrow/Home/End tab switching, native form controls, chart/card buttons, ticket detail dialog with Escape, visible focus and a skip link. Charts expose text counts and descriptive button labels. Responsive layouts, horizontal table regions, live status messages, contrast and reduced-motion styling are included.

## Source layout

- index.html: semantic views and controls.
- workbench.css: responsive styling and print/reduced-motion treatment.
- workbench.js: local UI, upload/download and drilldown orchestration.
- data/core.js: pure parser, validation, filtering, metrics and export functions.
- data/fixtures.js: original reproducible fictional fixture.
- data/fictional-service-tickets.csv: generated from that fixture.
- data/core.test.mjs: Node built-in tests; no third-party test runner.

## Verification

On 26 October 2026, **35 tests passed, zero failed**, including quoted/multiline CSV, malformed input, bounded 2,000-row processing, duplicate handling, date boundaries, reconciliation, safe exports, filters and metric definitions. JavaScript syntax checks passed.

The parent portfolio's final verification record records any browser and deployment checks separately. This README does not imply those checks have occurred.

