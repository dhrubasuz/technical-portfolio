# Triage Lab

Author, creator and maintainer: **Dhruba Poudel**.

An original, dependency-free JavaScript text-classification prototype. It trains a small multinomial Naive Bayes model from fictional support requests, explains word contributions, evaluates unseen fixture records and requires an explicit human category selection. It demonstrates an inspectable machine-learning workflow, not a production helpdesk, an LLM or measured business impact.

## Run and inspect

This implementation lives in `dist/ai-lab/` in the `technical-portfolio` repository. Serve the repository's `dist/` directory through a static HTTP server and open `/ai-lab/`. No package installation, build step, credentials or backend service is required.

Runtime files:

```text
dist/ai-lab/index.html
dist/ai-lab/triage.css
dist/ai-lab/triage.js
dist/ai-lab/data/model.js
dist/ai-lab/data/fixtures.js
```

Retain these source/verification files in the same directory for inspectability:

```text
dist/ai-lab/README.md
dist/ai-lab/data/model.test.mjs
dist/ai-lab/evaluate.mjs
dist/ai-lab/evaluation-snapshot.json
```

The return link leads to the portfolio's selected-work section. Browser imports use `.js` to support the static host's JavaScript MIME handling. The `.mjs` files are Node-only checks.

From the portfolio repository root, using Node 24 or another runtime that supports ES modules in these files:

```sh
node --test dist/ai-lab/data/model.test.mjs
node dist/ai-lab/evaluate.mjs
node scripts/check_site.mjs
```

Alternatively, run the first two commands from this folder as `node --test data/model.test.mjs` and `node evaluate.mjs`. The evaluation script writes only the local `evaluation-snapshot.json`, with Dhruba Poudel as author and SHA-256 fingerprints of the model and fixture sources. It performs no network operation.

## The fitted model

- Four categories: account access, device, connectivity and business application.
- Case-normalised English alphanumeric word counts; no stemming, embeddings or stop-word removal.
- Vocabulary, class priors and word frequencies fitted to **training records only**.
- Multinomial Naive Bayes with Laplace smoothing, α = 1, and log-space scoring.
- Relative score bars are normalised class likelihood scores. They are **not calibrated confidence** or an out-of-domain probability.
- Word explanations show each recognised term's contribution to the log-score difference between the leading category and runner-up. The prior contribution plus all word contributions reconciles to that score gap.
- A separate fixed heuristic flags fewer than two distinct known terms, known-word coverage below 45%, or a mean leading score gap below 0.25 per known word occurrence. This is a review policy, not a learned detector. It was fixed before inspecting evaluation outcomes.

Naive Bayes assumes conditional independence of features given a category. Word order, negation and real-world meaning are not modelled. Common words, repeated words, unfamiliar phrasing and mixed requests can mislead the model. Unknown words are disclosed and ignored in scoring. Empty and entirely unfamiliar requests produce no suggested category.

## Dataset and first fixed results

All examples are hand-authored fictional teaching fixtures. The partitions were authored independently of the implementation's evaluation outcomes and were not edited to improve scores.

| Partition | Records | Purpose |
| --- | ---: | --- |
| Training | 40 | Ten requests per category; fits 207 word types. |
| Validation | 12 | Three per category; separate diagnostic check. No threshold tuning performed. |
| Held-out evaluation | 20 | Five per category; full classification and review-policy metrics. |
| Separate challenges | 8 | Empty, unknown, out-of-scope, mixed, negated, instruction-like and non-English input. |

The first fixed evaluation gives:

- **16/20** correct top categories (**80%**), compared with the majority-class baseline of **5/20** (**25%**). Macro F1 is approximately **0.7985**.
- The review heuristic flags **10/20**. Among the ten that pass, **9/10** match their fixture label. One incorrect suggestion passes the gate.
- Validation gives **12/12**, with five flagged. This tiny synthetic result is not operational evidence.
- **7/8** separate challenges are flagged; instruction-like challenge `CH-06` passes the gate. Mandatory human selection still applies.

Observed held-out errors are retained: `TE-D03` device → application, `TE-D04` device → connectivity, `TE-N03` connectivity → application, and `TE-S03` application → device. `TE-N03` is the incorrect suggestion that passes the simple gate. All twenty evaluation outcomes and all eight challenges remain inspectable in the page and snapshot.

No test example is silently excluded from overall accuracy, precision, recall or F1. Review coverage and selected-subset accuracy are reported separately. If a future fixture yields no suggestion, it remains in the accuracy denominator and its actual class's recall denominator; matrix totals plus no-suggestion count reconcile to the full set.

These results describe one small synthetic demonstration. The author, vocabulary overlap and limited examples prevent independent generalisation claims. Duplicate checks detect repeated IDs and identical tokenised text; they do not prove semantic independence or detect every near-paraphrase. No real support-ticket dataset or employer performance is represented.

## Human review and data boundary

The category dropdown starts empty and resets after every suggestion. A user must select a category and submit the review form. Editing the request invalidates its previous suggestion and disables recording until it is classified again. Model output does not create a review record. Choosing a different category is supported and visibly distinguished.

Up to six decisions live only in page memory. Clearing or refreshing discards them. This is a review exercise, not authentication, durable approval, an immutable audit log, automatic routing or an external ticket integration.

The page uses no external fonts, dependencies, APIs, analytics, cookies or persistent storage. Static assets are loaded from the serving host; entered text is not transmitted by the demo. Use fictional information when presenting the public page. The browser may independently restore form values on reload or history navigation. Hosting-level logging and the browser itself are outside this application's data-processing claim.

## Verification

The substantive Node suite covers hand-calculated priors, likelihoods and scores; explanation reconciliation; numerical stability; case/punctuation behaviour; unknown and empty inputs; review policies; input bounds; partition checks; training-only fitting; precision/recall/F1 arithmetic; no-suggestion accounting; full-versus-selected evaluation denominators; explicit human decisions; and static dependency/rendering boundaries.

**21 tests pass** on the isolated implementation. This does not establish browser layout or interaction quality.

Browser checks are separate from the Node suite:

1. Desktop and narrow/mobile layout, no body overflow, legible tables and clear focus states.
2. Start-up without console errors or failed asset loads; no request-text API traffic.
3. All six fictional examples, edited text, blank input and unfamiliar input.
4. Human select starts empty; editing invalidates the suggestion; a deliberate override is shown in the local list; no duplicate review without a new suggestion.
5. Six-decision limit, clear-list action and refresh resetting state.
6. Every held-out row and challenge, metric reconciliation and source/return links.
7. Keyboard operation, labels, status announcements and table navigation.

## Method references

- [scikit-learn: Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html) — supervised learning, multinomial text classification, smoothing and the limitations of probability estimates.
- [scikit-learn: classification report](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html) — precision, recall, F1, support and macro averages.

The implementation is original JavaScript, not a bundled or purported scikit-learn runtime.
