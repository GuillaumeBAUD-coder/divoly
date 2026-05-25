import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { GPT55_SIMPLE_ANSWERS } from "./gpt55-simple-answers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const GPT55_MODEL = "GPT-5.5";
const GPT55_COLOR = "#10b981";
const SEED_EMAILS = Array.from(new Set(GPT55_SIMPLE_ANSWERS.map((answer) => answer.user)));

async function main() {
  console.log("Replacing seeded GPT-5.5 answers with one English prompt per topic...");

  const deleted = await prisma.answer.deleteMany({
    where: {
      model: GPT55_MODEL,
      user: { email: { in: SEED_EMAILS } },
    },
  });

  let created = 0;
  for (const answer of GPT55_SIMPLE_ANSWERS) {
    const user = await prisma.user.findUnique({
      where: { email: answer.user },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`Seed user not found: ${answer.user}`);
    }

    await prisma.answer.create({
      data: {
        prompt: answer.prompt,
        answer: answer.answer,
        model: GPT55_MODEL,
        modelColor: GPT55_COLOR,
        category: answer.category,
        tags: answer.tags,
        upvotes: 160 + ((created * 19) % 420),
        views: 2400 + ((created * 457) % 11000),
        userId: user.id,
      },
    });
    created++;
  }

  console.log(`Deleted ${deleted.count} old seeded GPT-5.5 answers`);
  console.log(`Created ${created} English GPT-5.5 answers`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
