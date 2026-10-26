# Quality and publication evidence

Author: **Dhruba Poudel**.

This guide describes the checks to complete and the evidence to retain. It does not assign a subjective score or imply that an unperformed check has passed.

## Keep the evidence attached to a revision

For each publication, record the repository commit, tested URL or local path, date, browser/device size, commands run, result and any limitations. A successful local test, successful hosted check and published release are different facts.

Use fictional fixtures and screenshots. Keep credentials, private repositories, employer/client information, local databases and normal application data out of commits and public demonstrations.

## Static portfolio checks

- Serve `dist/` and follow all ten selected projects through their linked case/demo pages, including `/lab/` and `/ai-lab/`. The paired Zamtas websites count as one project case.
- Verify internal navigation, external project links, image paths, page titles and readable text.
- Check desktop and narrow/mobile layouts, keyboard focus, navigation order and colour contrast.
- Confirm that buttons and links do what their labels promise and that external/private-source boundaries are clear.
- Inspect the browser console and network failures. Test the published URL as well as the local files before reporting it as live.

These checks require browser inspection. A successful data test command does not establish that the portfolio pages work correctly.

## Exception Studio evidence

Exception Studio is a separate [React/TypeScript, Node 24 and SQLite application](https://github.com/dhrubasuz/exception-studio), linked from the static portfolio through its [case study](dist/cases/exception-studio.html). The portfolio does not embed its database or backend service.

**Fresh automated evidence, 27 October 2026: 48 checks passed — 35 backend/domain/HTTP checks and 13 UI checks.** Run the following from the Exception Studio checkout, with Node 24 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
```

The tests assert:

- Source parsing and validation, original source line references, reconciliation, field/date/effort boundaries and spreadsheet-formula neutralisation.
- Sticky human review: clearing another row's duplicate issue does not silently accept its original exception.
- Transaction rollback for an invalid correction, including rows, revision, history and retry allocation.
- Two concurrent HTTP decisions from one expected revision producing exactly one success and one conflict.
- Exact successful-response replay for a matching idempotency key/body, and rejection of changed content under that key.
- Frozen CSV and manifest preservation after edits, another import and reopening the same SQLite database.
- Anonymous sandbox isolation, access expiry, capacity/operation/request limits, cookie/origin checks and static-file boundaries.
- Client recovery for stale edits, uncertain mutation results and an unreadable new-session response that may already have rotated the cookie.

UI checks run in a simulated DOM. Passing them is separate from actual browser operation, accessibility, HTTPS/proxy behaviour and the hosted workflow.

**Public hosted walkthrough verified on 27 October 2026 at https://studio.dhrub.com.np/:**

- The mixed import returned 22 source rows: 16 accepted and 6 held.
- Six explicit decisions produced revision 7: 21 accepted, 0 held, 1 excluded and 1,405 accepted minutes.
- The frozen CSV downloaded as 1,270 bytes. Its SHA-256, `3c0246bac456609b80eafcf1d894e6acbab6c244dd9388a152c8acb9301c5703`, matched the publication manifest.
- The `__Host-` session cookie had host-only scope, `Secure`, `HttpOnly` and `SameSite=Lax` on HTTPS.
- The checked browser workflow produced no warning or error.

These are observations from the completed hosted walkthrough. They do not imply that every automated failure case was also induced on the public runtime, or that an accessibility/security audit has been completed.

For the browser review:

1. Load the mixed fixture: 22 total, 16 accepted, 6 held and 0 excluded. Confirm reasons and original/current values are visible.
2. Follow the repository's documented walkthrough. Confirm 21 accepted, 0 held, 1 excluded and 1,405 accepted minutes for those exact sample decisions.
3. Try publishing while rows remain held; confirm the UI and API block it. Then download the completed CSV and manifest and reconcile their counts.
4. Save a later valid correction. Confirm the current revision advances and the earlier CSV/hash remain unchanged.
5. Use two tabs sharing one session to create a stale edit. Confirm explicit recovery and preservation of the unsaved form until reload. Independent browser sessions should instead remain isolated.
6. Confirm the secure host-only cookie, exact hosted origin and API responses on the deployed runtime. Retain response/header evidence without publishing tokens.
7. Check narrow/desktop layouts, keyboard review, error/status announcements and usable downloads. Save the tested URL, revision, date and limitations.

The public app accepts only bundled fictional fixtures. Notes are stored and must also be fictional. Access expires after 24 hours; the ten-minute/new-session cleanup is not secure erasure, and hosting replacement may reset data. Original-source triggers, hashes and event history are application guardrails, not verified organisational approval or tamper-proof records. Rate limits are in-process and can aggregate visitors behind a reverse proxy. See the application's `SECURITY.md` and architecture notes for the full scope.

## DataWorkbench checks

Run the data-logic suite:

```sh
node --test dist/lab/data/core.test.mjs
```

Then check the browser workflow with fictional information:

1. Load the included sample and reconcile total rows with accepted and held rows. A held row is an exception, not a successfully accepted record.
2. Inspect source-row/line references and validation reasons. Try malformed input, a duplicate identifier, an invalid date and an unsupported value.
3. Apply and reset date, channel, priority and text filters. Confirm that summary figures, charts, drilldowns, the register and downloads use the same selected scope.
4. Confirm that the fixed reporting snapshot is visible and that overdue/ageing calculations are interpreted against that snapshot.
5. Open record details, change pages and download the sample, accepted data, exceptions and filtered register. Inspect the downloaded content and formula-neutralisation behaviour.
6. Check keyboard operation, narrow-screen layout and clear status/error messages.
7. Confirm that local CSV contents are not submitted to a backend endpoint and that refreshing the page does not imply durable storage of an uploaded file.

Do not describe this demonstration as a production service, live operational dashboard, authenticated approval system or immutable audit log.

## Triage Lab checks

Run the model and evaluation checks from the repository root:

```sh
node --test dist/ai-lab/data/model.test.mjs
node dist/ai-lab/evaluate.mjs
```

The 21 model tests cover hand-calculated priors, smoothed likelihoods, log scores and word-evidence reconciliation; numerical stability; unknown/empty inputs; separate review heuristics; input bounds; partition checks; training-only fitting; evaluation denominators and metric arithmetic; explicit human decisions; and runtime dependency/rendering boundaries. The reproducible snapshot contains model/fixture source fingerprints and all prediction outcomes.

The first unchanged fixture yields 16/20 correct held-out top categories, baseline 5/20 and macro F1 approximately 0.7985. Ten held-out requests are flagged; one incorrect prediction passes the gate. Seven of eight challenge requests are flagged. Preserve all four held-out errors and the unflagged challenge, rather than tuning or removing them to improve the display. These are small synthetic implementation results, not independent operational evidence.

Browser verification remains separate:

1. Inspect desktop and narrow-screen layouts, keyboard focus, labels, status announcements and horizontally scrollable tables.
2. Confirm successful model start-up and local asset loading without console errors. The demo must make no API or external dependency request.
3. Try every fictional example, a blank request and unfamiliar text. Check relative-score wording, recognised/unknown terms and closer-review reasons.
4. Confirm the human category starts empty and that edited input invalidates the prior suggestion. Deliberately choose a different category and inspect the recorded distinction. Model output alone must not create a review decision.
5. Confirm the six-decision limit, clear-list action and a reinitialised page clearing the review list. The browser may independently restore form text.
6. Inspect all 20 held-out outcomes and eight challenges. Reconcile matrix, metrics, errors, flagged/pass counts and separate selected-subset results.
7. Verify the homepage's Applied ML filter, Triage Lab card, source link and return navigation after integration and publication.

Do not describe this classical ML prototype as an LLM, generative-AI service, production classifier, autonomous workflow, calibrated confidence estimator or evidence of measured business time savings. It uses fictional data, English word counts and a separate limited review heuristic. No private tickets, real identities or external dispatch are included.

## FigureRelay evidence

FigureRelay is maintained in [its own repository](https://github.com/dhrubasuz/FigureRelay). The [two-revision walkthrough at the reviewed revision](https://github.com/dhrubasuz/FigureRelay/blob/b943615280dc8db9b3ed220dbbab5289b7592c86/docs/demo-walkthrough.md) provides reproducible artifact checks without implying that later revisions have been verified.

Meaningful checks include:

- Backend behaviour tests, frontend tests, type checking and the frontend build.
- A synthetic real-API walkthrough that blocks unapproved export and inspects both Office snapshots.
- Matching Author/Last Modified By, generation identifiers, manifest revision, file sizes and SHA-256 hashes.
- An older approved ZIP remaining byte-identical after a newer source/revision is approved and after application restart.

Office content and metadata checks are distinct from opening Word and PowerPoint to inspect pagination, clipping and layout. Local actor labels do not establish independent identities or a tamper-proof chain of custody. Docker operation remains a separate verification task.

## PocketArcade evidence

Use the [public browser site](https://arcade.suzata.com.np) for the portfolio link. Before describing a particular game or feature as verified, check that game and feature on the current public version. Check instructions, input controls, pause/reset behaviour, responsive layout and the stated score-storage behaviour where applicable.

Do not infer a Play Store/App Store release, a completed test count or access to private source from a working public website. Keep private source private unless a separate, reviewed public version is deliberately prepared.

## Zamtas websites evidence

The paired [Zamtas case](dist/cases/zamtas-websites.html) presents [zamtas.com.au](https://zamtas.com.au/) and [zamtastraffic.com.au](https://zamtastraffic.com.au/) as two public websites within one design/development project. Dhruba Poudel confirmed his design/development contribution. The case uses public homepage images and an original conceptual experience map, not private administration screens.

Review both public sites and the portfolio screenshots for actual navigation, readable product/service information, mobile layout and link behaviour. Distinguish public observation from access to the private implementation. Do not infer custom plugin development, search ranking, conversion improvements, accessibility certification or business results without corresponding evidence. Keep private source, forms, account details and operational records out of publication.

## Fuzion Driving School evidence

Fuzion's live public homepage is distinct from acceptance of signed-in learner/instructor operations, actual message receipt, timed reminders or live card payments. The private source remains private; the public case uses the website and original conceptual diagrams.

Keep these test records separate:

| Evidence date | Actual scope | What may be stated |
| --- | --- | --- |
| 9 October 2026 | The historical release record reports 230 passing checks. | Historical checks attached to that recorded release; not a new rerun. |
| 27 October 2026 | Exactly two private domain suites, `availability.test.js` and `bookingSeries.test.js`, freshly run with Vitest 5.0.0: 14 passed in 568 ms. Environment-file loading was disabled; inspected setup/transitive modules contained no provider workflow. | Fresh unit/domain evidence for the listed scheduling rules only. |

The fresh run covers Sydney daylight-saving wall times, weekend/elapsed-slot filtering, invalid intervals, working windows, team/instructor closures, recurring selections and missing occurrences, passed preferred times, duplicate/mixed-instructor rejection, active-booking conflicts, and fixed-package price allocation/required counts. It used Vitest's `startVitest` API with only those two paths, `run: true`, `fileParallelism: false`, and Vite overrides `envDir: false, envFile: false`.

No private source was published, application server started, provider workflow called or real booking created for that domain run. It does not establish a fresh 230-check pass, transactional database acceptance, actual email/calendar delivery or complete production acceptance. Verify deployed signed-in journeys and approved test-recipient receipt separately before upgrading those claims.

## MRR Free Tools evidence

MRR's public application and guide retain private source and operational records. Supported local-file processing does not establish zero network use or universal format compatibility. Use synthetic files and inspect actual exports before reporting a current workflow as verified. Retain third-party notices and do not publish account or deployment details.

## AlloyPDF and Helpdesk Air evidence

Both pages are source-backed development case studies, with original conceptual diagrams instead of private interfaces. AlloyPDF remains an internal development build: browser-local tools and private Office/signing/writing services have distinct availability, and native source foundations are not signed app releases. Credit the established processing engines and preserve their licences. Helpdesk Air remains a controlled FastAPI/PostgreSQL test environment; its separate Zammad package retains upstream/AGPL provenance. Do not show hosted records or infer production rollout, live external channels, synthetic-only hosted data or measured operational impact.

## Before publishing a repository

- Confirm that profile, README, website and case-study statements describe the same current contribution and project stage.
- Confirm the repository licence and retain required upstream and asset attribution.
- Re-run checks relevant to the final changes and retain their actual results.
- Review changes for private data and unintended generated files.
- Record the final public URL and commit. Keep unresolved limitations explicit.

Maintained by **Dhruba Poudel**.
