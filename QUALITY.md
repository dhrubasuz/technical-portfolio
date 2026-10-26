# Quality and publication evidence

Author: **Dhruba Poudel**.

This guide describes the checks to complete and the evidence to retain. It does not assign a subjective score or imply that an unperformed check has passed.

## Keep the evidence attached to a revision

For each publication, record the repository commit, tested URL or local path, date, browser/device size, commands run, result and any limitations. A successful local test, successful hosted check and published release are different facts.

Use fictional fixtures and screenshots. Keep credentials, private repositories, employer/client information, local databases and normal application data out of commits and public demonstrations.

## Static portfolio checks

- Serve `dist/` and open the homepage, all three case studies and `/lab/`.
- Verify internal navigation, external project links, image paths, page titles and readable text.
- Check desktop and narrow/mobile layouts, keyboard focus, navigation order and colour contrast.
- Confirm that buttons and links do what their labels promise and that external/private-source boundaries are clear.
- Inspect the browser console and network failures. Test the published URL as well as the local files before reporting it as live.

These checks require browser inspection. A successful data test command does not establish that the portfolio pages work correctly.

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

## Before publishing a repository

- Confirm that profile, README, website and case-study statements describe the same current contribution and project stage.
- Confirm the repository licence and retain required upstream and asset attribution.
- Re-run checks relevant to the final changes and retain their actual results.
- Review changes for private data and unintended generated files.
- Record the final public URL and commit. Keep unresolved limitations explicit.

Maintained by **Dhruba Poudel**.
