import Link from "next/link";
import { db } from "@/lib/db";
import { gradient } from "@/lib/ui";
import CardShine from "@/components/CardShine";

export const dynamic = "force-dynamic";

export default async function Home() {
  const groups = await db.ageGroup.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 p-6">
      <header className="text-center">
        <h1 className="text-6xl font-black tracking-tight text-amber-500 drop-shadow-sm sm:text-7xl">
          Onnie
        </h1>
        <p className="mt-2 text-xl text-stone-600">Kies jou ouderdom</p>
      </header>
      <ul className="grid gap-5 sm:grid-cols-3">
        {groups.map((g, i) => (
          <li key={g.id}>
            <Link
              href={`/${g.slug}`}
              className={`relative flex h-44 flex-col items-center justify-center gap-1 overflow-hidden rounded-[2rem] bg-gradient-to-br ${gradient(i)} text-white shadow-lg transition active:scale-95 sm:hover:-translate-y-1`}
            >
              <CardShine />
              <span className="relative px-3 text-center text-4xl font-black">{g.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
