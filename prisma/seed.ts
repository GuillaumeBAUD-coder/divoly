import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  { name: "alex_dev", email: "alex@seed.echoai.dev" },
  { name: "sciencefan", email: "science@seed.echoai.dev" },
  { name: "netguru", email: "net@seed.echoai.dev" },
  { name: "careercoach", email: "career@seed.echoai.dev" },
  { name: "medstudent", email: "med@seed.echoai.dev" },
  { name: "financegeek", email: "finance@seed.echoai.dev" },
  { name: "historyprof", email: "history@seed.echoai.dev" },
  { name: "legalbeagle", email: "legal@seed.echoai.dev" },
];

const QA_PAIRS = [
  // ── CODING ───────────────────────────────────────────────────────
  {
    prompt: "Explain recursion in Python with a simple example",
    answer: `Recursion is when a function calls itself to solve smaller instances of the same problem. Here's a classic example with factorial:

\`\`\`python
def factorial(n):
    if n <= 1:  # base case
        return 1
    return n * factorial(n - 1)  # recursive call

print(factorial(5))  # Output: 120
\`\`\`

Every recursive function needs: 1) A **base case** (to stop), and 2) A **recursive case** (to reduce the problem). Without a base case, you get infinite recursion and a stack overflow.`,
    model: "GPT-4o", modelColor: "#10b981", category: "Coding",
    tags: ["python", "recursion", "functions"], upvotes: 342, views: 4821, user: "alex@seed.echoai.dev",
  },
  {
    prompt: "What is the difference between TCP and UDP?",
    answer: `**TCP (Transmission Control Protocol)** is connection-oriented — it establishes a connection before sending data, guarantees delivery, order, and error-checking. Great for: web browsing, email, file transfers.

**UDP (User Datagram Protocol)** is connectionless — it fires packets without confirming receipt. Faster but unreliable. Great for: video streaming, online gaming, DNS lookups.

Simple analogy: TCP is a certified letter (you know it arrived). UDP is a flyer thrown into a crowd (some might catch it, some won't).`,
    model: "Claude 3.5", modelColor: "#818cf8", category: "Coding",
    tags: ["networking", "tcp", "udp", "protocols"], upvotes: 218, views: 3102, user: "net@seed.echoai.dev",
  },
  {
    prompt: "What is the difference between == and === in JavaScript?",
    answer: `**== (loose equality)** compares values after type coercion — JavaScript converts operands to the same type before comparing.

**=== (strict equality)** compares both value AND type — no coercion occurs.

Examples:
\`\`\`javascript
0 == false   // true  (false coerces to 0)
0 === false  // false (different types)
"" == false  // true
"" === false // false
null == undefined  // true
null === undefined // false
\`\`\`

**Rule of thumb:** always use === unless you have a specific reason for loose comparison.`,
    model: "GPT-4o", modelColor: "#10b981", category: "Coding",
    tags: ["javascript", "equality", "types"], upvotes: 289, views: 5203, user: "alex@seed.echoai.dev",
  },
  {
    prompt: "What is Big O notation? Explain with examples.",
    answer: `Big O notation describes how an algorithm's time or space requirements grow as input size (n) grows. It gives an upper bound on complexity.

**Common complexities (best → worst):**
- **O(1)** — Constant: array index lookup
- **O(log n)** — Logarithmic: binary search
- **O(n)** — Linear: iterating an array
- **O(n log n)** — Linearithmic: merge sort, quicksort (avg)
- **O(n²)** — Quadratic: nested loops, bubble sort
- **O(2ⁿ)** — Exponential: recursive fibonacci

Key insight: Big O ignores constants and lower-order terms. O(3n + 100) simplifies to O(n).`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "Coding",
    tags: ["algorithms", "big-o", "complexity", "computer-science"], upvotes: 401, views: 6700, user: "alex@seed.echoai.dev",
  },
  {
    prompt: "How does async/await work in Python?",
    answer: `async/await in Python is built on top of the asyncio event loop. It lets you write concurrent code that looks synchronous.

\`\`\`python
import asyncio

async def fetch_data(url: str) -> str:
    await asyncio.sleep(1)  # simulates I/O wait
    return f"data from {url}"

async def main():
    # Run two fetches concurrently
    result1, result2 = await asyncio.gather(
        fetch_data("api.example.com/users"),
        fetch_data("api.example.com/posts"),
    )
    print(result1, result2)

asyncio.run(main())
\`\`\`

**Key concepts:**
- **async def** defines a coroutine
- **await** pauses execution until the awaited coroutine completes, yielding control to the event loop
- **asyncio.gather()** runs multiple coroutines concurrently`,
    model: "GPT-4o", modelColor: "#10b981", category: "Coding",
    tags: ["python", "async", "asyncio", "concurrency"], upvotes: 267, views: 4100, user: "alex@seed.echoai.dev",
  },
  {
    prompt: "Explain SQL JOINs with a clear example",
    answer: `SQL JOINs combine rows from two tables based on a related column.

Given: **users** (id, name) and **orders** (id, user_id, product)

**INNER JOIN** — only rows that match in both tables:
\`\`\`sql
SELECT users.name, orders.product
FROM users
INNER JOIN orders ON users.id = orders.user_id;
-- Returns users who have orders
\`\`\`

**LEFT JOIN** — all rows from left table, matched rows from right (NULL if no match):
\`\`\`sql
SELECT users.name, orders.product
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
-- Returns ALL users, even those with no orders
\`\`\`

**RIGHT JOIN** — opposite of LEFT JOIN.
**FULL OUTER JOIN** — all rows from both tables.

Memory trick: think of Venn diagrams. INNER = intersection, LEFT = left circle + intersection.`,
    model: "Gemini 1.5", modelColor: "#f59e0b", category: "Coding",
    tags: ["sql", "database", "joins"], upvotes: 312, views: 5800, user: "net@seed.echoai.dev",
  },
  {
    prompt: "What is a REST API and how does it work?",
    answer: `A **REST API** (Representational State Transfer) is an architectural style for building web services. It uses standard HTTP methods to perform operations on resources.

**Core principles:**
- **Stateless** — each request contains all info needed; server stores no client state
- **Resource-based** — everything is a resource with a URL (e.g., /users/42)
- **HTTP methods as actions:**
  - GET → read
  - POST → create
  - PUT/PATCH → update
  - DELETE → delete

**Example:**
\`\`\`
GET    /users        → list all users
GET    /users/42     → get user 42
POST   /users        → create a user
PATCH  /users/42     → update user 42
DELETE /users/42     → delete user 42
\`\`\`

Responses are typically JSON. Status codes communicate results: 200 OK, 201 Created, 404 Not Found, 401 Unauthorized.`,
    model: "Claude 3.5", modelColor: "#818cf8", category: "Coding",
    tags: ["api", "rest", "http", "web"], upvotes: 198, views: 3900, user: "net@seed.echoai.dev",
  },

  // ── SCIENCE ──────────────────────────────────────────────────────
  {
    prompt: "What causes the northern lights (aurora borealis)?",
    answer: `The aurora borealis is caused by charged particles (mainly electrons and protons) from the Sun colliding with gas molecules in Earth's atmosphere.

Here's the chain: The Sun emits a stream of particles called the **solar wind**. Earth's magnetic field deflects most of them, but near the poles the field lines converge and funnel particles down into the upper atmosphere (~100–300 km up). When these particles collide with oxygen and nitrogen, they excite the atoms, which release energy as light. Different gases produce different colors: oxygen at ~60 miles → green; oxygen at ~200 miles → red; nitrogen → blue/purple.`,
    model: "Gemini 1.5", modelColor: "#f59e0b", category: "Science",
    tags: ["aurora", "solar-wind", "atmosphere", "physics"], upvotes: 487, views: 7203, user: "science@seed.echoai.dev",
  },
  {
    prompt: "How does CRISPR gene editing work?",
    answer: `CRISPR-Cas9 is a gene editing tool adapted from a bacterial immune system. It works like molecular scissors guided by GPS.

**Components:**
1. **Guide RNA (gRNA)** — a ~20-nucleotide sequence that matches your target DNA
2. **Cas9 protein** — an enzyme that cuts DNA

**Process:**
1. You design a gRNA matching the DNA you want to edit
2. Cas9 + gRNA complex scans the genome until it finds the matching sequence
3. Cas9 cuts both strands of DNA at that location
4. The cell repairs the cut — either disrupting the gene (knockout) or inserting new DNA (if you provide a template)

**Why it's revolutionary:** Previous gene editing tools were slow and expensive. CRISPR cuts the time from months to days and costs from millions to thousands of dollars.`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "Science",
    tags: ["crispr", "genetics", "dna", "biology"], upvotes: 523, views: 8901, user: "science@seed.echoai.dev",
  },
  {
    prompt: "What is quantum entanglement in simple terms?",
    answer: `Quantum entanglement is when two particles become correlated so that measuring one instantly determines the state of the other — no matter how far apart they are.

**Simple analogy:** Imagine two magic gloves, one placed in New York and one in Tokyo. When you open the New York box and find a left glove, you instantly know the Tokyo glove is a right glove — even without looking. Entanglement is similar, but stranger: the gloves don't "decide" which hand they are until one is observed.

**Key points:**
- Entangled particles don't "send signals" to each other — this doesn't allow faster-than-light communication
- Measuring one particle collapses both into definite states simultaneously
- Einstein called it "spooky action at a distance" — he didn't like it but it's been experimentally confirmed many times

It's the basis for quantum computing and quantum cryptography.`,
    model: "GPT-4o", modelColor: "#10b981", category: "Science",
    tags: ["quantum-physics", "entanglement", "physics"], upvotes: 634, views: 10200, user: "science@seed.echoai.dev",
  },
  {
    prompt: "Why is the sky blue?",
    answer: `The sky is blue because of **Rayleigh scattering** — the way sunlight interacts with air molecules.

Sunlight contains all colors (wavelengths) of visible light. When it enters Earth's atmosphere, it collides with gas molecules (mostly nitrogen and oxygen). These molecules scatter light in all directions, but they scatter shorter wavelengths (blue, violet) much more strongly than longer wavelengths (red, orange) — about 10× more.

So blue light gets scattered across the entire sky, while red/orange light passes through more directly (which is why sunsets are red — light must travel through more atmosphere at a low angle, scattering away all the blue).

Fun fact: violet light is actually scattered even more than blue, but our eyes are less sensitive to violet and the Sun emits less violet, so we perceive the sky as blue.`,
    model: "Gemini 1.5", modelColor: "#f59e0b", category: "Science",
    tags: ["atmosphere", "light", "physics", "optics"], upvotes: 389, views: 6100, user: "science@seed.echoai.dev",
  },

  // ── MATH ─────────────────────────────────────────────────────────
  {
    prompt: "What is compound interest and how is it calculated?",
    answer: `Compound interest is interest calculated on both the **initial principal** and the **accumulated interest** from previous periods.

Formula: **A = P(1 + r/n)^(nt)**

Where:
- A = final amount
- P = principal (initial investment)
- r = annual interest rate (decimal)
- n = times interest compounds per year
- t = time in years

Example: $1,000 at 5% compounded annually for 10 years:
A = 1000(1 + 0.05/1)^(1×10) = **$1,628.89**

Vs simple interest: 1000 × (1 + 0.05 × 10) = $1,500. Compound gives you $128.89 more — and the gap grows exponentially over time.`,
    model: "GPT-4o", modelColor: "#10b981", category: "Math",
    tags: ["finance", "investing", "compound-interest"], upvotes: 293, views: 5411, user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Explain the Pythagorean theorem and give a real-world example",
    answer: `The Pythagorean theorem states that in a right triangle: **a² + b² = c²**, where c is the hypotenuse (the side opposite the right angle).

**Proof intuition:** if you draw squares on each side of a right triangle, the area of the square on the hypotenuse equals the sum of the areas of the other two squares.

**Real-world example:** You need to mount a TV antenna on your roof. The roof is 4 meters high and you need to run a cable horizontally 3 meters from the wall to the pole. How long is the cable?

c² = 4² + 3² = 16 + 9 = 25
c = √25 = **5 meters**

Other uses: GPS coordinates, computer graphics (distance between two points), construction (checking if corners are square using the 3-4-5 rule).`,
    model: "Claude 3.5", modelColor: "#818cf8", category: "Math",
    tags: ["geometry", "pythagorean", "triangles"], upvotes: 176, views: 2800, user: "science@seed.echoai.dev",
  },
  {
    prompt: "What is a derivative in calculus? Explain intuitively.",
    answer: `A derivative measures the **instantaneous rate of change** of a function — how fast the output is changing at a specific point.

**Intuition:** Imagine driving a car. Your position changes over time. The derivative of your position is your **speed** (velocity). The derivative of your speed is your **acceleration**.

Formally: the derivative f'(x) is the slope of the tangent line to f(x) at point x.

\`\`\`
f'(x) = lim(h→0) [f(x+h) - f(x)] / h
\`\`\`

**Common derivatives:**
- d/dx(xⁿ) = nxⁿ⁻¹  (power rule)
- d/dx(eˣ) = eˣ
- d/dx(sin x) = cos x
- d/dx(ln x) = 1/x

**Example:** f(x) = x² → f'(x) = 2x. At x=3, the slope is 6.`,
    model: "GPT-4o", modelColor: "#10b981", category: "Math",
    tags: ["calculus", "derivatives", "mathematics"], upvotes: 312, views: 4900, user: "science@seed.echoai.dev",
  },

  // ── WRITING ───────────────────────────────────────────────────────
  {
    prompt: "Write a cover letter opening paragraph for a software engineer role at a startup",
    answer: `I'm a software engineer with 4 years of experience building scalable web applications, and I'm genuinely excited about [Company]'s mission to [X]. What draws me to early-stage companies is the opportunity to wear multiple hats — I thrive when I can move fast, make architectural decisions, and see my code directly impact users. At my last role, I shipped [specific achievement], and I'd love to bring that same drive to your team.`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "Writing",
    tags: ["cover-letter", "job-search", "startup"], upvotes: 156, views: 2890, user: "career@seed.echoai.dev",
  },
  {
    prompt: "What makes a great hook for a blog post?",
    answer: `A great hook grabs readers in the first 2–3 sentences by doing one of these:

1. **Bold claim:** "Most productivity advice is wrong — and it's making you worse."
2. **Surprising statistic:** "93% of startups fail within 5 years. The 7% all share one habit."
3. **Story/scene:** "At 2am on a Tuesday, our database was down and 10,000 users were locked out."
4. **Question that creates tension:** "What if the way you're learning to code is wasting 80% of your time?"
5. **Contrarian take:** "I deleted all my productivity apps. Here's why my output tripled."

**What to avoid:** Starting with background context, definitions, or "In this blog post I will...". Jump straight to the tension or insight. Readers decide in 5 seconds whether to keep reading.`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "Writing",
    tags: ["writing", "blogging", "copywriting", "hooks"], upvotes: 201, views: 3400, user: "career@seed.echoai.dev",
  },
  {
    prompt: "How do I write an executive summary?",
    answer: `An executive summary distills a longer document (report, business plan, proposal) into 1–2 pages. Executives should be able to make a decision after reading it alone.

**Structure:**
1. **The situation** (1–2 sentences): What problem or opportunity exists?
2. **The recommendation** (1–2 sentences): What do you propose?
3. **Key findings** (3–5 bullet points): The evidence supporting your recommendation
4. **Impact/ROI** (1 paragraph): What happens if you act? What's the cost of inaction?
5. **Ask** (1 sentence): What do you need? Approval, budget, sign-off?

**Golden rules:**
- Write it last (after the full document), but place it first
- No jargon — assume the reader hasn't read the full doc
- Lead with the conclusion, not the background
- Keep it under 10% of the full document length`,
    model: "GPT-4o", modelColor: "#10b981", category: "Writing",
    tags: ["business-writing", "executive-summary", "communication"], upvotes: 134, views: 2100, user: "career@seed.echoai.dev",
  },

  // ── MEDICAL ───────────────────────────────────────────────────────
  {
    prompt: "How does the immune system recognize pathogens?",
    answer: `The immune system uses a two-layer recognition system:

**1. Innate immunity (fast, non-specific):** Pattern Recognition Receptors (PRRs) — especially Toll-like receptors on immune cells — detect conserved molecular patterns called PAMPs (Pathogen-Associated Molecular Patterns) shared by many pathogens (e.g., bacterial cell wall components, viral RNA). This triggers immediate inflammation.

**2. Adaptive immunity (slow, specific):** Antigens (unique surface proteins) from the pathogen are presented by dendritic cells to T and B lymphocytes via MHC molecules. B cells produce antibodies that bind specifically to those antigens. Memory cells are then retained for faster future responses — this is the basis of vaccines.`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "Medical",
    tags: ["immune-system", "biology", "pathogens", "antibodies"], upvotes: 374, views: 6089, user: "med@seed.echoai.dev",
  },
  {
    prompt: "What is the difference between a virus and a bacterium?",
    answer: `**Bacteria** are single-celled living organisms with their own metabolism and ribosomes. They can reproduce independently. They're much larger (~1–10 micrometers) and can be killed with **antibiotics**.

**Viruses** are not technically alive — they're packets of genetic material (DNA or RNA) wrapped in a protein coat. They can't reproduce on their own and must hijack a host cell's machinery. They're much smaller (~20–300 nanometers). Antibiotics don't work on viruses; **antiviral drugs** or vaccines are used.

**Key difference in treatment:** Taking antibiotics for a viral infection (like the flu or a cold) doesn't work and contributes to antibiotic resistance. Only use antibiotics for bacterial infections.

Examples:
- Bacterial: strep throat, UTIs, tuberculosis
- Viral: flu, COVID-19, HIV, common cold`,
    model: "GPT-4o", modelColor: "#10b981", category: "Medical",
    tags: ["microbiology", "virus", "bacteria", "infection"], upvotes: 289, views: 4700, user: "med@seed.echoai.dev",
  },

  // ── FINANCE ───────────────────────────────────────────────────────
  {
    prompt: "What is dollar-cost averaging (DCA) and should I use it?",
    answer: `**Dollar-cost averaging (DCA)** means investing a fixed amount of money at regular intervals (e.g., $500/month into an index fund), regardless of price.

**Why it works:**
- When prices are low, your fixed amount buys more shares
- When prices are high, you buy fewer shares
- Over time, your average cost per share is lower than the average price

**Example:**
Month 1: price $100 → buy 5 shares
Month 2: price $50 → buy 10 shares
Month 3: price $200 → buy 2.5 shares
Average price: $116.67 | Average cost: $100

**Should you use it?** Yes, if:
- You're investing regularly from a salary (this is just what most 401k contributions do automatically)
- You're anxious about timing the market
- You don't have a large lump sum to invest

If you DO have a lump sum, research shows lump-sum investing beats DCA ~67% of the time. But DCA reduces regret and is psychologically easier.`,
    model: "Claude 3.5", modelColor: "#818cf8", category: "Finance",
    tags: ["investing", "dca", "stocks", "personal-finance"], upvotes: 347, views: 6200, user: "finance@seed.echoai.dev",
  },
  {
    prompt: "What is the difference between a Roth IRA and a Traditional IRA?",
    answer: `Both are individual retirement accounts with tax advantages, but the timing of the tax break differs:

**Traditional IRA:**
- Contributions may be **tax-deductible** (reduces taxable income now)
- Growth is tax-deferred
- Withdrawals in retirement are taxed as ordinary income
- Required minimum distributions (RMDs) start at age 73

**Roth IRA:**
- Contributions are **after-tax** (no deduction now)
- Growth is tax-free
- Qualified withdrawals in retirement are **completely tax-free**
- No RMDs during your lifetime

**Which to choose?**
- Young / lower income now → Roth (pay low taxes now, withdraw tax-free later)
- Peak earning years / high income now → Traditional (deduct now, pay taxes in retirement when income is lower)
- Both have the same 2024 contribution limit: $7,000/year ($8,000 if 50+)

Many advisors recommend having both.`,
    model: "GPT-4o", modelColor: "#10b981", category: "Finance",
    tags: ["ira", "retirement", "investing", "taxes"], upvotes: 412, views: 7800, user: "finance@seed.echoai.dev",
  },

  // ── HISTORY ───────────────────────────────────────────────────────
  {
    prompt: "What caused World War 1?",
    answer: `WWI (1914–1918) was caused by a combination of long-term tensions and a short-term trigger.

**Long-term causes (MAIN):**
- **Militarism** — European powers built up massive armies and navies, creating an arms race
- **Alliance system** — Europe split into two armed camps: Triple Alliance (Germany, Austria-Hungary, Italy) vs Triple Entente (France, Russia, Britain)
- **Imperialism** — competition for colonies created tensions, especially between Germany and established powers
- **Nationalism** — ethnic minorities wanted independence; pan-Slavic movement threatened Austria-Hungary

**Immediate trigger:**
On June 28, 1914, Archduke Franz Ferdinand of Austria-Hungary was assassinated in Sarajevo by Gavrilo Princip (a Bosnian Serb nationalist). Austria-Hungary issued an ultimatum to Serbia. Serbia's partial compliance wasn't enough. The alliance system then dragged in every major European power within weeks.`,
    model: "Gemini 1.5", modelColor: "#f59e0b", category: "History",
    tags: ["world-war-1", "history", "europe"], upvotes: 298, views: 5200, user: "history@seed.echoai.dev",
  },
  {
    prompt: "Who were the Stoics and what did they believe?",
    answer: `Stoicism was a school of philosophy founded in Athens around 300 BC by Zeno of Citium. Key figures: Epictetus, Marcus Aurelius, Seneca.

**Core beliefs:**

1. **The dichotomy of control:** Some things are "up to us" (our thoughts, judgments, desires) and some are not (health, wealth, others' opinions). Happiness comes from focusing only on what we control.

2. **Virtue is the only good:** External things (money, status, health) are "preferred indifferents" — nice to have but not necessary for a good life. Virtue (wisdom, justice, courage, temperance) is the only true good.

3. **Live according to nature:** Humans are rational beings; living rationally and virtuously is living according to our nature.

4. **Emotions come from judgments:** Negative emotions arise from false beliefs. "Men are disturbed not by things, but by their opinions about things." — Epictetus

**Still relevant today:** CBT (cognitive behavioral therapy) is heavily influenced by Stoicism.`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "History",
    tags: ["philosophy", "stoicism", "ancient-greece", "marcus-aurelius"], upvotes: 445, views: 7600, user: "history@seed.echoai.dev",
  },

  // ── LEGAL ─────────────────────────────────────────────────────────
  {
    prompt: "What is the difference between copyright and trademark?",
    answer: `**Copyright** protects original creative works (books, music, code, art, films). It's automatic — you own it the moment you create it. It lasts for the creator's life + 70 years. Copyright protects the specific expression of an idea, not the idea itself.

**Trademark** protects brand identifiers (names, logos, slogans) that distinguish goods/services in commerce. It must be registered (or used in commerce) and actively enforced. Trademarks can last indefinitely as long as they're in use and renewed.

**Key differences:**
- Copyright = what you create; Trademark = what identifies your brand
- Copyright is automatic; Trademark requires registration (for full protection)
- Copyright has a time limit; Trademark can last forever
- Copyright: no one can copy your novel; Trademark: no one can use a confusingly similar logo

**Example:** The specific text of Harry Potter is copyrighted. The "Harry Potter" name/logo used on merchandise is trademarked.

*Note: This is general information, not legal advice. Consult a lawyer for your specific situation.*`,
    model: "GPT-4o", modelColor: "#10b981", category: "Legal",
    tags: ["ip-law", "copyright", "trademark", "legal"], upvotes: 267, views: 4300, user: "legal@seed.echoai.dev",
  },
  {
    prompt: "What is an NDA and when should I sign one?",
    answer: `An **NDA (Non-Disclosure Agreement)** is a legal contract where one or both parties agree to keep certain information confidential.

**Types:**
- **Unilateral** — one party shares confidential info; only the recipient is bound
- **Mutual/Bilateral** — both parties share info; both are bound

**When you'll encounter them:**
- Job interviews (especially at startups, discussing product ideas)
- Freelance/contractor work
- Business partnerships or M&A discussions
- Investor pitches

**Key terms to check before signing:**
1. **Scope** — what exactly is "confidential"? Overly broad definitions can be problematic
2. **Duration** — how long does confidentiality last? 1–5 years is typical; "perpetual" is unusual
3. **Exclusions** — info already public, independently developed, or received from third parties is usually excluded
4. **Jurisdiction** — which state/country's laws apply?
5. **Remedies** — what happens if you breach?

**When to be cautious:** NDAs that try to prevent you from discussing your own skills, or that are perpetual with no exceptions, are red flags.

*Note: Always consult a lawyer before signing legal agreements.*`,
    model: "Claude 3.5", modelColor: "#818cf8", category: "Legal",
    tags: ["nda", "contracts", "legal", "business"], upvotes: 189, views: 3100, user: "legal@seed.echoai.dev",
  },

  // ── GENERAL ───────────────────────────────────────────────────────
  {
    prompt: "What is the Feynman Technique for learning?",
    answer: `The **Feynman Technique** is a learning method developed by Nobel Prize-winning physicist Richard Feynman. It forces deep understanding by requiring you to explain concepts simply.

**4 steps:**

1. **Choose a concept** you want to understand
2. **Explain it as if teaching a child** — use simple words, no jargon. Write it out.
3. **Identify gaps** — where did you get stuck or use jargon? Those are the gaps in your understanding. Go back and study those parts.
4. **Simplify and use analogies** — once you understand it fully, simplify your explanation further. Use stories and analogies.

**Why it works:** The act of explaining reveals what you don't actually understand (vs what you just recognize). If you can't explain it simply, you don't understand it deeply.

Feynman's rule: "If you can't explain it simply, you don't understand it well enough."`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "General",
    tags: ["learning", "feynman", "study", "education"], upvotes: 512, views: 9100, user: "career@seed.echoai.dev",
  },
  {
    prompt: "How does sleep affect memory and learning?",
    answer: `Sleep plays a critical role in **memory consolidation** — the process of moving information from short-term to long-term memory.

**During sleep:**
- **Slow-wave (deep) sleep:** The hippocampus replays recent experiences and transfers them to the neocortex for long-term storage. This is crucial for declarative memory (facts, events).
- **REM sleep:** Associated with procedural memory (skills, habits) and emotional memory processing. This is when most dreaming occurs.
- **Memory reactivation:** The brain literally replays neural patterns from the day, strengthening those connections.

**Practical implications:**
- Studying before sleep is more effective than studying and staying up late
- Sleep deprivation impairs the formation of new memories and retrieval of existing ones
- A 20-minute nap after learning can improve retention by up to 20%
- Pulling all-nighters for exams is counterproductive — you retain less and your recall under stress is worse

Getting 7–9 hours significantly outperforms any supplement or memory hack.`,
    model: "GPT-4o", modelColor: "#10b981", category: "General",
    tags: ["sleep", "memory", "neuroscience", "learning"], upvotes: 423, views: 7400, user: "science@seed.echoai.dev",
  },
  {
    prompt: "What are the best practices for giving constructive feedback?",
    answer: `Constructive feedback is specific, actionable, and delivered in a way the recipient can hear.

**The SBI model (Situation–Behavior–Impact):**
1. **Situation:** When/where (be specific, not "always")
2. **Behavior:** What you observed (not interpreted), e.g., "you interrupted three times"
3. **Impact:** Effect on you/the team: "which made Sarah hesitate to continue"

**Do:**
- Give feedback promptly (within 24–48 hours of the event)
- Start with curiosity: "I noticed X — can you help me understand what happened?"
- Focus on the behavior, not the person
- Be specific: "the report lacked projected revenue" beats "the report needs work"
- End with what success looks like: "next time, I'd love to see..."

**Don't:**
- Sandwich feedback between compliments (the "compliment sandwich") — people hear the praise and ignore the criticism
- Use "always" and "never" — triggers defensiveness
- Give feedback in public (for critical feedback)
- Pile on multiple issues in one session

**The goal:** The person should leave knowing exactly what to do differently.`,
    model: "Claude 3.7", modelColor: "#818cf8", category: "General",
    tags: ["feedback", "management", "communication", "leadership"], upvotes: 334, views: 5600, user: "career@seed.echoai.dev",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create seed users
  const pw = await bcrypt.hash("seedpassword123", 12);
  const userMap: Record<string, string> = {};

  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, password: pw },
    });
    userMap[u.email] = user.id;
  }
  console.log(`✅ Created ${SEED_USERS.length} seed users`);

  // Create answers
  let created = 0;
  for (const qa of QA_PAIRS) {
    await prisma.answer.create({
      data: {
        prompt: qa.prompt,
        answer: qa.answer,
        model: qa.model,
        modelColor: qa.modelColor,
        category: qa.category,
        tags: qa.tags,
        upvotes: qa.upvotes,
        views: qa.views,
        userId: userMap[qa.user],
      },
    });
    created++;
  }
  console.log(`✅ Created ${created} Q&A pairs`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
