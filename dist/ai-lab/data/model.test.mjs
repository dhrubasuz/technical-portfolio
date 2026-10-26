// Author, creator and maintainer: Dhruba Poudel.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tokenize, trainClassifier, classify, evaluateClassifier, auditPartitions, createReviewDecision, MAX_CHARACTERS, REVIEW_POLICY } from './model.js';
import { AUTHOR, LABELS, TRAINING, VALIDATION, EVALUATION, CHALLENGES } from './fixtures.js';

const binaryLabels = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }];
const handRecords = [
  { id: 'a1', label: 'a', text: 'red red sun' },
  { id: 'a2', label: 'a', text: 'red warm' },
  { id: 'b1', label: 'b', text: 'blue cold' },
];
const handModel = trainClassifier(handRecords, binaryLabels);
const fixtureModel = trainClassifier(TRAINING, LABELS);
const close = (a, b, tolerance = 1e-12) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≠ ${b}`);

test('tokenisation normalises case, punctuation and compatible Unicode without pretending to support every language', () => {
  assert.deepEqual(tokenize("RED, blue! ＳＵＮ user’s"), ['red', 'blue', 'sun', 'user', 's']);
  assert.deepEqual(tokenize('!!!'), []);
  assert.throws(() => tokenize(null), TypeError);
});

test('training learns exact class priors, word counts and training-only vocabulary', () => {
  assert.equal(handModel.documents, 3);
  assert.deepEqual(handModel.vocabulary, ['blue', 'cold', 'red', 'sun', 'warm']);
  const a = handModel.classes[0], b = handModel.classes[1];
  assert.equal(a.documents, 2); assert.equal(a.tokenCount, 5); assert.equal(a.counts.get('red'), 3);
  assert.equal(b.documents, 1); assert.equal(b.tokenCount, 2);
  close(Math.exp(a.logPrior), 2 / 3); close(Math.exp(b.logPrior), 1 / 3);
});

test('Laplace smoothing matches a hand-calculated likelihood and each class distribution sums to one', () => {
  close(Math.exp(handModel.classes[0].logLikelihood.get('red')), 4 / 10);
  close(Math.exp(handModel.classes[0].logLikelihood.get('blue')), 1 / 10);
  close(Math.exp(handModel.classes[1].logLikelihood.get('blue')), 2 / 7);
  for (const category of handModel.classes) close([...category.logLikelihood.values()].reduce((sum, value) => sum + Math.exp(value), 0), 1);
});

test('log-space scores and relative scores match a hand-calculated classification', () => {
  const result = classify(handModel, 'red blue');
  assert.equal(result.topLabel, 'a');
  const aScore = (2 / 3) * (4 / 10) * (1 / 10);
  const bScore = (1 / 3) * (1 / 7) * (2 / 7);
  close(result.scores[0].logScore, Math.log(aScore));
  close(result.scores[1].logScore, Math.log(bScore));
  close(result.scores[0].relativeScore, aScore / (aScore + bScore));
  close(result.scores.reduce((sum, score) => sum + score.relativeScore, 0), 1);
});

test('word evidence and prior contribution reconcile to the top-versus-runner-up log-score gap', () => {
  const result = classify(handModel, 'red red blue warm');
  close(result.evidence.reduce((sum, evidence) => sum + evidence.contribution, result.priorContribution), result.scoreGap);
  assert.equal(result.evidence.find(evidence => evidence.term === 'red').count, 2);
});

test('unknown terms are disclosed and do not change learned class scores', () => {
  const known = classify(handModel, 'red warm');
  const unknown = classify(handModel, 'red warm quokka');
  assert.deepEqual(unknown.scores.map(score => score.logScore), known.scores.map(score => score.logScore));
  assert.deepEqual(unknown.unknownTerms, ['quokka']);
  close(unknown.coverage, 2 / 3);
  assert.ok(!handModel.vocabularySet.has('quokka'));
});

test('empty and entirely unknown inputs have no suggestion and require review', () => {
  for (const text of ['', '  !!! ', 'quokka nebula']) {
    const result = classify(handModel, text);
    assert.equal(result.topLabel, null);
    assert.equal(result.needsReview, true);
    assert.equal(result.knownTokenCount, 0);
    assert.ok(result.scores.every(score => Number.isFinite(score.logScore) && Number.isFinite(score.relativeScore)));
  }
});

test('a single repeated known word does not satisfy the distinct-word review gate', () => {
  const result = classify(handModel, 'red red red red red red');
  assert.equal(result.topLabel, 'a');
  assert.equal(result.knownTerms.length, 1);
  assert.equal(result.needsReview, true);
  assert.ok(result.reasons.some(reason => reason.includes('distinct')));
});

test('low vocabulary coverage and close categories trigger their separate fixed review reasons', () => {
  const lowCoverage = classify(handModel, 'red warm quokka nebula asteroid mammoth');
  assert.equal(lowCoverage.needsReview, true);
  assert.ok(lowCoverage.reasons.some(reason => reason.includes('45%')));
  const tieModel = trainClassifier([{ label: 'a', text: 'same words' }, { label: 'b', text: 'same words' }], binaryLabels);
  const tied = classify(tieModel, 'same words');
  assert.equal(tied.topLabel, 'a');
  assert.equal(tied.meanMargin, 0);
  assert.ok(tied.reasons.some(reason => reason.includes('too close')));
});

test('case and punctuation changes leave the token-count classification unchanged', () => {
  const first = classify(fixtureModel, 'Please reset my password.');
  const second = classify(fixtureModel, 'PLEASE, RESET MY PASSWORD!!!');
  assert.deepEqual(first.scores, second.scores);
  assert.deepEqual(first.evidence, second.evidence);
});

test('long valid requests remain numerically stable and input bounds are enforced', () => {
  const result = classify(handModel, 'red blue '.repeat(130));
  assert.ok(result.scores.every(score => Number.isFinite(score.logScore) && Number.isFinite(score.relativeScore)));
  close(result.scores.reduce((sum, score) => sum + score.relativeScore, 0), 1);
  assert.throws(() => classify(handModel, 'x'.repeat(MAX_CHARACTERS + 1)), RangeError);
  assert.throws(() => classify(handModel, {}), TypeError);
});

test('invalid training data and class definitions fail before producing a misleading model', () => {
  assert.throws(() => trainClassifier([], binaryLabels), TypeError);
  assert.throws(() => trainClassifier(handRecords, ['a', 'a']), TypeError);
  assert.throws(() => trainClassifier(handRecords, binaryLabels, 0), RangeError);
  assert.throws(() => trainClassifier(handRecords, binaryLabels, NaN), RangeError);
  assert.throws(() => trainClassifier([{ label: 'a', text: 'red' }], binaryLabels), TypeError);
  assert.throws(() => trainClassifier([{ label: 'a', text: '' }, { label: 'b', text: 'blue' }], binaryLabels), TypeError);
  assert.throws(() => trainClassifier([{ label: 'unknown', text: 'red' }], binaryLabels), TypeError);
});

test('fixture partitions have balanced classes, unique IDs and no identical tokenised text', () => {
  const audit = auditPartitions({ training: TRAINING, validation: VALIDATION, evaluation: EVALUATION }, LABELS);
  assert.equal(audit.ok, true, audit.errors.join('\n'));
  assert.equal(audit.records, 72);
  for (const label of LABELS) {
    assert.equal(TRAINING.filter(row => row.label === label.id).length, 10);
    assert.equal(VALIDATION.filter(row => row.label === label.id).length, 3);
    assert.equal(EVALUATION.filter(row => row.label === label.id).length, 5);
  }
  assert.equal(AUTHOR, 'Dhruba Poudel');
  assert.equal(CHALLENGES.length, 8);
});

test('partition audit detects duplicate IDs, normalised duplicate text, bad labels and empty records', () => {
  const audit = auditPartitions({ train: [{ id: 'x', label: 'a', text: 'RED warm' }],
    test: [{ id: 'x', label: 'b', text: 'red, WARM!' }, { id: 'y', label: 'no', text: '' }] }, binaryLabels);
  assert.equal(audit.ok, false);
  assert.ok(audit.errors.some(error => error.includes('duplicate ID')));
  assert.ok(audit.errors.some(error => error.includes('repeated text')));
  assert.ok(audit.errors.some(error => error.includes('unknown category')));
  assert.ok(audit.errors.some(error => error.includes('no usable words')));
});

test('evaluating held-out and validation sets never changes the fitted vocabulary or counts', () => {
  const before = JSON.stringify({ vocabulary: fixtureModel.vocabulary, counts: fixtureModel.classes.map(item => [...item.counts]) });
  evaluateClassifier(fixtureModel, EVALUATION, LABELS);
  evaluateClassifier(fixtureModel, VALIDATION, LABELS);
  for (const challenge of CHALLENGES) classify(fixtureModel, challenge.text);
  const after = JSON.stringify({ vocabulary: fixtureModel.vocabulary, counts: fixtureModel.classes.map(item => [...item.counts]) });
  assert.equal(after, before);
  const trainingWords = new Set(TRAINING.flatMap(row => tokenize(row.text)));
  assert.deepEqual(new Set(fixtureModel.vocabulary), trainingWords);
});

test('evaluation metrics reconcile known correct, incorrect and no-suggestion cases', () => {
  const records = [
    { id: 'e1', label: 'a', text: 'red warm' },
    { id: 'e2', label: 'b', text: 'red warm' },
    { id: 'e3', label: 'b', text: 'blue cold' },
    { id: 'e4', label: 'b', text: 'quokka nebula' },
  ];
  const result = evaluateClassifier(handModel, records, binaryLabels);
  assert.equal(result.total, 4); assert.equal(result.correct, 2); close(result.accuracy, .5);
  assert.deepEqual(result.matrix, [[1, 0], [1, 1]]); assert.equal(result.noSuggestion, 1);
  assert.equal(result.baselineLabel, 'a'); assert.equal(result.baselineCorrect, 1); close(result.baselineAccuracy, .25);
  close(result.perClass[0].precision, .5); close(result.perClass[0].recall, 1); close(result.perClass[0].f1, 2 / 3);
  close(result.perClass[1].precision, 1); close(result.perClass[1].recall, 1 / 3); close(result.perClass[1].f1, .5);
  close(result.macroF1, (2 / 3 + .5) / 2);
  assert.equal(result.ready + result.flagged, 4);
  assert.equal(result.matrix.flat().reduce((sum, value) => sum + value, 0) + result.noSuggestion, 4);
});

test('the selected subset is reported separately and never removes records from full accuracy', () => {
  const policy = { ...REVIEW_POLICY, minKnownTerms: 999 };
  const result = evaluateClassifier(handModel, [{ label: 'a', text: 'red warm' }, { label: 'b', text: 'red warm' }], binaryLabels, policy);
  assert.equal(result.ready, 0); assert.equal(result.flagged, 2); assert.equal(result.selectiveAccuracy, null);
  assert.equal(result.correct, 1); close(result.accuracy, .5);
  assert.equal(result.results.length, 2);
});

test('held-out evaluation and challenge outputs are deterministic and contain every fixture', () => {
  const first = evaluateClassifier(fixtureModel, EVALUATION, LABELS);
  const second = evaluateClassifier(fixtureModel, EVALUATION, LABELS);
  assert.deepEqual(first, second);
  assert.equal(first.results.length, EVALUATION.length);
  assert.equal(first.perClass.reduce((sum, item) => sum + item.support, 0), EVALUATION.length);
  assert.equal(first.matrix.flat().reduce((sum, value) => sum + value, 0) + first.noSuggestion, EVALUATION.length);
  assert.equal(first.ready + first.flagged, EVALUATION.length);
  for (const challenge of CHALLENGES) assert.doesNotThrow(() => classify(fixtureModel, challenge.text));
});

test('human review requires an explicit valid category and boolean confirmation', () => {
  const request = { text: 'red warm', prediction: classify(handModel, 'red warm'), labels: binaryLabels, sequence: 1 };
  assert.throws(() => createReviewDecision({ ...request, chosenLabel: '', confirmed: true }), TypeError);
  assert.throws(() => createReviewDecision({ ...request, chosenLabel: 'b', confirmed: false }), TypeError);
  assert.throws(() => createReviewDecision({ ...request, chosenLabel: 'b', confirmed: 'yes' }), TypeError);
  assert.throws(() => createReviewDecision({ ...request, chosenLabel: 'b', confirmed: true, text: '' }), TypeError);
  const decision = createReviewDecision({ ...request, chosenLabel: 'b', confirmed: true });
  assert.equal(decision.suggestedLabel, 'a'); assert.equal(decision.chosenLabel, 'b'); assert.equal(decision.changed, true);
  assert.equal(decision.source, 'Human selection'); assert.equal(decision.id, 'LOCAL-01');
});

test('a person can categorise unfamiliar text even when the model abstains', () => {
  const text = 'quokka nebula';
  const decision = createReviewDecision({ text, prediction: classify(handModel, text), chosenLabel: 'b', labels: binaryLabels, confirmed: true, sequence: 2 });
  assert.equal(decision.suggestedLabel, null); assert.equal(decision.chosenLabel, 'b'); assert.equal(decision.changed, false);
});

test('the page uses text-only rendering and has no API, persistent storage or third-party runtime dependency', async () => {
  const script = await readFile(new URL('../triage.js', import.meta.url), 'utf8');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../triage.css', import.meta.url), 'utf8');
  assert.doesNotMatch(script, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|sendBeacon)\b/);
  assert.doesNotMatch(html, /<(?:script|link)[^>]*(?:src|href)="https?:/i);
  assert.doesNotMatch(css, /@import|url\(\s*['"]?https?:/i);
  for (const field of ['author', 'creator', 'last-modified-by']) assert.ok(html.includes(`<meta name="${field}" content="Dhruba Poudel">`));
  assert.match(html, /<textarea[^>]*maxlength="1200"/);
  assert.match(html, /<option value="">Choose a category/);
  assert.match(script, /pending\.text !== \$\('request-text'\)\.value/);
});
