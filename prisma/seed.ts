import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { GPT55_SIMPLE_ANSWERS } from "./gpt55-simple-answers";

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

type SeedAnswer = {
  prompt: string;
  answer: string;
  model: string;
  modelColor: string;
  category: string;
  tags: string[];
  upvotes: number;
  views: number;
  user: string;
};

const QA_PAIRS: SeedAnswer[] = [
  {
    prompt: "How do I center a div in CSS?",
    answer: `The cleanest modern way is usually **Flexbox**.

\`\`\`css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

- **justify-content** centers horizontally
- **align-items** centers vertically

If you only need horizontal centering for a block element with a fixed width, you can also use:

\`\`\`css
.box {
  width: 300px;
  margin: 0 auto;
}
\`\`\`

If you are using Tailwind, the common pattern is:
\`flex items-center justify-center\`.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Coding",
    tags: ["css", "frontend", "layout", "html"],
    upvotes: 612,
    views: 12600,
    user: "alex@seed.echoai.dev",
  },
  {
    prompt: "What is an API in simple terms?",
    answer: `An **API** is a way for two pieces of software to talk to each other.

Simple analogy: when you order food in a restaurant:
- **you** are the app or user
- **the waiter** is the API
- **the kitchen** is the server or system doing the work

You do not go into the kitchen yourself. You send a request through the waiter, and the waiter brings back the result.

In software, an API lets one app request data or actions from another app, for example:
- get weather data
- create a payment
- log a user in
- fetch products from a store

APIs are often used over HTTP with actions like:
- **GET** for reading data
- **POST** for creating something
- **PATCH** for updating
- **DELETE** for removing`,
    model: "Claude 3.7",
    modelColor: "#818cf8",
    category: "Coding",
    tags: ["api", "http", "backend", "web"],
    upvotes: 488,
    views: 9400,
    user: "net@seed.echoai.dev",
  },
  {
    prompt: "What is the difference between front-end and back-end development?",
    answer: `**Front-end** is the part users see and interact with.
It includes things like:
- layout
- buttons
- forms
- colors
- animations

Common front-end tools: HTML, CSS, JavaScript, React, Next.js.

**Back-end** is the part behind the scenes.
It handles things like:
- databases
- authentication
- business logic
- APIs
- payments

Common back-end tools: Node.js, Python, Java, Ruby, PostgreSQL.

Simple way to remember it:
- **front-end** = what the user sees
- **back-end** = what makes it work

Most real products need both.`,
    model: "Gemini 1.5",
    modelColor: "#f59e0b",
    category: "Coding",
    tags: ["frontend", "backend", "web-development", "basics"],
    upvotes: 421,
    views: 8100,
    user: "alex@seed.echoai.dev",
  },
  {
    prompt: "How do I write a professional email asking for an update?",
    answer: `A strong follow-up email is short, polite, and easy to answer.

Template:

\`\`\`
Subject: Quick follow-up on [topic]

Hi [Name],

I hope you're doing well. I wanted to follow up on [project / application / request] and see if there are any updates when you have a moment.

Please let me know if you need anything else from me.

Best,
[Your name]
\`\`\`

Tips:
- keep it under 6 lines
- avoid sounding frustrated
- remind them what you are asking about
- include a clear subject line

If this is a second follow-up, you can add:
"I know things get busy, so I just wanted to check in once more."`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Writing",
    tags: ["email", "communication", "professional-writing", "follow-up"],
    upvotes: 534,
    views: 11100,
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "How should I answer 'Tell me about yourself' in a job interview?",
    answer: `A good answer is short, structured, and relevant to the job.

Use this formula:
**present -> past -> why this role**

Example:
"I'm currently working as a customer support specialist, where I help users solve issues quickly and clearly. Before that, I studied business and took on a few internships that taught me how to work with teams and deadlines. What interests me about this role is the chance to use those communication skills in a more growth-focused environment."

What makes this work:
- it starts with where you are now
- it gives a little context from the past
- it ends with why you are here

Keep it to about **45 to 90 seconds**.
Do not tell your whole life story.
Focus on the parts that make sense for the role you want.`,
    model: "Claude 3.7",
    modelColor: "#818cf8",
    category: "Writing",
    tags: ["job-interview", "career", "job-search", "communication"],
    upvotes: 603,
    views: 12400,
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "How do I write a good resume summary?",
    answer: `A resume summary is a short 2-4 line section at the top of your resume that tells recruiters who you are and what you bring.

Good formula:
**role + years of experience + strengths + result**

Example:
"Marketing coordinator with 3 years of experience in content, email campaigns, and social media. Strong at turning ideas into clear campaigns that improve engagement and conversions. Known for being organized, fast-moving, and easy to work with across teams."

Tips:
- keep it specific, not generic
- mention your main area of work
- include 2 or 3 strengths
- write in plain language
- avoid empty phrases like "hardworking professional"

Think of it as the short version of your value.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Writing",
    tags: ["resume", "career", "job-search", "professional-writing"],
    upvotes: 487,
    views: 9800,
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Why is the sky blue?",
    answer: `The sky looks blue because of **Rayleigh scattering**.

Sunlight contains many colors. When sunlight enters Earth's atmosphere, it collides with tiny gas molecules. Shorter wavelengths of light, especially blue, scatter much more than longer wavelengths like red.

That scattered blue light spreads across the sky in all directions, so when you look up, you see blue.

Why sunsets look red:
- at sunset, sunlight travels through more atmosphere
- much of the blue light gets scattered away before it reaches your eyes
- the remaining light looks more red or orange

So the short version is:
the atmosphere scatters blue light more strongly than other visible colors.`,
    model: "Gemini 1.5",
    modelColor: "#f59e0b",
    category: "Science",
    tags: ["science", "light", "atmosphere", "physics"],
    upvotes: 566,
    views: 11700,
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "How do vaccines work?",
    answer: `Vaccines train your immune system to recognize a harmful germ **before** you encounter the real infection.

They usually do this by showing your body a safe version of part of the virus or bacterium, or instructions for making that part. Your immune system responds by creating:
- antibodies
- memory cells

Later, if the real germ enters your body, your immune system can react much faster.

This helps:
- prevent infection entirely in some cases
- reduce how severe the illness becomes
- lower the chance of spreading disease

The key idea is:
vaccines prepare your immune system ahead of time, without making you go through the full danger of the disease itself.`,
    model: "Claude 3.7",
    modelColor: "#818cf8",
    category: "Science",
    tags: ["vaccines", "biology", "immune-system", "health"],
    upvotes: 518,
    views: 10200,
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "What is photosynthesis?",
    answer: `Photosynthesis is the process plants use to turn **sunlight, water, and carbon dioxide** into **glucose** (food) and oxygen.

The basic idea:
- plants absorb sunlight with chlorophyll
- they take in carbon dioxide from the air
- they absorb water through their roots
- they use that energy to make sugar

The simplified formula is:

\`\`\`
carbon dioxide + water + sunlight -> glucose + oxygen
\`\`\`

Why it matters:
- it gives plants energy
- it releases oxygen into the atmosphere
- it supports most food chains on Earth

In short, photosynthesis is how plants make food from sunlight.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Science",
    tags: ["plants", "biology", "photosynthesis", "basics"],
    upvotes: 449,
    views: 8500,
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "What is the Pythagorean theorem?",
    answer: `The Pythagorean theorem says that in a **right triangle**:

\`\`\`
a^2 + b^2 = c^2
\`\`\`

- **a** and **b** are the two shorter sides
- **c** is the longest side, called the hypotenuse

Example:
If the two shorter sides are 3 and 4:

\`\`\`
3^2 + 4^2 = 9 + 16 = 25
\`\`\`

So:

\`\`\`
c = 5
\`\`\`

It is used to find missing distances in geometry, construction, maps, and computer graphics.

Simple memory trick:
square the short sides, add them, then take the square root to get the longest side.`,
    model: "Claude 3.5",
    modelColor: "#818cf8",
    category: "Math",
    tags: ["math", "geometry", "triangles", "basics"],
    upvotes: 472,
    views: 9100,
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "What is compound interest and how does it work?",
    answer: `Compound interest means you earn interest not only on your original money, but also on the interest that has already been added.

That is why people call it **interest on interest**.

Example:
If you invest $1,000 at 5% yearly interest:
- after year 1: $1,050
- after year 2: you earn interest on $1,050, not just $1,000

Over time, the growth becomes faster because each period builds on the previous one.

Basic formula:

\`\`\`
A = P(1 + r/n)^(nt)
\`\`\`

- **P** = starting amount
- **r** = interest rate
- **n** = number of times interest is added per year
- **t** = number of years

The most important idea:
the earlier you start, the more powerful compounding becomes.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Math",
    tags: ["compound-interest", "math", "finance", "basics"],
    upvotes: 644,
    views: 13500,
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "How do I calculate a percentage?",
    answer: `A percentage means **out of 100**.

Basic formula:

\`\`\`
percentage = (part / whole) x 100
\`\`\`

Example:
If 25 students out of 40 passed:

\`\`\`
(25 / 40) x 100 = 62.5%
\`\`\`

Useful shortcuts:
- **10%** = move the decimal one place left
- **1%** = move it two places left
- **50%** = half
- **25%** = one quarter

To find a percentage of a number:

\`\`\`
20% of 80 = 0.20 x 80 = 16
\`\`\`

So there are usually two common tasks:
- finding what percent one number is of another
- finding a percent of a single number`,
    model: "Gemini 1.5",
    modelColor: "#f59e0b",
    category: "Math",
    tags: ["percentages", "math", "calculation", "basics"],
    upvotes: 423,
    views: 7900,
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "What is copyright and how is it different from trademark?",
    answer: `**Copyright** protects original creative work such as:
- books
- music
- films
- illustrations
- software code

**Trademark** protects brand identity such as:
- brand names
- logos
- slogans

Simple difference:
- **copyright** protects the work itself
- **trademark** protects what identifies the business or brand

Example:
- the text of a novel is protected by copyright
- the name of a company and its logo can be protected by trademark

They can sometimes apply to related things, but they are not the same type of protection.

This is general information, not legal advice.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Legal",
    tags: ["copyright", "trademark", "legal", "intellectual-property"],
    upvotes: 405,
    views: 7600,
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "What is an NDA?",
    answer: `An **NDA** is a **Non-Disclosure Agreement**.

It is a legal contract that says certain information must be kept confidential.

People often sign NDAs when:
- starting freelance work
- discussing a business idea
- joining a startup project
- reviewing sensitive company information

An NDA usually explains:
- what information is confidential
- who must protect it
- how long confidentiality lasts
- what happens if someone breaks the agreement

Important point:
an NDA does not mean "everything forever is secret."
The exact wording matters, especially the scope and duration.

This is general information, not legal advice.`,
    model: "Claude 3.5",
    modelColor: "#818cf8",
    category: "Legal",
    tags: ["nda", "contracts", "confidentiality", "legal"],
    upvotes: 382,
    views: 6900,
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "What should I do after a car accident?",
    answer: `A calm, practical order is:

1. **Check for injuries**
2. **Call emergency services** if anyone may be hurt
3. **Move to safety** if possible
4. **Exchange information** with the other driver
5. **Take photos** of damage, plates, and the scene
6. **Get witness details** if there are witnesses
7. **Contact your insurance company**

Useful information to collect:
- names
- phone numbers
- license plates
- insurance details
- location and time

Do not admit fault at the scene.
Just describe what happened factually.

If you feel pain later, get medical attention because some injuries show up after the accident.`,
    model: "Gemini 1.5",
    modelColor: "#f59e0b",
    category: "Legal",
    tags: ["car-accident", "insurance", "practical-help", "safety"],
    upvotes: 517,
    views: 10100,
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "What is the difference between a virus and a bacterium?",
    answer: `A **bacterium** is a living single-celled organism.
A **virus** is much smaller and cannot reproduce on its own. It needs to enter a host cell and use that cell's machinery.

Key differences:
- bacteria are living cells
- viruses are not considered living in the same way
- antibiotics can work against some bacteria
- antibiotics do **not** work against viruses

Examples:
- bacterial infections: some throat infections, some UTIs
- viral infections: flu, colds, COVID-19

This is why doctors do not prescribe antibiotics for every illness.
The right treatment depends on what is causing the infection.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Medical",
    tags: ["virus", "bacteria", "infection", "health"],
    upvotes: 493,
    views: 9200,
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "How can I improve my sleep?",
    answer: `The most effective sleep habits are usually simple and consistent:

- go to bed at the same time every day
- wake up at the same time every day
- reduce screens and bright light before bed
- avoid caffeine late in the day
- keep the room cool, dark, and quiet
- avoid heavy meals right before sleeping

Also helpful:
- get sunlight in the morning
- move your body during the day
- use your bed mainly for sleep, not work

If your mind races at night, try writing tomorrow's tasks down before bed so they are not bouncing around in your head.

If sleep problems continue for a long time or affect daily life, it is worth talking to a healthcare professional.`,
    model: "Claude 3.7",
    modelColor: "#818cf8",
    category: "Medical",
    tags: ["sleep", "health", "wellness", "habits"],
    upvotes: 624,
    views: 13200,
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "What is anxiety?",
    answer: `Anxiety is your mind and body reacting to a sense of threat, pressure, or uncertainty.

It can show up as:
- worry
- racing thoughts
- tension
- fast heartbeat
- trouble sleeping
- feeling on edge

Some anxiety is normal. It becomes a problem when it is frequent, overwhelming, or starts interfering with work, relationships, or daily life.

Helpful first steps can include:
- slow breathing
- better sleep routines
- reducing caffeine
- talking to someone you trust
- therapy or professional support

If anxiety feels severe or persistent, it is a good idea to speak with a healthcare professional.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Medical",
    tags: ["anxiety", "mental-health", "wellbeing", "stress"],
    upvotes: 458,
    views: 8700,
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "What caused World War 1?",
    answer: `World War 1 was caused by a mix of long-term tensions and one immediate trigger.

Major long-term causes:
- military build-up
- alliance systems between countries
- imperial rivalry
- nationalism

Immediate trigger:
the assassination of Archduke Franz Ferdinand of Austria-Hungary in 1914.

That event set off a chain reaction:
- Austria-Hungary moved against Serbia
- alliances pulled in more countries
- the conflict expanded into a world war

So the assassination started the crisis, but Europe was already highly unstable and prepared for conflict.`,
    model: "Gemini 1.5",
    modelColor: "#f59e0b",
    category: "History",
    tags: ["world-war-1", "history", "europe", "war"],
    upvotes: 441,
    views: 8300,
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Who were the Stoics?",
    answer: `The Stoics were ancient philosophers who taught that a good life comes from focusing on what you can control and responding wisely to what you cannot.

Important Stoic thinkers include:
- Zeno
- Seneca
- Epictetus
- Marcus Aurelius

Core Stoic ideas:
- you cannot control everything
- you can control your judgments and actions
- virtue matters more than comfort or status
- peace comes from discipline and perspective

A famous Stoic idea is the **dichotomy of control**:
some things are up to you, and some are not.

That is one reason Stoicism still feels modern today.`,
    model: "Claude 3.7",
    modelColor: "#818cf8",
    category: "History",
    tags: ["stoicism", "philosophy", "history", "marcus-aurelius"],
    upvotes: 392,
    views: 7100,
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "What was the Renaissance?",
    answer: `The Renaissance was a period of major cultural, artistic, and intellectual growth in Europe, roughly from the 14th to the 17th century.

The word means **rebirth** because it involved renewed interest in the ideas of ancient Greece and Rome.

The Renaissance is known for:
- advances in art
- new scientific thinking
- humanism
- exploration
- major changes in education and culture

Important figures include:
- Leonardo da Vinci
- Michelangelo
- Raphael

In simple terms, the Renaissance helped move Europe from the medieval world toward the modern one.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "History",
    tags: ["renaissance", "history", "europe", "art"],
    upvotes: 365,
    views: 6400,
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "What is inflation?",
    answer: `Inflation means prices rise over time, so the same amount of money buys less than before.

Example:
If something cost $10 last year and $10.50 this year, that is inflation.

Why inflation happens:
- demand grows faster than supply
- production costs rise
- wages rise
- too much money circulates relative to available goods

Why it matters:
- your everyday expenses can go up
- savings lose purchasing power if they do not grow
- borrowing and interest rates are affected

A little inflation is normal in most economies.
The problem is when inflation becomes too high or too persistent.`,
    model: "Claude 3.5",
    modelColor: "#818cf8",
    category: "Finance",
    tags: ["inflation", "economics", "money", "personal-finance"],
    upvotes: 554,
    views: 10800,
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "How do I make a simple budget?",
    answer: `A simple budget starts with knowing:
- how much money comes in
- how much money goes out

Basic steps:
1. list your monthly income
2. list fixed costs like rent, bills, insurance
3. list variable costs like food, transport, fun
4. compare total spending to income
5. decide how much to save

A common starting rule is **50/30/20**:
- 50% needs
- 30% wants
- 20% savings or debt repayment

You do not need a perfect spreadsheet at first.
Even a basic note or simple tracker is enough if you use it consistently.

The goal of a budget is not restriction.
It is clarity.`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "Finance",
    tags: ["budgeting", "money", "personal-finance", "saving"],
    upvotes: 607,
    views: 12100,
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "What is dollar-cost averaging?",
    answer: `Dollar-cost averaging means investing a fixed amount of money on a regular schedule, no matter what the price is.

Example:
you invest $200 every month into the same fund.

What happens:
- when prices are high, you buy fewer shares
- when prices are low, you buy more shares

Why people like it:
- it reduces the pressure of trying to time the market
- it creates a steady habit
- it can make investing feel simpler and more disciplined

It does not guarantee profit, but it is a common long-term strategy because it is easy to stick with.`,
    model: "Claude 3.5",
    modelColor: "#818cf8",
    category: "Finance",
    tags: ["investing", "dollar-cost-averaging", "stocks", "personal-finance"],
    upvotes: 471,
    views: 8600,
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "What is the Feynman Technique?",
    answer: `The Feynman Technique is a way to learn by trying to explain something in very simple language.

Basic process:
1. choose a topic
2. explain it as if teaching a beginner
3. notice where you get stuck
4. go back, study the weak spots, and simplify again

Why it works:
it reveals the difference between recognizing information and actually understanding it.

A useful rule is:
if you cannot explain it simply, you probably do not understand it deeply yet.

It is especially useful for:
- studying
- preparing for interviews
- learning complex topics
- checking your own understanding`,
    model: "Claude 3.7",
    modelColor: "#818cf8",
    category: "General",
    tags: ["learning", "study", "feynman-technique", "education"],
    upvotes: 529,
    views: 10300,
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "How can I stop procrastinating?",
    answer: `Procrastination usually gets easier when you make the task smaller and easier to start.

Helpful methods:
- start with just 5 minutes
- break the task into tiny steps
- remove distractions before you begin
- decide the exact next action
- use a timer, like 25 minutes of focus

Example:
Instead of "work on report," start with:
- open the document
- write the title
- draft the first bullet

The biggest mistake is waiting to feel motivated first.
Action often creates motivation, not the other way around.

So the real goal is not "do everything."
It is "make starting easier."`,
    model: "GPT-4o",
    modelColor: "#10b981",
    category: "General",
    tags: ["procrastination", "productivity", "focus", "habits"],
    upvotes: 648,
    views: 13800,
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "How do I manage stress better?",
    answer: `Stress management usually works best when you focus on basics before looking for complicated solutions.

Good starting points:
- sleep enough
- move your body regularly
- reduce overload where possible
- take short breaks during intense work
- talk to someone instead of carrying everything alone

In the moment, it can help to:
- slow your breathing
- step away for a few minutes
- write down what is worrying you
- separate what you can control from what you cannot

Stress is not always a sign of weakness.
Sometimes it is a sign that your load is too high for too long.

If it becomes constant or overwhelming, professional support can really help.`,
    model: "Claude 3.7",
    modelColor: "#818cf8",
    category: "General",
    tags: ["stress", "wellbeing", "mental-health", "self-help"],
    upvotes: 503,
    views: 9400,
    user: "med@seed.echoai.dev",
  },
];

type SimpleGpt55Topic = Pick<SeedAnswer, "prompt" | "answer" | "category" | "tags" | "user">;

const GPT55_MODEL = "GPT-5.5";
const GPT55_COLOR = "#10b981";

const SIMPLE_GPT55_TOPICS: SimpleGpt55Topic[] = [
  {
    prompt: "Quel est l'arbre qui vit le plus longtemps ?",
    answer: "L'arbre connu pour vivre le plus longtemps est souvent le pin de Bristlecone, un pin des montagnes de l'ouest des Etats-Unis. Certains individus ont plus de 4 800 ans. Il existe aussi des colonies clonales encore plus anciennes, mais pour un arbre individuel, le pin de Bristlecone est l'exemple le plus cite.",
    category: "Science",
    tags: ["nature", "arbres", "records", "science"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Quel est l'animal le plus rapide du monde ?",
    answer: "L'animal le plus rapide est le faucon pelerin en piqué. Il peut depasser 300 km/h lorsqu'il plonge pour chasser. Sur terre, l'animal le plus rapide est le guepard, qui peut atteindre environ 100 km/h sur une courte distance.",
    category: "Science",
    tags: ["animaux", "records", "nature"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi la mer est-elle salee ?",
    answer: "La mer est salee parce que l'eau de pluie dissout des mineraux dans les roches, puis les rivieres transportent ces sels vers les oceans. L'eau s'evapore, mais les sels restent. Avec le temps, ils s'accumulent, ce qui rend l'eau de mer salee.",
    category: "Science",
    tags: ["mer", "ocean", "science", "nature"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi le ciel est bleu ?",
    answer: "Le ciel est bleu parce que l'atmosphere diffuse davantage la lumiere bleue que les autres couleurs visibles. Ce phenomene s'appelle la diffusion de Rayleigh. La lumiere bleue se disperse dans toutes les directions, donc le ciel nous parait bleu.",
    category: "Science",
    tags: ["ciel", "lumiere", "physique"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les feuilles changent de couleur en automne ?",
    answer: "Les feuilles changent de couleur parce que les arbres produisent moins de chlorophylle quand les jours raccourcissent. Le vert disparait peu a peu, laissant apparaitre d'autres pigments comme le jaune, l'orange et parfois le rouge.",
    category: "Science",
    tags: ["arbres", "automne", "nature"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Quelle est la planete la plus proche du Soleil ?",
    answer: "La planete la plus proche du Soleil est Mercure. Elle est petite, rocheuse et tourne tres vite autour du Soleil. Une annee sur Mercure dure seulement 88 jours terrestres.",
    category: "Science",
    tags: ["espace", "planetes", "astronomie"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Combien de planetes y a-t-il dans le systeme solaire ?",
    answer: "Il y a 8 planetes dans le systeme solaire : Mercure, Venus, la Terre, Mars, Jupiter, Saturne, Uranus et Neptune. Pluton est aujourd'hui classee comme planete naine.",
    category: "Science",
    tags: ["espace", "planetes", "astronomie"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi la Lune brille la nuit ?",
    answer: "La Lune ne produit pas sa propre lumiere. Elle brille parce qu'elle reflete la lumiere du Soleil. Selon sa position par rapport a la Terre et au Soleil, on voit differentes phases de la Lune.",
    category: "Science",
    tags: ["lune", "espace", "astronomie"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les chats ronronnent ?",
    answer: "Les chats ronronnent souvent quand ils sont detendus ou contents, mais aussi parfois quand ils sont stresses, blesses ou malades. Le ronronnement peut servir a communiquer et a s'apaiser.",
    category: "Science",
    tags: ["chats", "animaux", "comportement"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les chiens remuent la queue ?",
    answer: "Les chiens remuent la queue pour communiquer une emotion. Cela peut indiquer la joie, l'excitation, la curiosite ou parfois le stress. Il faut aussi regarder le reste du corps pour comprendre le message.",
    category: "Science",
    tags: ["chiens", "animaux", "comportement"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Quel est le plus grand animal du monde ?",
    answer: "Le plus grand animal du monde est la baleine bleue. Elle peut mesurer plus de 25 metres et peser plus de 100 tonnes. C'est aussi l'un des plus grands animaux ayant jamais existe.",
    category: "Science",
    tags: ["animaux", "baleine", "records"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Quel est l'ocean le plus grand du monde ?",
    answer: "L'ocean le plus grand du monde est l'ocean Pacifique. Il couvre environ un tiers de la surface de la Terre et il est plus vaste que toutes les terres emergees reunies.",
    category: "Science",
    tags: ["ocean", "geographie", "terre"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les avions volent ?",
    answer: "Les avions volent grace a la portance. Leurs ailes sont formees pour faire circuler l'air de maniere a creer une force vers le haut. Les moteurs donnent la vitesse necessaire pour maintenir cette portance.",
    category: "Science",
    tags: ["avions", "physique", "transport"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi le feu est chaud ?",
    answer: "Le feu est chaud parce qu'il libere de l'energie pendant une reaction chimique appelee combustion. Cette energie se transforme en chaleur et en lumiere.",
    category: "Science",
    tags: ["feu", "chimie", "energie"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi la glace flotte sur l'eau ?",
    answer: "La glace flotte parce qu'elle est moins dense que l'eau liquide. Quand l'eau gele, ses molecules s'organisent en structure plus espacee, ce qui augmente son volume et diminue sa densite.",
    category: "Science",
    tags: ["eau", "glace", "physique"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les saisons existent ?",
    answer: "Les saisons existent parce que l'axe de la Terre est incline. Pendant l'annee, certaines regions recoivent plus ou moins de lumiere solaire directe, ce qui cree les saisons.",
    category: "Science",
    tags: ["saisons", "terre", "astronomie"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi il pleut ?",
    answer: "Il pleut quand l'eau evaporee forme des nuages, puis se condense en gouttes trop lourdes pour rester en suspension dans l'air. Ces gouttes tombent alors sous forme de pluie.",
    category: "Science",
    tags: ["pluie", "meteo", "eau"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les arcs-en-ciel apparaissent ?",
    answer: "Un arc-en-ciel apparait quand la lumiere du Soleil traverse des gouttes d'eau. La lumiere est reflechie et separee en differentes couleurs, comme dans un prisme.",
    category: "Science",
    tags: ["arc-en-ciel", "lumiere", "meteo"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les aimants attirent le metal ?",
    answer: "Les aimants attirent certains metaux parce qu'ils produisent un champ magnetique. Les metaux comme le fer, le nickel et le cobalt reagissent fortement a ce champ.",
    category: "Science",
    tags: ["aimants", "magnetisme", "physique"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Quel est le metal le plus leger ?",
    answer: "Le lithium est le metal le plus leger. Il est tres reactif et il est souvent utilise dans les batteries rechargeables.",
    category: "Science",
    tags: ["metaux", "chimie", "lithium"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Quelle est la difference entre une etoile et une planete ?",
    answer: "Une etoile produit sa propre lumiere grace a des reactions nucleaires. Une planete ne produit pas sa propre lumiere : elle reflete la lumiere d'une etoile et tourne autour d'elle.",
    category: "Science",
    tags: ["etoiles", "planetes", "astronomie"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les dinosaures ont disparu ?",
    answer: "La theorie la plus acceptee est qu'un enorme asteroide a frappe la Terre il y a environ 66 millions d'annees. L'impact a modifie le climat, rendant la survie tres difficile pour de nombreuses especes.",
    category: "Science",
    tags: ["dinosaures", "histoire", "science"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les abeilles sont importantes ?",
    answer: "Les abeilles sont importantes parce qu'elles pollinisent de nombreuses plantes. En transportant le pollen, elles aident les fruits, les legumes et les fleurs a se reproduire.",
    category: "Science",
    tags: ["abeilles", "nature", "pollinisation"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les plantes ont besoin de soleil ?",
    answer: "Les plantes ont besoin de soleil pour faire la photosynthese. Elles utilisent la lumiere pour transformer l'eau et le dioxyde de carbone en energie sous forme de sucre.",
    category: "Science",
    tags: ["plantes", "soleil", "photosynthese"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Quelle est la difference entre meteo et climat ?",
    answer: "La meteo decrit le temps qu'il fait a court terme, comme aujourd'hui ou cette semaine. Le climat decrit les tendances moyennes sur une longue periode, souvent plusieurs decennies.",
    category: "Science",
    tags: ["meteo", "climat", "terre"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi faut-il boire de l'eau ?",
    answer: "Il faut boire de l'eau parce que le corps en a besoin pour reguler la temperature, transporter les nutriments, aider la digestion et faire fonctionner les organes. Meme une legere deshydratation peut fatiguer.",
    category: "Medical",
    tags: ["eau", "sante", "hydratation"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Combien d'heures faut-il dormir ?",
    answer: "La plupart des adultes ont besoin d'environ 7 a 9 heures de sommeil par nuit. Les besoins varient selon l'age, la sante et le rythme de vie.",
    category: "Medical",
    tags: ["sommeil", "sante", "bien-etre"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi le sommeil est important ?",
    answer: "Le sommeil aide le corps a recuperer, soutient la memoire, l'humeur, le systeme immunitaire et la concentration. Un manque de sommeil regulier peut affecter la sante et les performances.",
    category: "Medical",
    tags: ["sommeil", "memoire", "sante"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi le sport est bon pour la sante ?",
    answer: "Le sport aide le coeur, les muscles, le sommeil et l'humeur. Il peut aussi reduire le stress et soutenir la prevention de certaines maladies. Meme une activite moderee et reguliere peut aider.",
    category: "Medical",
    tags: ["sport", "sante", "bien-etre"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Quelle est la difference entre virus et bacterie ?",
    answer: "Une bacterie est un organisme vivant unicellulaire. Un virus est beaucoup plus petit et doit entrer dans une cellule pour se reproduire. Les antibiotiques peuvent agir sur certaines bacteries, mais pas sur les virus.",
    category: "Medical",
    tags: ["virus", "bacterie", "sante"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi a-t-on de la fievre ?",
    answer: "La fievre est une reaction du corps face a une infection ou une inflammation. Elle aide parfois le systeme immunitaire a mieux combattre certains microbes. Une fievre forte ou persistante doit etre surveillee.",
    category: "Medical",
    tags: ["fievre", "sante", "infection"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi le stress fatigue ?",
    answer: "Le stress fatigue parce qu'il maintient le corps en etat d'alerte. Le coeur, le cerveau et les hormones travaillent davantage, ce qui peut epuiser l'energie avec le temps.",
    category: "Medical",
    tags: ["stress", "fatigue", "sante"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Comment mieux dormir naturellement ?",
    answer: "Pour mieux dormir, il aide de garder des horaires reguliers, limiter les ecrans avant le coucher, eviter la cafeine tard, garder la chambre sombre et fraiche, et creer une routine calme.",
    category: "Medical",
    tags: ["sommeil", "habitudes", "bien-etre"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi les vitamines sont importantes ?",
    answer: "Les vitamines aident le corps a fonctionner correctement. Elles soutiennent l'energie, l'immunite, la croissance, la peau, les os et de nombreux processus internes. Une alimentation variee aide souvent a couvrir les besoins.",
    category: "Medical",
    tags: ["vitamines", "nutrition", "sante"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi se laver les mains est important ?",
    answer: "Se laver les mains reduit la transmission des microbes. C'est l'un des gestes les plus simples pour eviter certaines infections, surtout avant de manger et apres etre alle aux toilettes.",
    category: "Medical",
    tags: ["hygiene", "sante", "microbes"],
    user: "med@seed.echoai.dev",
  },
  {
    prompt: "Comment faire un budget simple ?",
    answer: "Pour faire un budget simple, note tes revenus, tes depenses fixes, tes depenses variables et ce que tu veux mettre de cote. Une methode facile est 50% besoins, 30% envies et 20% epargne ou dettes.",
    category: "Finance",
    tags: ["budget", "argent", "finance-personnelle"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce que l'inflation ?",
    answer: "L'inflation signifie que les prix augmentent avec le temps. Quand il y a de l'inflation, la meme somme d'argent permet d'acheter moins de choses qu'avant.",
    category: "Finance",
    tags: ["inflation", "economie", "argent"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce que l'epargne ?",
    answer: "L'epargne est l'argent que l'on met de cote au lieu de le depenser tout de suite. Elle peut servir aux urgences, aux projets futurs ou aux investissements.",
    category: "Finance",
    tags: ["epargne", "argent", "finance-personnelle"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Quelle est la difference entre salaire brut et salaire net ?",
    answer: "Le salaire brut est le montant avant les cotisations et deductions. Le salaire net est ce que tu recois reellement sur ton compte apres ces deductions.",
    category: "Finance",
    tags: ["salaire", "travail", "argent"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un interet compose ?",
    answer: "L'interet compose signifie que tu gagnes des interets sur ton capital initial, mais aussi sur les interets deja gagnes. C'est pour cela que l'argent peut croitre plus vite avec le temps.",
    category: "Finance",
    tags: ["interets", "epargne", "investissement"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'une action en bourse ?",
    answer: "Une action est une petite part d'une entreprise. Quand tu possedes une action, tu possedes une fraction de cette entreprise. Sa valeur peut monter ou descendre selon les resultats et le marche.",
    category: "Finance",
    tags: ["bourse", "actions", "investissement"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un ETF ?",
    answer: "Un ETF est un fonds cote en bourse qui regroupe plusieurs actifs, souvent des actions. Il permet d'investir dans un panier diversifie avec un seul produit.",
    category: "Finance",
    tags: ["etf", "bourse", "investissement"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi diversifier ses investissements ?",
    answer: "Diversifier permet de ne pas mettre tout son argent au meme endroit. Si un investissement baisse, d'autres peuvent compenser. Cela reduit le risque global.",
    category: "Finance",
    tags: ["diversification", "investissement", "risque"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un credit ?",
    answer: "Un credit est de l'argent emprunte que l'on doit rembourser plus tard, souvent avec des interets. Il peut servir a acheter une maison, une voiture ou financer un projet.",
    category: "Finance",
    tags: ["credit", "pret", "argent"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Comment economiser de l'argent facilement ?",
    answer: "Pour economiser plus facilement, commence par suivre tes depenses, annuler les abonnements inutiles, comparer les prix et mettre une petite somme de cote automatiquement chaque mois.",
    category: "Finance",
    tags: ["economies", "argent", "budget"],
    user: "finance@seed.echoai.dev",
  },
  {
    prompt: "Comment ecrire un email professionnel ?",
    answer: "Un email professionnel doit etre clair, court et poli. Mets un objet precis, commence par une salutation, explique la demande simplement, puis termine avec une formule de politesse.",
    category: "Writing",
    tags: ["email", "travail", "communication"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment demander poliment une reponse ?",
    answer: "Tu peux ecrire : Bonjour, je me permets de revenir vers vous concernant mon precedent message. Avez-vous eu l'occasion de le consulter ? Je reste disponible si besoin. Cordialement.",
    category: "Writing",
    tags: ["email", "relance", "politesse"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment dire non poliment ?",
    answer: "Pour dire non poliment, remercie la personne, donne une reponse claire et propose une alternative si possible. Exemple : Merci pour la proposition, mais je ne pourrai pas accepter cette fois-ci.",
    category: "Writing",
    tags: ["communication", "politesse", "travail"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment commencer une lettre de motivation ?",
    answer: "Commence par dire le poste vise, pourquoi il t'interesse et ce que tu peux apporter. Evite les phrases trop generiques et essaie de montrer un lien clair avec l'entreprise.",
    category: "Writing",
    tags: ["lettre-de-motivation", "emploi", "carriere"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment repondre a 'parlez-moi de vous' en entretien ?",
    answer: "Reponds en trois parties : ta situation actuelle, ton parcours utile, puis pourquoi le poste t'interesse. Garde la reponse courte, environ une minute, et relie-la au poste.",
    category: "Writing",
    tags: ["entretien", "emploi", "carriere"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment faire un resume de texte ?",
    answer: "Lis le texte, repere l'idee principale, note les points importants, puis reformule avec tes propres mots. Un bon resume garde l'essentiel sans copier chaque detail.",
    category: "Writing",
    tags: ["resume", "ecriture", "etudes"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment ameliorer son orthographe ?",
    answer: "Pour ameliorer ton orthographe, lis regulierement, relis tes textes, note tes erreurs frequentes et utilise les correcteurs comme aide, pas comme remplacement de l'apprentissage.",
    category: "Writing",
    tags: ["orthographe", "ecriture", "francais"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment ecrire un message de remerciement ?",
    answer: "Un bon message de remerciement est simple et sincere. Dis merci, precise ce que tu as apprecie, puis termine par une phrase courte et chaleureuse.",
    category: "Writing",
    tags: ["remerciement", "message", "communication"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment ecrire une introduction de dissertation ?",
    answer: "Une introduction de dissertation contient souvent une accroche, une presentation du sujet, une problematique et l'annonce du plan. Elle doit guider le lecteur sans tout developper.",
    category: "Writing",
    tags: ["dissertation", "etudes", "ecriture"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment trouver un bon titre ?",
    answer: "Un bon titre doit etre clair, precis et donner envie de lire. Il peut promettre un benefice, poser une question ou resumer l'idee centrale en peu de mots.",
    category: "Writing",
    tags: ["titre", "ecriture", "contenu"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment calculer un pourcentage ?",
    answer: "Pour calculer un pourcentage, divise la partie par le total, puis multiplie par 100. Exemple : 25 sur 50 donne 25 / 50 x 100 = 50%.",
    category: "Math",
    tags: ["pourcentage", "calcul", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Comment calculer une moyenne ?",
    answer: "Pour calculer une moyenne, additionne toutes les valeurs puis divise par le nombre de valeurs. Exemple : 10, 12 et 14 donnent 36 / 3 = 12.",
    category: "Math",
    tags: ["moyenne", "calcul", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'une fraction ?",
    answer: "Une fraction represente une partie d'un tout. Par exemple, 1/2 signifie une partie sur deux, donc la moitie.",
    category: "Math",
    tags: ["fraction", "math", "bases"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un nombre premier ?",
    answer: "Un nombre premier est un nombre entier superieur a 1 qui ne peut etre divise que par 1 et par lui-meme. Par exemple, 2, 3, 5, 7 et 11 sont premiers.",
    category: "Math",
    tags: ["nombre-premier", "math", "arithmetique"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Comment convertir des kilometres en metres ?",
    answer: "Pour convertir des kilometres en metres, multiplie par 1 000. Par exemple, 3 kilometres = 3 000 metres.",
    category: "Math",
    tags: ["conversion", "metres", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Comment convertir des heures en minutes ?",
    answer: "Pour convertir des heures en minutes, multiplie par 60. Par exemple, 2 heures = 120 minutes.",
    category: "Math",
    tags: ["conversion", "temps", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce que le theoreme de Pythagore ?",
    answer: "Le theoreme de Pythagore dit que dans un triangle rectangle, le carre du plus grand cote est egal a la somme des carres des deux autres cotes : a2 + b2 = c2.",
    category: "Math",
    tags: ["pythagore", "geometrie", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Comment resoudre une equation simple ?",
    answer: "Pour resoudre une equation simple, l'objectif est d'isoler l'inconnue. Fais la meme operation des deux cotes pour garder l'egalite vraie.",
    category: "Math",
    tags: ["equation", "algebre", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un angle droit ?",
    answer: "Un angle droit mesure 90 degres. On le retrouve dans les coins d'un carre ou d'un rectangle.",
    category: "Math",
    tags: ["angle", "geometrie", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Comment calculer l'aire d'un rectangle ?",
    answer: "Pour calculer l'aire d'un rectangle, multiplie la longueur par la largeur. Exemple : 5 x 3 = 15, donc l'aire est 15 unites carrees.",
    category: "Math",
    tags: ["aire", "rectangle", "math"],
    user: "science@seed.echoai.dev",
  },
  {
    prompt: "Qui etait Napoleon Bonaparte ?",
    answer: "Napoleon Bonaparte etait un general puis empereur francais. Il a dirige la France au debut du XIXe siecle et a marque l'histoire europeenne par ses reformes et ses guerres.",
    category: "History",
    tags: ["napoleon", "france", "histoire"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi la Revolution francaise a commence ?",
    answer: "La Revolution francaise a commence a cause de fortes inegalites, de problemes financiers, de la hausse des prix et d'une contestation du pouvoir absolu du roi.",
    category: "History",
    tags: ["revolution-francaise", "france", "histoire"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce que la Renaissance ?",
    answer: "La Renaissance est une periode de renouveau artistique, scientifique et culturel en Europe. Elle commence vers le XIVe siecle et remet en valeur les savoirs de l'Antiquite.",
    category: "History",
    tags: ["renaissance", "europe", "histoire"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Qui a decouvert l'Amerique ?",
    answer: "Christophe Colomb est souvent cite pour avoir atteint l'Amerique en 1492, du point de vue europeen. Mais le continent etait deja habite depuis des milliers d'annees par des peuples autochtones.",
    category: "History",
    tags: ["amerique", "colomb", "histoire"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi la Premiere Guerre mondiale a commence ?",
    answer: "La Premiere Guerre mondiale a commence apres l'assassinat de l'archiduc Francois-Ferdinand en 1914, mais les causes profondes etaient les alliances, le nationalisme, les rivalites imperiales et la militarisation.",
    category: "History",
    tags: ["premiere-guerre-mondiale", "histoire", "europe"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Pourquoi la Seconde Guerre mondiale a commence ?",
    answer: "La Seconde Guerre mondiale a commence en 1939 apres l'invasion de la Pologne par l'Allemagne nazie. Les tensions venaient aussi du traite de Versailles, de la crise economique et de la montee des regimes totalitaires.",
    category: "History",
    tags: ["seconde-guerre-mondiale", "histoire", "europe"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Qui etait Jules Cesar ?",
    answer: "Jules Cesar etait un general et homme politique romain. Il a joue un role majeur dans la fin de la Republique romaine et a ete assassine en 44 av. J.-C.",
    category: "History",
    tags: ["rome", "cesar", "histoire"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce que l'Egypte ancienne ?",
    answer: "L'Egypte ancienne etait une grande civilisation nee autour du Nil. Elle est connue pour ses pharaons, ses pyramides, ses temples, son ecriture hieroglyphique et ses avancees en architecture.",
    category: "History",
    tags: ["egypte", "antiquite", "histoire"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Qui etaient les Vikings ?",
    answer: "Les Vikings etaient des peuples scandinaves actifs surtout entre le VIIIe et le XIe siecle. Ils etaient navigateurs, commercants, explorateurs et parfois guerriers.",
    category: "History",
    tags: ["vikings", "scandinavie", "histoire"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce que la guerre froide ?",
    answer: "La guerre froide etait une periode de tension entre les Etats-Unis et l'Union sovietique apres la Seconde Guerre mondiale. Elle s'appelait froide car les deux puissances ne se sont pas affrontees directement dans une guerre totale.",
    category: "History",
    tags: ["guerre-froide", "histoire", "politique"],
    user: "history@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un contrat ?",
    answer: "Un contrat est un accord entre deux ou plusieurs parties qui cree des obligations. Il peut etre ecrit ou parfois oral, mais un document ecrit est souvent plus clair en cas de conflit.",
    category: "Legal",
    tags: ["contrat", "droit", "accord"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'une facture ?",
    answer: "Une facture est un document qui detaille une vente ou un service : ce qui a ete fourni, le prix, les taxes eventuelles, la date et les informations du vendeur et du client.",
    category: "Legal",
    tags: ["facture", "administratif", "business"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'une assurance ?",
    answer: "Une assurance est un contrat qui protege contre certains risques. En echange d'une cotisation, l'assureur peut indemniser en cas de probleme couvert par le contrat.",
    category: "Legal",
    tags: ["assurance", "contrat", "administratif"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Quelle est la difference entre copyright et marque ?",
    answer: "Le copyright protege une oeuvre creative, comme un texte, une musique ou une image. Une marque protege un signe commercial, comme un nom, un logo ou un slogan.",
    category: "Legal",
    tags: ["copyright", "marque", "propriete-intellectuelle"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'une mise en demeure ?",
    answer: "Une mise en demeure est une lettre officielle demandant a quelqu'un d'executer une obligation, comme payer une somme ou respecter un contrat, avant d'envisager d'autres actions.",
    category: "Legal",
    tags: ["mise-en-demeure", "droit", "administratif"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un bail ?",
    answer: "Un bail est un contrat de location entre un proprietaire et un locataire. Il precise le logement, le loyer, la duree, les obligations et les conditions de location.",
    category: "Legal",
    tags: ["bail", "logement", "contrat"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'une procuration ?",
    answer: "Une procuration est un document qui autorise une personne a agir a la place d'une autre pour une demarche precise, comme voter, signer ou recuperer un document.",
    category: "Legal",
    tags: ["procuration", "administratif", "droit"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un devis ?",
    answer: "Un devis est une proposition de prix pour un service ou un produit. Il detaille ce qui sera fourni et le montant estime. Une fois accepte, il peut engager les parties.",
    category: "Legal",
    tags: ["devis", "business", "administratif"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Qu'est-ce qu'un NDA ?",
    answer: "Un NDA, ou accord de confidentialite, est un contrat qui oblige une ou plusieurs personnes a garder certaines informations secretes.",
    category: "Legal",
    tags: ["nda", "confidentialite", "contrat"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Que faire apres un accident de voiture ?",
    answer: "Apres un accident, verifie d'abord la securite et les blessures, appelle les secours si necessaire, prends des photos, echange les informations avec l'autre conducteur et contacte ton assurance.",
    category: "Legal",
    tags: ["accident", "assurance", "voiture"],
    user: "legal@seed.echoai.dev",
  },
  {
    prompt: "Comment arreter de procrastiner ?",
    answer: "Pour arreter de procrastiner, reduis la tache a une premiere action tres simple. Par exemple, au lieu de 'faire le dossier', commence par ouvrir le document. Le plus dur est souvent de commencer.",
    category: "General",
    tags: ["procrastination", "productivite", "habitudes"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment mieux gerer son temps ?",
    answer: "Pour mieux gerer ton temps, note tes priorites, bloque des moments pour les taches importantes et limite les distractions. Une liste courte de 3 priorites par jour est souvent plus efficace qu'une longue liste.",
    category: "General",
    tags: ["temps", "organisation", "productivite"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment apprendre plus vite ?",
    answer: "Pour apprendre plus vite, alterne lecture, pratique et rappel actif. Essaie d'expliquer ce que tu apprends avec tes propres mots. Ce qui est pratique et repete reste mieux en memoire.",
    category: "General",
    tags: ["apprentissage", "memoire", "etudes"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment rester motive ?",
    answer: "La motivation devient plus stable quand tu relies ton objectif a une raison claire, que tu avances par petites etapes et que tu mesures tes progres. Les habitudes comptent plus que l'inspiration du moment.",
    category: "General",
    tags: ["motivation", "habitudes", "objectifs"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment prendre une bonne decision ?",
    answer: "Pour prendre une bonne decision, clarifie le probleme, liste les options, compare les avantages et les risques, puis choisis avec les informations disponibles. Attendre la certitude parfaite peut bloquer l'action.",
    category: "General",
    tags: ["decision", "reflexion", "organisation"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment faire une to-do list efficace ?",
    answer: "Une to-do list efficace contient des actions claires, pas des idees vagues. Ecris par exemple 'appeler le client' plutot que 'projet client'. Garde la liste courte pour rester realiste.",
    category: "General",
    tags: ["organisation", "todo", "productivite"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment ameliorer sa concentration ?",
    answer: "Pour ameliorer ta concentration, travaille par blocs courts, range les distractions, coupe les notifications et fais des pauses regulieres. Un environnement simple aide beaucoup.",
    category: "General",
    tags: ["concentration", "focus", "productivite"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment se presenter simplement ?",
    answer: "Pour te presenter simplement, dis ton nom, ce que tu fais, ton experience principale et ce que tu recherches ou proposes. Le plus important est d'etre clair et naturel.",
    category: "General",
    tags: ["presentation", "communication", "travail"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment se faire des amis ?",
    answer: "Pour se faire des amis, il faut creer des occasions regulieres de voir les memes personnes, poser des questions sinceres, proposer des activites simples et laisser la relation se construire avec le temps.",
    category: "General",
    tags: ["amis", "relations", "vie-quotidienne"],
    user: "career@seed.echoai.dev",
  },
  {
    prompt: "Comment gerer une dispute calmement ?",
    answer: "Pour gerer une dispute calmement, parle plus lentement, ecoute avant de repondre, decris les faits plutot que d'attaquer la personne et cherche un point concret a resoudre.",
    category: "General",
    tags: ["conflit", "communication", "relations"],
    user: "career@seed.echoai.dev",
  },
];

function lowercaseFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function withoutQuestionMark(value: string) {
  return value.replace(/\?$/, "");
}

const SIMPLE_GPT55_QA_PAIRS: SeedAnswer[] = SIMPLE_GPT55_TOPICS.flatMap((topic, index) => {
  const prompts = [
    topic.prompt,
    `Explique simplement : ${lowercaseFirst(withoutQuestionMark(topic.prompt))}`,
    `Reponse courte : ${lowercaseFirst(withoutQuestionMark(topic.prompt))}`,
  ];

  return prompts.map((prompt, variantIndex) => ({
    ...topic,
    prompt,
    model: GPT55_MODEL,
    modelColor: GPT55_COLOR,
    upvotes: 120 + ((index * 17 + variantIndex * 11) % 520),
    views: 1800 + ((index * 431 + variantIndex * 269) % 12000),
  }));
});

const ENGLISH_GPT55_QA_PAIRS: SeedAnswer[] = GPT55_SIMPLE_ANSWERS.map((topic, index) => ({
  ...topic,
  model: GPT55_MODEL,
  modelColor: GPT55_COLOR,
  upvotes: 160 + ((index * 19) % 420),
  views: 2400 + ((index * 457) % 11000),
}));

async function main() {
  console.log("🌱 Adding English GPT-5.5 answers...");

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
  console.log(`✅ Ready with ${SEED_USERS.length} seed users`);
  console.log(`ℹ️ Keeping existing answers untouched; legacy templates available: ${QA_PAIRS.length}`);
  console.log(`ℹ️ Disabled old generated variants: ${SIMPLE_GPT55_QA_PAIRS.length}`);

  let created = 0;
  let skipped = 0;
  for (const qa of ENGLISH_GPT55_QA_PAIRS) {
    const existing = await prisma.answer.findFirst({
      where: {
        prompt: qa.prompt,
        model: qa.model,
      },
      select: { id: true },
    });

    if (existing) {
      skipped++;
      continue;
    }

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

  console.log(`✅ Created ${created} English GPT-5.5 answers`);
  console.log(`↪️ Skipped ${skipped} answers already present`);
  console.log("🎉 Additive seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
