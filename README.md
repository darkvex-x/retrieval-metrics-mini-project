# Retrieval Metrics Mini Project

Build a tiny evaluation tool that measures how good a search system is.

In this mini project you will implement `eval.js` so it scores two search systems, keyword search and semantic search, on the same set of test queries, computes **MRR** and **Recall@10** for each, and prints a **markdown comparison table**. No database or API keys are needed: the two systems' ranked results are already captured for you as data, so you can focus on the metrics themselves.

## What is in this project

- `eval.js` : the file you build. It has four TODOs; the file-loading is done for you.
- `test-set.csv` : 10 `(query, correct_post_ids)` pairs. A row may list more than one correct answer, semicolon-separated (for example `1024;1025`).
- `search-results.json` : for each query, the top-10 ranked `post_id` list each system returned, shaped as `{ "<query>": { "keyword": [...], "semantic": [...] } }`. Array position 0 is rank 1.
- `posts-dataset.csv` : the 35 posts the ids refer to (for sanity-checking; not required by the core build).

## What to build

1. **Load** `test-set.csv` and `search-results.json` (already wired up in the starter).
2. **Reciprocal Rank:** for one query, return `1 / rank` of the first correct id in a ranked list, or `0` if no correct id is in the top 10 (rank is 1-based).
3. **Evaluation loop:** for every query, compute the reciprocal rank for the keyword and semantic lists and count a hit whenever the correct answer is in the top 10. Then compute, for each system:
   - **MRR** = average reciprocal rank across all 10 queries.
   - **Recall@10** = (queries whose correct answer is in the top 10) / 10.
4. **Print a markdown comparison table:** one row per query with keyword and semantic ranks (`miss` when not found), then a **Summary** row with each system's MRR and Recall@10 rounded to two decimals.

## Formulas

```text
Reciprocal Rank (one query) = 1 / (rank of the first correct answer)
                            = 0   if the correct answer is not in the top 10
MRR       = average of the reciprocal ranks over all queries
Recall@10 = (queries whose correct answer is in the top 10) / (total queries)
```

## Run it

```bash
node eval.js
```

## Results

```text
| Query | Keyword rank | Semantic rank |
|---|---|---|
| my redis cache keeps showing old data | 8 | 1 |
| how do I add semantic search to a table I already have | miss | 2 |
| redis or memcached for caching | 1 | 2 |
| why did my query get slower after I added an index | miss | 1 |
| what does ACID actually guarantee | 2 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 |
| my background jobs stop after every deploy | miss | 2 |
| how do I let my database accept more writes per second | 4 | 1 |
| sql or nosql for a new product | 1 | 3 |
| why does my redis memory keep climbing | miss | 2 |
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |
```

## Interpretation

Semantic search is overwhelmingly superior overall, outperforming keyword search by a wide margin on both MRR (0.67 vs. 0.30) and Recall@10 (1.00 vs. 0.60, achieving a 100% retrieval rate in the top 10). Keyword search won specifically on *"redis or memcached for caching"* (rank 1 vs. 2) and *"sql or nosql for a new product"* (rank 1 vs. 3), which both feature exact brand and technology names where exact lexical token matching provides an unambiguous signal. Conversely, semantic search won decisively on descriptive, symptom-based queries such as *"why did my query get slower after I added an index"* (rank 1 vs. miss) and *"my background jobs stop after every deploy"* (rank 2 vs. miss), understanding user intent through semantic embeddings even when the author’s terminology diverged from the query phrasing. A team would nonetheless maintain keyword search in production because fusing the two approaches via hybrid search (such as Reciprocal Rank Fusion) leverages keyword precision for exact entities while retaining semantic reach for conceptual inquiries.
