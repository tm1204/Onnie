import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { gradient } from "@/lib/ui";
import CardShine from "@/components/CardShine";
import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

export default async function AgeGroupPage({ params }: PageProps<"/[ageGroup]">) {
  const { ageGroup: slug } = await params;
  const group = await db.ageGroup.findUnique({
    where: { slug },
    include: {
      lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } },
    },
    relationLoadStrategy: "join",
  });
  if (!group) notFound();

  return (
    <>
      <NavBar backHref="/" title={group.label} />
      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        {group.lessons.length === 0 ? (
          <p className="mt-16 text-center text-xl text-stone-500">Nog geen lesse nie.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {group.lessons.map((l, i) => (
              <li key={l.id}>
                <Link
                  href={`/lessons/${l.id}`}
                  className={`relative flex h-36 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br ${gradient(i)} p-4 text-center text-4xl font-black text-white shadow-lg transition active:scale-95 sm:hover:-translate-y-1`}
                >
                  <CardShine />
                  <span className="relative">{l.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
