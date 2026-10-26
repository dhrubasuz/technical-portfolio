// Author, creator and maintainer: Dhruba Poudel.
import { LABELS, TRAINING, VALIDATION, EVALUATION, CHALLENGES, DATASET_NOTE, DATASET_VERSION } from './data/fixtures.js';
import { trainClassifier, classify, evaluateClassifier, auditPartitions, createReviewDecision, MAX_CHARACTERS } from './data/model.js';

const $ = id => document.getElementById(id);
const name = id => LABELS.find(label => label.id === id)?.name || 'No suggestion';
const percent = value => `${(value * 100).toFixed(1)}%`;
const sampleRequests = Object.freeze({
  access: 'Please reset my forgotten password so I can sign in to my account.',
  device: 'My laptop battery is swollen and the keyboard no longer responds.',
  connectivity: 'The wireless connection drops whenever I join the office network.',
  application: 'The invoice report in the application shows an error when I export it.',
  mixed: 'I cannot sign in after the wireless network disconnects. Is this my account or the connection?',
  unfamiliar: 'Can someone recommend a quiet place to watch the migrating whales?',
});
let model;
let pending = null;
let decisions = [];
let decisionSequence = 0;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}

function announce(text) { $('announcer').textContent = text; }
function setText(id, text) { $(id).textContent = text; }

function makeTable(caption, columns, className) {
  const table = element('table', null, className);
  table.append(element('caption', caption, 'sr-only'));
  const head = element('thead');
  const headRow = element('tr');
  for (const column of columns) { const th = element('th', column); th.scope = 'col'; headRow.append(th); }
  head.append(headRow);
  const body = element('tbody');
  table.append(head, body);
  return { table, body };
}

function renderPrediction(prediction) {
  const topName = name(prediction.topLabel);
  setText('result-title', prediction.topLabel ? topName : 'No category suggestion');
  setText('result-note', prediction.topLabel
    ? `The closest match among these four categories. Compare it with ${name(prediction.runnerUpLabel).toLowerCase()}, then choose your own category.`
    : 'There is not enough familiar text for a useful suggestion. A person must interpret this request.');
  const flag = $('review-flag');
  flag.textContent = prediction.needsReview ? 'Closer review flagged' : 'Human review required';
  flag.className = `pill${prediction.needsReview ? ' flagged' : ''}`;
  $('score-bars').replaceChildren();
  if (prediction.topLabel) {
    for (const [index, score] of prediction.scores.entries()) {
      const row = element('div', null, `score-row${index === 0 ? ' leading' : ''}`);
      const track = element('div', null, 'bar-track');
      track.setAttribute('aria-hidden', 'true');
      const fill = element('div', null, 'bar-fill');
      fill.style.width = `${score.relativeScore * 100}%`;
      track.append(fill);
      row.append(element('span', name(score.id)), track, element('span', percent(score.relativeScore), 'score-value'));
      $('score-bars').append(row);
    }
  }
  const reasons = $('gate-reasons');
  reasons.replaceChildren();
  reasons.hidden = !prediction.needsReview;
  for (const reason of prediction.reasons) reasons.append(element('p', reason));
  setText('coverage-note', `${prediction.knownTokenCount} / ${prediction.tokenCount} word occurrences recognised`);
  $('evidence-terms').replaceChildren();
  for (const evidence of prediction.evidence.slice(0, 7)) {
    const chip = element('span', evidence.term, `term-chip${evidence.contribution < 0 ? ' against' : ''}`);
    const contribution = `${evidence.contribution >= 0 ? '+' : ''}${evidence.contribution.toFixed(2)}`;
    chip.append(element('small', contribution));
    chip.title = `${evidence.count} occurrence(s). ${contribution} contribution to the log-score difference between ${topName} and ${name(prediction.runnerUpLabel)}.`;
    $('evidence-terms').append(chip);
  }
  if (!prediction.evidence.length) $('evidence-terms').append(element('span', 'No recognised words to inspect.', 'small'));
  const unknown = prediction.unknownTerms;
  setText('unknown-note', unknown.length
    ? `Outside the training vocabulary: ${unknown.slice(0, 10).join(', ')}${unknown.length > 10 ? `, and ${unknown.length - 10} more` : ''}. These words do not affect the class scores.`
    : 'Every word in this request appears somewhere in the small training vocabulary. That does not establish that the suggestion is correct.');
}

function updateReviewControl() {
  $('confirm-review').disabled = !pending || !$('human-category').value || decisions.length >= 6;
  if (decisions.length >= 6) setText('review-help', 'The six-decision limit is reached. Clear the local list to continue. Nothing has been dispatched or saved to a server.');
}

function runPrediction(shouldAnnounce = true) {
  try {
    const text = $('request-text').value;
    const prediction = classify(model, text);
    pending = { text, prediction };
    $('human-category').value = '';
    renderPrediction(prediction);
    setText('review-help', 'No option is selected for you. This is a local review exercise, not a ticket approval or audit service.');
    updateReviewControl();
    if (shouldAnnounce) announce(`${prediction.topLabel ? `Suggested category: ${name(prediction.topLabel)}.` : 'No category suggested.'} ${prediction.needsReview ? 'The review gate flags this request.' : 'A person must still choose a category.'}`);
  } catch (error) {
    pending = null;
    setText('result-title', 'Check the request text');
    setText('result-note', error.message);
    updateReviewControl();
    if (shouldAnnounce) announce(error.message);
  }
  setText('character-count', `${$('request-text').value.length.toLocaleString('en-AU')} / 1,200`);
}

function renderDecisions() {
  const body = $('reviews-body');
  body.replaceChildren();
  $('reviews-empty').hidden = decisions.length > 0;
  $('reviews-table-wrap').hidden = decisions.length === 0;
  $('clear-reviews').disabled = decisions.length === 0;
  for (const decision of decisions) {
    const row = element('tr');
    const request = element('td');
    request.append(element('strong', decision.id, 'decision-id'), element('p', decision.text));
    const selected = element('td', name(decision.chosenLabel));
    selected.append(element('span', decision.changed ? 'Human changed the suggestion' : 'Explicit human selection', 'decision-note'));
    row.append(request, element('td', name(decision.suggestedLabel)), selected);
    body.append(row);
  }
}

function metric(label, value, note) {
  const card = element('div', null, 'metric');
  card.append(element('span', label), element('strong', value), element('small', note));
  return card;
}

function renderEvaluation() {
  const evaluated = evaluateClassifier(model, EVALUATION, LABELS);
  const validated = evaluateClassifier(model, VALIDATION, LABELS);
  $('evaluation-metrics').append(
    metric('Top-category accuracy', percent(evaluated.accuracy), `${evaluated.correct} correct / ${evaluated.total} held-out requests`),
    metric('Majority-class baseline', percent(evaluated.baselineAccuracy), `${evaluated.baselineCorrect} / ${evaluated.total}; always choose ${name(evaluated.baselineLabel).toLowerCase()}`),
    metric('Macro F1', evaluated.macroF1.toFixed(3), 'Unweighted mean of the four category F1 scores'),
    metric('Review-gate coverage', percent(evaluated.coverage), `${evaluated.ready} / ${evaluated.total} pass the closer-review gate`),
  );
  setText('evaluation-reconciliation', `${evaluated.total} held-out requests = ${evaluated.correct} correct + ${evaluated.total - evaluated.correct} incorrect top-category predictions. Separately: ${evaluated.ready} pass the gate + ${evaluated.flagged} flagged for closer review. All ${evaluated.total} still require human selection.`);
  const matrix = makeTable('Confusion matrix for all held-out fictional requests', ['Actual / predicted', ...LABELS.map(label => label.name)], 'matrix-table');
  evaluated.matrix.forEach((counts, index) => {
    const row = element('tr');
    const heading = element('th', LABELS[index].name); heading.scope = 'row'; row.append(heading);
    counts.forEach((count, column) => row.append(element('td', count, index === column ? 'diagonal' : '')));
    matrix.body.append(row);
  });
  $('matrix-container').append(matrix.table);
  const perClass = makeTable('Per-category held-out metrics', ['Category', 'Precision', 'Recall', 'F1', 'n'], 'class-table');
  for (const entry of evaluated.perClass) {
    const row = element('tr');
    for (const value of [name(entry.id), percent(entry.precision), percent(entry.recall), entry.f1.toFixed(3), entry.support]) row.append(element('td', value));
    perClass.body.append(row);
  }
  $('class-metrics-container').append(perClass.table);
  setText('selective-note', evaluated.ready
    ? `Among the ${evaluated.ready} suggestions that pass the closer-review gate, ${evaluated.readyCorrect} match the fixture label (${percent(evaluated.selectiveAccuracy)}). This smaller selected subset can hide failures; compare the full results.`
    : 'No held-out request passes this review gate. There is no selected-subset accuracy to report.');
  setText('validation-note', `Separate validation check: ${validated.correct} / ${validated.total} match their labels (${percent(validated.accuracy)}); ${validated.flagged} are flagged for closer review. The fixed thresholds were not tuned against this set or the held-out set.`);
  setText('evaluation-results-summary', `Inspect all ${evaluated.total} held-out predictions — ${evaluated.total - evaluated.correct} errors remain visible`);
  for (const result of evaluated.results) {
    const row = element('tr');
    const request = element('td'); request.append(element('strong', result.id), element('p', result.text));
    const outcome = element('td');
    outcome.append(element('span', result.correct ? 'Correct top category' : 'Incorrect top category', `outcome ${result.correct ? 'correct' : 'incorrect'}`));
    outcome.append(element('span', result.needsReview ? 'Closer review flagged' : 'Passes simple gate; human still required', 'gate-label'));
    row.append(request, element('td', name(result.actual)), element('td', name(result.predicted)), outcome);
    $('evaluation-results').append(row);
  }
  let flagged = 0;
  for (const challenge of CHALLENGES) {
    const prediction = classify(model, challenge.text);
    if (prediction.needsReview) flagged += 1;
    const row = element('tr');
    const request = element('td'); request.append(element('strong', challenge.id), element('p', challenge.text || '(Empty request)'));
    const gate = element('td'); gate.append(element('span', prediction.needsReview ? 'Flagged for closer review' : 'Gate misses this challenge', `outcome ${prediction.needsReview ? 'correct' : 'incorrect'}`));
    if (!prediction.needsReview) gate.append(element('span', 'Human review is still mandatory.', 'gate-label'));
    row.append(request, element('td', name(prediction.topLabel)), gate, element('td', challenge.reason));
    $('challenge-results').append(row);
  }
  setText('challenge-summary', `Ambiguous and unfamiliar requests — ${flagged} / ${CHALLENGES.length} flagged by the simple gate`);
}

function renderModel(audit) {
  setText('model-summary', `Trained in this browser: ${model.documents} fictional requests · ${LABELS.length} categories · ${model.vocabulary.length} learned word types · ${EVALUATION.length} held-out checks`);
  setText('dataset-note', `${DATASET_NOTE} Dataset version: ${DATASET_VERSION}. Partitions: ${TRAINING.length} training, ${VALIDATION.length} validation, ${EVALUATION.length} held-out and ${CHALLENGES.length} separate challenges.`);
  const stats = makeTable('Learned class statistics from the training partition', ['Category', 'Requests', 'Word occurrences', 'Class prior']);
  for (const category of model.classes) {
    const row = element('tr');
    for (const value of [name(category.id), category.documents, category.tokenCount, percent(Math.exp(category.logPrior))]) row.append(element('td', value));
    stats.body.append(row);
  }
  $('training-stats').append(stats.table);
  setText('vocabulary', model.vocabulary.join(' · '));
  setText('partition-audit', `Partition check: ${audit.records} labelled records; unique IDs and no identical tokenised texts across training, validation and held-out sets. Vocabulary fitting uses only the ${TRAINING.length} training records.`);
}

function start() {
  const audit = auditPartitions({ training: TRAINING, validation: VALIDATION, evaluation: EVALUATION }, LABELS);
  if (!audit.ok) throw new Error('The fixed fixture partitions failed their integrity check.');
  model = trainClassifier(TRAINING, LABELS);
  for (const label of LABELS) {
    const option = element('option', label.name); option.value = label.id; $('human-category').append(option);
  }
  renderModel(audit);
  renderEvaluation();
  runPrediction(false);
  $('request-form').addEventListener('submit', event => { event.preventDefault(); runPrediction(); });
  $('example-picker').addEventListener('change', event => { $('request-text').value = sampleRequests[event.target.value]; runPrediction(); });
  $('request-text').addEventListener('input', () => {
    pending = null;
    $('human-category').value = '';
    setText('character-count', `${$('request-text').value.length.toLocaleString('en-AU')} / 1,200`);
    setText('result-title', 'Text changed — run the model again.');
    setText('result-note', 'A previous suggestion cannot be recorded against an edited request.');
    $('score-bars').replaceChildren(); $('evidence-terms').replaceChildren();
    $('gate-reasons').hidden = true; setText('coverage-note', ''); setText('unknown-note', '');
    setText('review-flag', 'Human review required'); $('review-flag').className = 'pill';
    updateReviewControl();
  });
  $('human-category').addEventListener('change', updateReviewControl);
  $('review-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!pending || pending.text !== $('request-text').value || decisions.length >= 6) return;
    try {
      const decision = createReviewDecision({ text: pending.text, chosenLabel: $('human-category').value,
        prediction: pending.prediction, labels: LABELS, confirmed: true, sequence: decisionSequence + 1 });
      decisionSequence += 1; decisions.push(decision); pending = null;
      $('human-category').value = ''; renderDecisions(); updateReviewControl();
      setText('review-help', decisions.length >= 6 ? 'Six local decisions recorded. Clear the list to continue.' : `${decision.id} recorded only in this page. Run a new suggestion to review another request.`);
      announce(`${decision.id}: your category, ${name(decision.chosenLabel)}, recorded in page memory. No ticket was created.`);
    } catch (error) { setText('review-help', error.message); announce(error.message); }
  });
  $('clear-reviews').addEventListener('click', () => {
    decisions = []; renderDecisions(); updateReviewControl();
    setText('review-help', 'The temporary review list is clear. Run a suggestion, then choose your category.');
    announce('Local review list cleared.');
  });
}

try { start(); } catch (error) {
  $('app-error').hidden = false;
  setText('model-summary', 'Model unavailable: the demonstration did not finish its checks.');
  console.error('Triage Lab could not start:', error);
}
