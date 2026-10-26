# Dhruba Poudel — Portfolio

Practical work across software development, automation, data analysis and IT operations.

This repository contains a buildless portfolio website, eleven selected projects, and browser-based data and machine-learning demonstrations. Separate application repositories provide the full-stack implementations. Public examples use fictional information. Employer systems, client data and private project source are not bundled here.

## Live portfolio

[Visit the portfolio](https://about.dhrub.com.np) · [Try Data Workbench](https://about.dhrub.com.np/lab/) · [Try Triage Lab](https://about.dhrub.com.np/ai-lab/)

[Try Exception Studio](https://studio.dhrub.com.np/) · Hosted fictional-data workflow verified **27 October 2026**. This is a separate full-stack application; source and local run instructions are in [its repository](https://github.com/dhrubasuz/exception-studio).

## Explore the work

| Project | Purpose | Scope |
| --- | --- | --- |
| [FigureRelay](https://github.com/dhrubasuz/FigureRelay) | Keep linked figures consistent across reports and presentations, then review and export an exact revision. | Separate local Python/FastAPI, SQLite and React/TypeScript prototype; Apache-2.0. |
| [Exception Studio](dist/cases/exception-studio.html) | Preserve an operational source, resolve exceptions with reasons and freeze a reviewed CSV with a manifest. | Live React/TypeScript, Node 24 and SQLite demonstration; bundled fictional fixtures and anonymous 24-hour sandboxes. Hosted walkthrough verified 27 October 2026. |
| [DataWorkbench](dist/lab/index.html) | Inspect a fictional service-operations dataset, validate CSV rows, explore metrics and review exceptions. | HTML/CSS/JavaScript demonstration; data processing stays in browser memory. |
| [PocketArcade](https://arcade.suzata.com.np) | Explore a browser-game collection with Relaxed/Classic play pace and device-local best scores. | Existing public browser demonstration; its private source is not copied into this repository. |
| [Fuzion Driving School](https://fuziondrivingschool.com.au/) | Connect a responsive service website to developed booking and learner/instructor workflows. | Live public website; signed-in operational acceptance is separate. Private source. |
| [Commerce Reconcile & Commerce Canvas](dist/cases/commerce-reconcile.html) | Review commerce-event differences with an original WordPress plugin and PHP engine; explore a custom theme and brand system. | Original public source, fictional-data PHP demo and static theme preview. Actual local WordPress/WooCommerce execution documented separately. |
| [Zamtas websites](dist/cases/zamtas-websites.html) | Present specialist corporate/door-system information and a separate traffic-products catalogue. | Website design and development; two public WordPress websites presented as one paired case. Private source and operational records remain separate. |
| [MRR Free Tools](https://tools.dhrub.com.np/) | Support everyday document, image and data tasks in a TypeScript browser workspace. | Live guide and application; supported local-file workflows have documented format/network limits. Private source. |
| AlloyPDF | Integrate document workflows into a dedicated React/TypeScript PDF workspace. | Internal development build; local browser tools and private-service foundations have separate availability. Private source; open-source engines credited. |
| Helpdesk Air | Connect queues, configurable workflows, service targets and persisted operational reporting. | Controlled Python/FastAPI/PostgreSQL test environment; separate Zammad self-hosted package. Private source and records. |
| [Triage Lab](dist/ai-lab/index.html) | Train an inspectable text classifier, evaluate its suggestions and require a human category choice. | Original JavaScript multinomial Naive Bayes; small fictional fixtures, no external API or automated dispatch. Educational prototype. |

The website's [case studies](dist/index.html) explain the problem, personal contribution, technical approach and current boundaries of each project. A public demonstration is not a claim of production qualification, enterprise security controls or mobile app-store publication.

## Development and design capabilities

I build custom WordPress themes and plugins, integrate APIs, and develop responsive websites and WooCommerce stores with payment integrations. I also create logos and brand identities.

These capabilities match my LinkedIn About and Skills sections. Individual case studies describe the contribution and delivery stage for that project.

## Run the portfolio locally

The website uses HTML, CSS and vanilla JavaScript. There is no package installation or build step. Serve `dist/` through a static HTTP server so both demonstrations' ES modules load correctly.

With Python 3 installed, run from the repository root:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8000/` for the portfolio, `/lab/` for DataWorkbench and `/ai-lab/` for Triage Lab. Stop the server with Ctrl+C. A static host can publish the same `dist/` directory; no backend service is required for these pages.

FigureRelay and Exception Studio are separate applications. Follow [FigureRelay's instructions](https://github.com/dhrubasuz/FigureRelay) or [Exception Studio's instructions](https://github.com/dhrubasuz/exception-studio) rather than expecting their services to run inside this static site.

## Exception Studio evidence

Exception Studio connects a real same-origin HTTP API to persistent SQLite state. It retains original source values separately from corrections, requires explicit decisions for original exceptions, rejects stale revisions, replays matching idempotent commands, and freezes CSV bytes with reconciliation counts and SHA-256 values.

On **27 October 2026**, its **48 automated checks passed: 35 domain/store/HTTP checks and 13 UI checks**. They cover concurrent decisions, invalid-correction rollback, exact retry replay, source immutability, frozen downloads after a database reopen, isolation and limits, and client recovery from stale or uncertain responses. UI checks use a simulated DOM; browser and hosted checks are retained as separate evidence, and full accessibility conformance is not claimed.

The **public HTTPS walkthrough was verified on 27 October 2026**: import 22 fictional rows, complete six explicit decisions, and publish revision 7 with 21 accepted, 0 held, 1 excluded and 1,405 accepted minutes. The downloaded 1,270-byte CSV's SHA-256 matched its manifest. The host-only `__Host-` cookie had `Secure`, `HttpOnly` and `SameSite=Lax`; the checked browser run produced no warning or error. This is evidence for that demonstrated workflow, not every possible hosted failure case.

Only bundled fictional fixtures are accepted. Review notes reach the server and must remain fictional. Anonymous sandboxes expire after 24 hours, public storage may reset on redeployment, and application cleanup does not promise secure erasure. There are no verified organisational approval identities or production-service claims. See the [case study](dist/cases/exception-studio.html) and [application security scope](https://github.com/dhrubasuz/exception-studio/blob/main/SECURITY.md).

## Commercial website evidence

The paired Zamtas case showcases the website design and development by Dhruba Poudel for [zamtas.com.au](https://zamtas.com.au/) and [zamtastraffic.com.au](https://zamtastraffic.com.au/). It uses public homepage images and an original experience map, without publishing private administration screens or claiming measured business results.

Fuzion's public website is live; signed-in acceptance and actual notification receipt are separate. Two private scheduling-domain suites were freshly checked on **27 October 2026: 14 tests passed**, covering Sydney daylight-saving transitions, closures, recurring selections, booking conflicts and package-price allocation. The **230 checks** reported in the **9 October release record** are historical evidence from that release, not the count rerun on 27 October. No real bookings or provider workflows were exercised by the fresh domain check.

## DataWorkbench demonstration

The included service-operations information is fictional and uses a fixed **26 October 2026** snapshot. It is intended to demonstrate data-handling decisions, not anyone's operational performance.

The demonstration supports:

- CSV parsing and validation of required fields, dates, allowed values, duplicate records, effort and resolution information.
- A source-row/line exception report and reconciliation between accepted and held records.
- Date, channel, priority and text filters; backlog, overdue and status summaries; ageing/status drilldowns; and a paginated record register.
- Downloads for the sample, accepted records, exceptions and the filtered register, with spreadsheet-formula neutralisation in exports.

Selecting a CSV processes its contents in browser memory; the application provides no backend upload endpoint or account system. Do not use confidential information when demonstrating the public site. Review accepted records and exceptions before relying on an output; passing these checks does not prove the source data is correct.

## Triage Lab demonstration

Triage Lab is an original, dependency-free JavaScript implementation of multinomial Naive Bayes. It fits word counts, class priors and smoothed likelihoods to 40 fictional requests; 12 validation records, 20 held-out requests and eight separate challenges do not enter the fitted vocabulary. Relative score bars are explicitly uncalibrated. A separate fixed heuristic flags weak evidence, and a person must choose the category in every case.

The first fixed held-out evaluation produces **16/20 correct top categories**, compared with the majority-class baseline of **5/20**, with macro F1 approximately **0.7985**. Ten requests are flagged by the simple review gate. One incorrect suggestion passes that gate; seven of eight separate challenges are flagged. Every outcome remains visible. These small synthetic results demonstrate the implementation and do not establish operational accuracy or business impact.

Input and up to six human decisions remain in page memory. The demo has no API, persistent storage or ticket integration, and model output does not dispatch work. Its [method and verification notes](dist/ai-lab/README.md) document the fixtures, observed errors, limitations and checks. The [evaluation snapshot](dist/ai-lab/evaluation-snapshot.json) records source fingerprints and reproducible results.

## Check the logic

With Node.js available, run from the repository root:

```sh
node --test dist/lab/data/core.test.mjs
node --test dist/ai-lab/data/model.test.mjs
node dist/ai-lab/evaluate.mjs
node scripts/check_site.mjs
```

These commands check data logic, model arithmetic, evaluation and static references. The evaluation command regenerates the local snapshot without changing the fitted fixture. They do not certify keyboard behaviour, responsive layout, browser downloads or accessibility. The [quality guide](QUALITY.md) separates those checks and explains what evidence to retain.

## About the author

**Dhruba Poudel** is a Business Systems Analyst working across development, automation, data and IT service delivery. He holds a Master of Information Technology from Charles Sturt University. Facebook acknowledged his responsible vulnerability disclosure in its 2018 White Hat Hall of Fame.

[LinkedIn](https://www.linkedin.com/in/poudeldhruba/) · [GitHub](https://github.com/dhrubasuz) · [Archived Facebook acknowledgement](https://web.archive.org/web/20181204041319/https://www.facebook.com/whitehat/thanks/)

## Attribution and boundaries

Linked projects and third-party components retain their own licences and notices. This portfolio does not claim ownership of upstream software. Historical store links, third-party badges and test results must not be presented as results for a different project or revision.

Maintained by **Dhruba Poudel**.
