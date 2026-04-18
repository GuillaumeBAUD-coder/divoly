# EchoAI — Product Requirements Document

## 1. Vision
EchoAI is a crowdsourced knowledge base of AI-generated answers. Users contribute prompts + responses they received from ChatGPT, Claude, Gemini, or any AI tool. Other users search and retrieve those answers instantly — no AI inference, no energy waste, no API cost.

> "Ask once. Share forever."

---

## 2. Problem
- AI inference consumes significant electricity and water (a ChatGPT query uses ~10× more energy than a Google search).
- Millions of users ask the **same questions** to AI systems daily, triggering redundant computation.
- AI answers aren't easily discoverable or shareable — they live and die in private chat windows.
- Some users avoid AI tools for ethical or environmental reasons but still want access to quality answers.

---

## 3. Target Users

| Persona | Need |
|---|---|
| **The Contributor** | Shares AI answers they've already obtained; earns reputation/points |
| **The Searcher** | Finds quick answers without querying AI; eco-conscious or cost-sensitive |
| **The Researcher** | Browses a topic to compare how different AI models answer the same question |
| **The Developer** | Uses the public API to integrate cached AI answers into their apps |

---

## 4. Core Features

### MVP (v1)
- **Search bar** — semantic search over stored Q&A pairs (fuzzy + keyword matching)
- **Contribute flow** — paste your original prompt + AI answer; tag model (GPT-4, Claude, Gemini…) and category
- **Answer card** — displays the answer, source model, date, upvotes, view count
- **Categories** — Coding, Writing, Science, Math, Legal, Medical, General
- **Voting** — upvote/downvote answers; surfaces best answers first

### v2
- **Semantic similarity matching** — vector embeddings to find "same question, different wording"
- **User profiles & reputation** — points for contributions, badges for quality
- **Answer freshness** — flag outdated answers (model version changed, facts shifted)
- **Comparison view** — see how GPT-4 vs Claude vs Gemini answered the same prompt
- **Browser extension** — detect when you're about to ask something already answered on EchoAI

### v3
- **Public API** — developers query the cache programmatically
- **Collections** — curated sets of Q&A (e.g., "Best Python debugging prompts")
- **Embed widget** — any website can embed an EchoAI search box

---

## 5. Key Metrics
- **Cache hit rate** — % of searches that return an existing answer (target: 40% at 6 months)
- **Contribution rate** — answers submitted per day
- **Answer quality score** — avg upvote ratio
- **Energy saved** — estimated GPU queries avoided (marketing metric)

---

## 6. Technical Architecture

```
User → Next.js frontend
         ↓
    API Routes (Next.js)
         ↓
    PostgreSQL (Q&A store) + pgvector (semantic search)
         ↓
    Redis (hot cache for top queries)
```

For semantic search: embed questions with a lightweight model (e.g., `text-embedding-3-small`) and store vectors in pgvector. At query time, find top-k nearest neighbors above a similarity threshold.

---

## 7. Monetization
1. **Free tier** — unlimited search, 5 contributions/month
2. **Pro ($5/mo)** — unlimited contributions, API access, no ads
3. **API credits** — pay-per-query for developers
4. **Sponsored categories** — companies pay to surface relevant answers in their domain

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Low-quality / hallucinated answers | Community flagging + minimum reputation to contribute |
| Copyright concerns (AI output ownership) | T&C: users attest they obtained the answer themselves |
| Cold-start (empty DB) | Seed with 1,000 high-value Q&A pairs before launch |
| Answers going stale | Freshness scoring + community "outdated" flag |
| Spam / misuse | Rate limiting, CAPTCHA on contribution, moderation queue |

---

## 9. Success Criteria (6 months post-launch)
- 10,000 registered users
- 50,000 Q&A pairs in the database
- 40% cache hit rate on search
- NPS > 40
