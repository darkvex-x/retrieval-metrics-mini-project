// eval.js starter. Fill in the four TODOs, then run: node eval.js
// You should not need any libraries. Plain Node.js is enough.
const fs = require('fs');

// --- 1. Load the inputs (already done for you) -----------------------------
// test-set.csv has a header row, then: query,correct_post_ids
// correct_post_ids may be a semicolon list, e.g. "1024;1025".
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);
  return lines.map(line => {
    const [query, ids] = line.trim().split(',');
    return { query, correctIds: ids.split(';').map(Number) };
  });
}
const testSet = loadTestSet('test-set.csv');

// search-results.json maps each query to the top-10 ranked post_id lists that
// each system returned: { "<query>": { keyword: [...], semantic: [...] } }
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// --- 2. TODO: Reciprocal Rank ----------------------------------------------
// Helper: the 1-based rank of the first correct id, or null if it is a miss.
function rankOf(rankedIds, correctIds) {
  const set = new Set(correctIds);
  for (let i = 0; i < rankedIds.length; i++) {
    if (set.has(rankedIds[i])) {
      return i + 1;
    }
  }
  return null;
}

// Return 1 / (rank of the FIRST correct id in rankedIds). Return 0 if none of
// the correct ids appear in rankedIds. Rank is 1-based (first result = rank 1).
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank !== null ? 1 / rank : 0;
}

// --- 3. TODO: run the evaluation loop --------------------------------------
// For every query: look up its keyword and semantic ranked lists, compute the
// reciprocal rank of each, accumulate the RRs, and count a "hit" whenever the
// correct answer was found in the top 10 (RR > 0).
// Then compute:
//   keywordMRR, semanticMRR         = average RR across all queries
//   keywordRecall, semanticRecall   = hits / number of queries

let keywordRRs = 0;
let semanticRRs = 0;
let keywordHits = 0;
let semanticHits = 0;
const rows = [];

for (const { query, correctIds } of testSet) {
  const res = results[query];
  const kwList = res.keyword || [];
  const semList = res.semantic || [];

  const kwRank = rankOf(kwList, correctIds);
  const semRank = rankOf(semList, correctIds);

  const kwRR = reciprocalRank(kwList, correctIds);
  const semRR = reciprocalRank(semList, correctIds);

  keywordRRs += kwRR;
  semanticRRs += semRR;

  if (kwRank !== null) keywordHits++;
  if (semRank !== null) semanticHits++;

  rows.push({
    query,
    keywordRankStr: kwRank !== null ? String(kwRank) : 'miss',
    semanticRankStr: semRank !== null ? String(semRank) : 'miss',
  });
}

const n = testSet.length;
const keywordMRR = keywordRRs / n;
const semanticMRR = semanticRRs / n;
const keywordRecall = keywordHits / n;
const semanticRecall = semanticHits / n;

// --- 4. TODO: print a markdown comparison table ----------------------------
// Print one row per query: | query | keyword rank | semantic rank |  (use "miss"
// when the answer was not in the top 10), then a final **Summary** row with
// MRR and Recall@10 for each system, each rounded to 2 decimals.

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
for (const row of rows) {
  console.log(`| ${row.query} | ${row.keywordRankStr} | ${row.semanticRankStr} |`);
}
console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
