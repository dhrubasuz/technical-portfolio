# Quality and publication evidence

Author: **Dhruba Poudel**.

This guide describes the checks to complete and the evidence to retain. It does not assign a subjective score or imply that an unperformed check has passed.

## Keep the evidence attached to a revision

For each publication, record the repository commit, tested URL or local path, date, browser/device size, commands run, result and any limitations. A successful local test, successful hosted check and published release are different facts.

Use fictional fixtures and screenshots. Keep credentials, private repositories, employer/client information, local databases and normal application data out of commits and public demonstrations.

## Static portfolio checks

- Serve `dist/` and follow all sixteen selected projects through their linked case/demo pages, including `/lab/` and `/ai-lab/`. The paired commercial product websites count as one anonymous project case; Commerce Reconcile and Commerce Canvas form one WordPress engineering/design case.
- Verify internal navigation, external project links, image paths, page titles and readable text.
- Check desktop and narrow/mobile layouts, keyboard focus, navigation order and colour contrast.
- Confirm that buttons and links do what their labels promise and that external/private-source boundaries are clear.
- Inspect the browser console and network failures. Test the published URL as well as the local files before reporting it as live.

These checks require browser inspection. A successful data test command does not establish that the portfolio pages work correctly.

## Broader practice and anonymous cases — 29 October 2026

- The collection contains sixteen project entries, with three selected evidence cards and six professional-practice areas. Hosting entries, editorial workstreams, application versions and individual test suites are not counted as separate delivered projects.
- Confirm the new mobile filter, reset/search behaviour and count across the compact additions, detailed cases and supporting collection. Keep all three project collections keyboard reachable and narrow-screen readable.
- Scan visible copy, hidden search terms, page metadata, links, asset paths and original images for client identifiers. Fuzion Driving School is the named exception, retaining its public website link, public homepage capture and original architecture diagrams. Other commercial cases use generic titles and original diagrams. My own projects retain their names. Do not publish other client screenshots, private source or operational records.
- Keep SlingBurst's 23 September 2026 signed Android candidate and 188 checks explicitly dated. Device acceptance, final package/certificate inspection and Google Play publication remain separate.
- Keep Purano Maidan's 28 August 2026 app UAT and separate API suite distinct; do not automatically add the counts. Preview pages do not establish accepted merchant, notification or production workflows.
- The anonymous commerce-pricing case describes installed staging theme/plugin work and a no-payment quote journey. A paused price feed, draft catalogue and pending owner acceptance must not become a live-commerce claim.
- Root publication verification must follow source/privacy review, static checks, browser responsive/link inspection and deployment read-back. These editorial notes do not themselves claim that those release checks have run.

## Evidence snapshots added on 29 October 2026

- The three evidence cards are a separate homepage section, not additional entries in the sixteen-project collection. Project filtering and the displayed project count retain their existing scope.
- Each landing page has Dhruba Poudel authorship metadata, its own canonical URL, a matching Open Graph cover, one primary heading, labelled section navigation and explicit verification boundaries.
- The automation snapshot uses the 17-field schema and four validation areas from the current workflow. It does not attribute tests from a different version or application to that workflow, and it leaves time savings unclaimed until comparable paired measurements exist.
- The web-delivery snapshot links an anonymous paired product-website case with no client names or direct client URLs. A delivery count is not presented as conversion, revenue or performance uplift.
- A separate mobile Lighthouse baseline names the portfolio homepage, single-run setup, timestamp and pre-evidence-section scope. Its category scores and lab metrics are not attributed to client websites or presented as real-user data.
- The engineering snapshot separates 81 domain/store/HTTP/transport tests, 29 simulated-DOM UI tests and seven hosted recovery scenarios. Fictional demo outcomes are not presented as a production success rate.
- Before publishing, run the static-site checker after the three cover images and sanitised automation JSON are in place. Inspect the homepage cards and each landing page at desktop and narrow widths, follow the evidence links and verify the deployed URLs. This note records the content boundaries; it does not claim those publication checks have already run.

## Trust Boundary Lab publication checks

The [technical article](dist/articles/payment-workflow-security.html) and [original Node.js lab](https://github.com/dhrubasuz/trust-boundary-lab) belong to a separate teaching-code release. Its documented regression suite contains **41 passing tests**. Keep that result attached to the lab source hashes and verification record; do not add it to this portfolio's existing data/model test count.

Before publication, run the lab's documented test and demonstration commands against the bundled source. Confirm the article, public repository and downloaded ZIP refer to the same reviewed implementation. Inspect the article's original code blocks, explanatory cover, attribution and links on desktop and narrow layouts. The project cover is an original explanatory diagram, not an application screenshot.

Preserve the distinction between the verified 2018 Facebook acknowledgement and this independently designed fictional model. State that the code uses an in-memory synchronous store, a simulated worker and standalone DOM/CSRF examples. Neither promise-scheduled tests nor the article establish distributed transactions, real browser exploit validation, a deployed authentication pipeline, payment processing or historical exploit details. Retain actual publication and CI evidence separately from local checks.

## RouteLab checks

RouteLab is a separate [React/TypeScript network simulator](https://github.com/dhrubasuz/route-lab), presented through a [portfolio case study](dist/cases/route-lab.html). Its public application is deployed under a scoped `/route-lab/` directory, while the source, build and application tests are maintained in its own repository. Do not infer application verification from this portfolio's static checks.

For a RouteLab release, retain the exact source revision, application build, test result and published URL. Its engine checks should establish unsigned IPv4/CIDR boundaries; prefix/metric/ID route selection; actual next-hop adjacency; mutual subnet membership; disabled links and devices; forwarding-only devices; first-match stateless firewall rules; independent response evaluation; TTL-bounded loops, including a revisit to the original source; immutable inputs; focused repair; and bounded, malformed or hostile JSON rejection.

In the actual browser, complete all eight supplied scenarios, inspect the selected rule/route and failing phase, make a manual configuration change, apply the focused repair, and rerun. Export and reimport a supported topology, inspect the diagnostic export, and confirm that changing configuration invalidates an earlier displayed result. Check packet playback, keyboard operation, mobile layout, reduced-motion behaviour, clear error states and external project links.

Use original screenshots of the actual interface. Label all data fictional and all transit costs modelled. Do not present a successful simulated packet as evidence of a reachable real service, actual packet capture, TLS success, full router/firewall emulation, production security or measured business savings. Keep the supported model and omissions explicit.

## Exception Studio evidence

Exception Studio is a separate [React/TypeScript, Node 24 and SQLite application](https://github.com/dhrubasuz/exception-studio), linked through its [case study](dist/cases/exception-studio.html). Its database and service are not bundled into the static portfolio.

**Team Edition runtime evidence, 28 October 2026: 110 tests passed — 81 domain/store/HTTP/transport tests and 29 UI tests.** The [public verification record](https://github.com/dhrubasuz/exception-studio/blob/main/docs/LIVE_VERIFICATION.md) identifies the tested runtime commit, successful CI run and all seven exported live traces. Tests include Classic Edition as well as the new team workflow.

From the Exception Studio checkout, using the repository-pinned Node and pnpm versions:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm format:check
pnpm audit --prod
```

Automated assertions cover roles and tenant boundaries, command idempotency, stale/concurrent decisions, durable claims and lease fencing, bounded retries and Retry-After, schema repair, outage replay, lost-response receipt deduplication, expiry, restart recovery, full-body deadlines and client recovery. Passing tests are evidence for their asserted boundaries, not a complete accessibility or security audit.

**Live HTTPS Team Edition verification, 28 October 2026:**

- Healthy handoff, rate limit, source timeout, schema drift, duplicate event, upstream outage and lost delivery response all completed through the actual interface.
- Final totals: seven delivered jobs, seven destination writes, one duplicate, 21 connector attempts and six retries. These are fictional walkthrough observations, not throughput or business-impact metrics.
- Downloaded source and receipt hashes independently recomputed and matched for all seven traces.
- Distinct analyst and approver actor IDs were retained. The same visitor controlled both fictional accounts; this is not independent human approval.
- Desktop and 390 px mobile layouts had no page overflow. Another tab resumed the current account and delivered jobs. Activity expansion exposed older events.
- The runtime database's public URL returned NOT_FOUND. The retained `/classic` route loaded its 22-row fictional import.

Before reporting a future release as verified, rerun the appropriate suite and browser checks against its exact commit and deployment. Keep the publication's source revision distinct from this earlier runtime evidence. Retain no credentials, session tokens, application keys or real business data in screenshots/traces.

The public workspace expires after 24 hours. Jobs execute while the hosted process is running; storage/redeployment may reset state. The bounded SQLite queue is not a distributed broker; trace IDs do not imply an OpenTelemetry installation. Source hashes/history are application guardrails, not tamper-proof audit records. See the application's `SECURITY.md` and architecture notes for the current scope.

The retained **Classic Edition** video and prior 27 October 2026 CSV verification describe the earlier workbench. Its original result was 21 accepted, no held and one excluded record, with matching frozen CSV/manifest SHA-256. The current Team Edition test count must not be presented as that older release's test count.

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

## Anonymous commercial product websites

The paired [Commercial Product Websites case](dist/cases/commercial-product-websites.html) describes two related websites in one design/development project. The public presentation uses generic sector descriptions and original explanatory diagrams. Client names, domains, direct links, branded screenshots and private administration screens are omitted.

Review the case's navigation, diagram readability and mobile layout. Retain delivery/contribution evidence privately, separate from the public repository. Do not infer custom plugin development, search ranking, conversion improvements, accessibility certification or business results without corresponding evidence.

## Named Fuzion Driving School case and anonymous compatibility page

The [Fuzion Driving School case](dist/cases/fuzion-driving-platform.html) retains its original named public website link, homepage capture and architecture diagrams. It distinguishes public website delivery from acceptance of protected customer/operator workflows, message receipt, timed reminders or live card payments. Private source and operational records stay private. The earlier anonymous [Service Booking Platform page](dist/cases/service-booking-platform.html) remains available as an unlinked compatibility case.

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
