// Author, creator and maintainer: Dhruba Poudel.
import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { trainClassifier, evaluateClassifier, classify, REVIEW_POLICY, auditPartitions } from './data/model.js';
import { LABELS, TRAINING, VALIDATION, EVALUATION, CHALLENGES, DATASET_VERSION } from './data/fixtures.js';

const audit = auditPartitions({ training: TRAINING, validation: VALIDATION, evaluation: EVALUATION }, LABELS);
if (!audit.ok) throw new Error(audit.errors.join('\n'));
const model = trainClassifier(TRAINING, LABELS);
const evaluation = evaluateClassifier(model, EVALUATION, LABELS);
const validation = evaluateClassifier(model, VALIDATION, LABELS);
const challenges = CHALLENGES.map(challenge => {
  const prediction = classify(model, challenge.text);
  return { ...challenge, predicted: prediction.topLabel, flagged: prediction.needsReview, gateReasons: prediction.reasons };
});
const snapshot = {
  author: 'Dhruba Poudel', creator: 'Dhruba Poudel', lastModifiedBy: 'Dhruba Poudel',
  datasetVersion: DATASET_VERSION,
  sourceSha256: {
    model: createHash('sha256').update(await readFile(new URL('./data/model.js', import.meta.url))).digest('hex'),
    fixtures: createHash('sha256').update(await readFile(new URL('./data/fixtures.js', import.meta.url))).digest('hex'),
  },
  scope: 'Small fixed fictional teaching fixture. Not an independent benchmark or operational-performance evidence.',
  algorithm: model.algorithm, alpha: model.alpha, reviewPolicy: REVIEW_POLICY,
  training: { records: TRAINING.length, vocabulary: model.vocabulary.length, classCounts: model.classes.map(item => ({ id: item.id, records: item.documents, words: item.tokenCount })) },
  partitionAudit: audit, validation, evaluation, challenges,
};
await writeFile(new URL('./evaluation-snapshot.json', import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  training: snapshot.training,
  heldOut: { correct: evaluation.correct, total: evaluation.total, accuracy: evaluation.accuracy, baseline: evaluation.baselineAccuracy, macroF1: evaluation.macroF1,
    passGate: evaluation.ready, flagged: evaluation.flagged, selectedCorrect: evaluation.readyCorrect,
    errors: evaluation.results.filter(item => !item.correct) },
  validation: { correct: validation.correct, total: validation.total, flagged: validation.flagged },
  challengesFlagged: challenges.filter(item => item.flagged).length,
  challengeMisses: challenges.filter(item => !item.flagged).map(item => item.id),
}, null, 2));
