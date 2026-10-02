import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { previewHref } from "@/lib/preview";
import MoveButtons from "@/components/admin/MoveButtons";
import { Banner, Field, LinkButton, PageHeader, button, card, field } from "@/components/admin/ui";
import { createLesson, moveLesson } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminAgeGroup({
  params,
  searchParams,
}: PageProps<"/admin/age-groups/[ageGroupId]">) {
  const { ageGroupId } = await params;
  const { saved, error } = await searchParams;

  const group = await db.ageGroup.findUnique({
    where: { id: ageGroupId },
    include: {
      lessons: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        include: { _count: { select: { categories: true } } },
      },
    },
    relationLoadStrategy: "join",
  });
  if (!group) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <PageHeader
        crumbs={[{ label: "Age groups", href: "/admin" }]}
        actions={
          <>
            <LinkButton href={previewHref(`/${group.slug}`, `/admin/age-groups/${group.id}`)} size="sm">
              Preview
            </LinkButton>
            <LinkButton href={`/admin/age-groups/${group.id}/manage`} size="sm">
              Manage
            </LinkButton>
          </>
        }
      />
      <h1 className="text-3xl font-black">{group.label}</h1>
      {saved && <Banner kind="success">Saved.</Banner>}
      {typeof error === "string" && <Banner kind="error">{error}</Banner>}

      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">Lessons</h2>
        {group.lessons.length === 0 ? (
          <p className="text-stone-500">No lessons in this age group yet. Add one below.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {group.lessons.map((l, i) => (
              <li key={l.id} className="flex items-center gap-3">
                <Link
                  href={`/admin/lessons/${l.id}`}
                  className="flex flex-1 items-center justify-between gap-3 py-3 hover:bg-stone-50"
                >
                  <span className="text-lg font-semibold">{l.title}</span>
                  <span className="flex items-center gap-3 text-sm text-stone-500">
                    {l._count.categories} {l._count.categories === 1 ? "category" : "categories"}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${l.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}
                    >
                      {l.published ? "Published" : "Draft"}
                    </span>
                  </span>
                </Link>
                <MoveButtons
                  id={l.id}
                  action={moveLesson}
                  isFirst={i === 0}
                  isLast={i === group.lessons.length - 1}
                />
              </li>
            ))}
          </ul>
        )}
        <form action={createLesson} className="mt-5 flex flex-col items-start gap-4 border-t border-stone-100 pt-5">
          <input type="hidden" name="ageGroupId" value={group.id} />
          <div className="flex flex-wrap items-end gap-3">
            <Field label="New lesson">
              <input name="title" placeholder="Lesson 2" required className={field} />
            </Field>
            <Field label="Language">
              <input name="language" placeholder="e.g. Afrikaans" className={`${field} w-40`} />
            </Field>
          </div>
          <button className={button("dark")}>Add lesson</button>
        </form>
      </section>
    </main>
  );
}
