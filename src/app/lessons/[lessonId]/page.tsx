import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { categoryIcon, gradient } from "@/lib/ui";
import CardShine from "@/components/CardShine";
import NavBar from "@/components/NavBar";
import VisitedLog from "@/components/VisitedLog";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: PageProps<"/lessons/[lessonId]">) {
  const { lessonId } = await params;
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, published: true },
    include: {
      ageGroup: true,
      categories: { orderBy: { sortOrder: "asc" } },
    },
    relationLoadStrategy: "join",
  });
  if (!lesson) notFound();

  return (
    <>
      <VisitedLog lessonId={lessonId} />
      <NavBar backHref={`/${lesson.ageGroup.slug}`} title={lesson.title} />
      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        {lesson.categories.length === 0 ? (
          <p className="mt-16 text-center text-xl text-stone-500">Nog geen kategorieë nie.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-5">
            {lesson.categories.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/lessons/${lessonId}/${c.id}`}
                  className={`relative flex aspect-[4/3] flex-col items-center justify-center gap-2 overflow-hidden rounded-[2rem] bg-gradient-to-br ${gradient(i)} p-4 text-center text-white shadow-lg transition active:scale-95 sm:hover:-translate-y-1`}
                >
                  <CardShine />
                  <span className="relative text-6xl">{categoryIcon(c.name)}</span>
                  <span className="relative text-2xl font-black sm:text-3xl">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
