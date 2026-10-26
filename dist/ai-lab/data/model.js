// Author, creator and maintainer: Dhruba Poudel.
// Original educational multinomial Naive Bayes implementation. No external library or API.
export const AUTHOR = 'Dhruba Poudel';
export const MAX_CHARACTERS = 1200;
// Fixed teaching policy: these are review heuristics, not a learned safety model.
// They are set before evaluating the fixed held-out fixture and are not calibrated.
export const REVIEW_POLICY = Object.freeze({ minKnownTerms: 2, minCoverage: 0.45, minMeanMargin: 0.25 });

export function tokenize(text) {
  if (typeof text !== 'string') throw new TypeError('Request text must be a string.');
  return text.normalize('NFKC').toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) || [];
}

function checkInput(text) {
  if (typeof text !== 'string') throw new TypeError('Request text must be a string.');
  if (text.length > MAX_CHARACTERS) throw new RangeError(`Use no more than ${MAX_CHARACTERS} characters.`);
  return tokenize(text);
}

function countTerms(tokens) {
  const counts = new Map();
  for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1);
  return counts;
}

function labelIds(labels) {
  const ids = labels.map(label => typeof label === 'string' ? label : label.id);
  if (ids.length < 2 || ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) {
    throw new TypeError('Provide at least two distinct category IDs.');
  }
  return ids;
}

export function auditPartitions(partitions, labels) {
  const ids = new Set(labelIds(labels));
  const seenIds = new Set();
  const seenTexts = new Map();
  const errors = [];
  let records = 0;
  for (const [partition, rows] of Object.entries(partitions)) {
    if (!Array.isArray(rows) || rows.length === 0) { errors.push(`${partition}: no records`); continue; }
    for (const row of rows) {
      records += 1;
      if (!row || typeof row.id !== 'string' || !row.id) { errors.push(`${partition}: missing ID`); continue; }
      if (seenIds.has(row.id)) errors.push(`${partition}: duplicate ID ${row.id}`);
      seenIds.add(row.id);
      if (!ids.has(row.label)) errors.push(`${row.id}: unknown category`);
      if (typeof row.text !== 'string') { errors.push(`${row.id}: missing text`); continue; }
      if (row.text.length > MAX_CHARACTERS) errors.push(`${row.id}: text too long`);
      const canonical = tokenize(row.text).join(' ');
      if (!canonical) errors.push(`${row.id}: no usable words`);
      else if (seenTexts.has(canonical)) errors.push(`${row.id}: repeated text from ${seenTexts.get(canonical)}`);
      else seenTexts.set(canonical, row.id);
    }
  }
  return Object.freeze({ ok: errors.length === 0, records, errors: Object.freeze(errors) });
}

export function trainClassifier(records, labels, alpha = 1) {
  const ids = labelIds(labels);
  if (!Array.isArray(records) || records.length === 0) throw new TypeError('Training examples are required.');
  if (!Number.isFinite(alpha) || alpha <= 0) throw new RangeError('Smoothing must be greater than zero.');
  const stats = new Map(ids.map(id => [id, { id, documents: 0, tokenCount: 0, counts: new Map() }]));
  const vocabulary = new Set();
  for (const record of records) {
    const category = stats.get(record.label);
    if (!category) throw new TypeError('A training example has an unknown category.');
    const tokens = checkInput(record.text);
    if (!tokens.length) throw new TypeError('Each training example needs at least one usable word.');
    category.documents += 1;
    for (const token of tokens) {
      vocabulary.add(token);
      category.tokenCount += 1;
      category.counts.set(token, (category.counts.get(token) || 0) + 1);
    }
  }
  const orderedVocabulary = [...vocabulary].sort();
  const classes = ids.map(id => {
    const category = stats.get(id);
    if (!category.documents) throw new TypeError(`No training examples for category ${id}.`);
    const denominator = category.tokenCount + alpha * vocabulary.size;
    return Object.freeze({
      id,
      documents: category.documents,
      tokenCount: category.tokenCount,
      logPrior: Math.log(category.documents / records.length),
      counts: category.counts,
      logLikelihood: new Map(orderedVocabulary.map(term => [term, Math.log(((category.counts.get(term) || 0) + alpha) / denominator)])),
    });
  });
  return Object.freeze({ author: AUTHOR, algorithm: 'Multinomial Naive Bayes', alpha, documents: records.length,
    vocabulary: Object.freeze(orderedVocabulary), vocabularySet: vocabulary, classes: Object.freeze(classes) });
}

export function classify(model, text, policy = REVIEW_POLICY) {
  const tokens = checkInput(text);
  const counts = countTerms(tokens);
  const knownTerms = [...counts.keys()].filter(term => model.vocabularySet.has(term));
  const unknownTerms = [...counts.keys()].filter(term => !model.vocabularySet.has(term));
  const knownTokenCount = knownTerms.reduce((sum, term) => sum + counts.get(term), 0);
  const coverage = tokens.length ? knownTokenCount / tokens.length : 0;
  const ranked = model.classes.map((category, order) => ({
    id: category.id, order,
    logScore: knownTerms.reduce((sum, term) => sum + counts.get(term) * category.logLikelihood.get(term), category.logPrior),
  })).sort((a, b) => b.logScore - a.logScore || a.order - b.order);
  const best = ranked[0];
  const runnerUp = ranked[1];
  const scoreTotal = ranked.reduce((sum, item) => sum + Math.exp(item.logScore - best.logScore), 0);
  for (const item of ranked) item.relativeScore = Math.exp(item.logScore - best.logScore) / scoreTotal;
  const scoreGap = best.logScore - runnerUp.logScore;
  const meanMargin = knownTokenCount ? scoreGap / knownTokenCount : 0;
  const reasons = [];
  if (!tokens.length) reasons.push('No usable words: a person must choose the category.');
  else {
    if (knownTerms.length < policy.minKnownTerms) reasons.push(`Fewer than ${policy.minKnownTerms} distinct words are known to this small model.`);
    if (coverage < policy.minCoverage) reasons.push(`Less than ${Math.round(policy.minCoverage * 100)}% of the words appear in its training vocabulary.`);
    if (meanMargin < policy.minMeanMargin) reasons.push('The leading categories are too close under the fixed review policy.');
  }
  const topClass = model.classes.find(item => item.id === best.id);
  const secondClass = model.classes.find(item => item.id === runnerUp.id);
  const evidence = knownTerms.map(term => ({
    term, count: counts.get(term),
    contribution: counts.get(term) * (topClass.logLikelihood.get(term) - secondClass.logLikelihood.get(term)),
  })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution) || a.term.localeCompare(b.term));
  return Object.freeze({
    topLabel: tokens.length && knownTokenCount ? best.id : null,
    runnerUpLabel: runnerUp.id,
    tokenCount: tokens.length, knownTokenCount, knownTerms: Object.freeze(knownTerms), unknownTerms: Object.freeze(unknownTerms),
    coverage, scoreGap, meanMargin, scores: Object.freeze(ranked), evidence: Object.freeze(evidence),
    priorContribution: topClass.logPrior - secondClass.logPrior,
    needsReview: reasons.length > 0, reasons: Object.freeze(reasons),
  });
}

export function evaluateClassifier(model, records, labels, policy = REVIEW_POLICY) {
  const ids = labelIds(labels);
  if (!Array.isArray(records) || !records.length) throw new TypeError('Evaluation examples are required.');
  const matrix = ids.map(() => ids.map(() => 0));
  const baselineLabel = [...model.classes].sort((a, b) => b.documents - a.documents || ids.indexOf(a.id) - ids.indexOf(b.id))[0].id;
  let correct = 0, ready = 0, readyCorrect = 0, noSuggestion = 0, baselineCorrect = 0;
  const results = records.map(record => {
    const actualIndex = ids.indexOf(record.label);
    if (actualIndex < 0) throw new TypeError('Evaluation contains an unknown category.');
    const prediction = classify(model, record.text, policy);
    const predictedIndex = ids.indexOf(prediction.topLabel);
    if (predictedIndex >= 0) matrix[actualIndex][predictedIndex] += 1;
    else noSuggestion += 1;
    const isCorrect = prediction.topLabel === record.label;
    if (isCorrect) correct += 1;
    if (!prediction.needsReview) { ready += 1; if (isCorrect) readyCorrect += 1; }
    if (record.label === baselineLabel) baselineCorrect += 1;
    return Object.freeze({ id: record.id, text: record.text, actual: record.label, predicted: prediction.topLabel,
      correct: isCorrect, needsReview: prediction.needsReview, reasons: prediction.reasons });
  });
  const perClass = ids.map((id, index) => {
    const truePositive = matrix[index][index];
    const predictedCount = matrix.reduce((sum, row) => sum + row[index], 0);
    const support = records.filter(record => record.label === id).length;
    const precision = predictedCount ? truePositive / predictedCount : 0;
    const recall = support ? truePositive / support : 0;
    return Object.freeze({ id, support, predictedCount, truePositive, precision, recall,
      f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 });
  });
  return Object.freeze({ total: records.length, correct, accuracy: correct / records.length,
    matrix: Object.freeze(matrix.map(row => Object.freeze(row))), noSuggestion, perClass: Object.freeze(perClass),
    macroF1: perClass.reduce((sum, item) => sum + item.f1, 0) / ids.length,
    ready, flagged: records.length - ready, readyCorrect, coverage: ready / records.length,
    selectiveAccuracy: ready ? readyCorrect / ready : null,
    baselineLabel, baselineCorrect, baselineAccuracy: baselineCorrect / records.length, results: Object.freeze(results) });
}

export function createReviewDecision({ text, chosenLabel, prediction, labels, confirmed, sequence }) {
  const tokens = checkInput(text);
  if (!tokens.length) throw new TypeError('Enter a request with usable words before recording a review.');
  if (confirmed !== true || !labelIds(labels).includes(chosenLabel)) throw new TypeError('A person must explicitly choose and confirm a category.');
  if (!Number.isInteger(sequence) || sequence < 1) throw new TypeError('A positive local decision number is required.');
  return Object.freeze({ id: `LOCAL-${String(sequence).padStart(2, '0')}`, text: text.trim(),
    chosenLabel, suggestedLabel: prediction?.topLabel || null, source: 'Human selection',
    changed: Boolean(prediction?.topLabel && chosenLabel !== prediction.topLabel) });
}
