import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const groups = [
    { slug: "5-7", label: "5-7 Jaar", sortOrder: 1 },
    { slug: "8-10", label: "8-10 Jaar", sortOrder: 2 },
    { slug: "11-13", label: "11-13 Jaar", sortOrder: 3 },
  ];
  for (const g of groups) {
    await db.ageGroup.upsert({ where: { slug: g.slug }, update: g, create: g });
  }

  const young = await db.ageGroup.findUniqueOrThrow({ where: { slug: "5-7" } });
  if (await db.lesson.findFirst({ where: { ageGroupId: young.id } })) return;

  const words = ["een", "twee", "drie", "vier", "vyf", "ses", "sewe", "agt", "nege", "tien"];
  await db.lesson.create({
    data: {
      ageGroupId: young.id,
      title: "Les 1",
      language: "af",
      published: true,
      categories: {
        create: {
          name: "Nommers",
          tiles: {
            create: words.map((word, i) => ({
              displayValue: String(i + 1),
              visualType: "TEXT" as const,
              visualValue: word,
              sortOrder: i,
            })),
          },
        },
      },
    },
  });
}

main().finally(() => db.$disconnect());
