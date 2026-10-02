import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { previewHref } from "@/lib/preview";
import { categoryIcon } from "@/lib/ui";
import FormButtons from "@/components/admin/FormButtons";
import MoveButtons from "@/components/admin/MoveButtons";
import { Banner, Field, LinkButton, PageHeader, button, card, field } from "@/components/admin/ui";
import { createCategory, deleteLesson, moveCategory, saveLesson } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminLesson({
  params,
  searchParams,
}: PageProps<"/admin/lessons/[lessonId]">) {
  const { lessonId } = await params;
  const { saved } = await searchParams;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      ageGroup: true,
      categories: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        include: { _count: { select: { tiles: true } } },
      },
    },
    relationLoadStrategy: "join",
  });
  if (!lesson) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <PageHeader
        crumbs={[
          { label: "Age groups", href: "/admin" },
          { label: lesson.ageGroup.label, href: `/admin/age-groups/${lesson.ageGroupId}` },
        ]}
        actions={
          <LinkButton href={previewHref(`/lessons/${lessonId}`, `/admin/lessons/${lessonId}`)} size="sm">
            Preview
          </LinkButton>
        }
      />
      <h1 className="text-3xl font-black">{lesson.title}</h1>
      {saved && <Banner kind="success">Saved.</Banner>}

      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">Lesson settings</h2>
        <form action={saveLesson} className="flex flex-col items-start gap-4">
          <input type="hidden" name="id" value={lesson.id} />
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Title">
              <input name="title" defaultValue={lesson.title} required className={field} />
            </Field>
            <Field label="Language">
              <input name="language" defaultValue={lesson.language} placeholder="e.g. Afrikaans" className={`${field} w-40`} />
            </Field>
          </div>
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" name="published" defaultChecked={lesson.published} className="h-5 w-5" />
            Published (visible to students)
          </label>
          <div className="w-full">
            <FormButtons
              backHref={`/admin/age-groups/${lesson.ageGroupId}`}
              backLabel={lesson.ageGroup.label}
              deleteAction={deleteLesson}
              deleteLabel="Delete lesson"
              deleteMessage={`Delete "${lesson.title}" and everything in it? This cannot be undone.`}
            />
          </div>
        </form>
      </section>

      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">Categories</h2>
        {lesson.categories.length === 0 ? (
          <p className="text-stone-500">No categories yet. Add one below.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {lesson.categories.map((c, i) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-xl border border-stone-200 pr-3 hover:border-amber-400"
              >
                <Link
                  href={`/admin/categories/${c.id}`}
                  className="flex flex-1 items-center gap-3 rounded-l-xl p-4 hover:bg-amber-50"
                >
                  <span className="text-3xl">{categoryIcon(c.name)}</span>
                  <span>
                    <span className="block text-lg font-bold">{c.name}</span>
                    <span className="text-sm text-stone-500">{c._count.tiles} tiles</span>
                  </span>
                </Link>
                <MoveButtons
                  id={c.id}
                  action={moveCategory}
                  isFirst={i === 0}
                  isLast={i === lesson.categories.length - 1}
                />
              </li>
            ))}
          </ul>
        )}
        <form action={createCategory} className="mt-5 flex flex-col items-start gap-4">
          <input type="hidden" name="lessonId" value={lessonId} />
          <Field label="New category">
            <input name="name" placeholder="Kleure, Klanke…" required className={`${field} w-72`} />
          </Field>
          <button className={button("dark")}>Add category</button>
        </form>
      </section>
    </main>
  );
}
