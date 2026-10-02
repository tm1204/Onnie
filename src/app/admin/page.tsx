import Link from "next/link";
import { db } from "@/lib/db";
import MoveButtons from "@/components/admin/MoveButtons";
import { Banner, Field, LinkButton, button, card, field } from "@/components/admin/ui";
import { createAgeGroup, moveAgeGroup } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const { error } = await searchParams;
  const groups = await db.ageGroup.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { lessons: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    relationLoadStrategy: "join",
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-black">Age groups</h1>
      {typeof error === "string" && <Banner kind="error">{error}</Banner>}

      {groups.length === 0 && <p className="text-stone-500">No age groups yet. Create one below.</p>}
      {groups.map((g, gi) => (
        <section key={g.id} className={card}>
          <div className="flex items-center justify-between gap-3">
            <Link href={`/admin/age-groups/${g.id}`} className="group min-w-0 flex-1">
              <h2 className="text-xl font-bold group-hover:text-amber-600">{g.label}</h2>
              <p className="text-sm text-stone-500">
                {g.lessons.length} {g.lessons.length === 1 ? "lesson" : "lessons"}
              </p>
            </Link>
            <div className="flex items-center gap-2">
              <LinkButton href={`/admin/age-groups/${g.id}/manage`} size="sm">
                Manage
              </LinkButton>
              <MoveButtons
                id={g.id}
                action={moveAgeGroup}
                isFirst={gi === 0}
                isLast={gi === groups.length - 1}
              />
            </div>
          </div>
          {g.lessons.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
              {g.lessons.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/lessons/${l.id}`}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 hover:ring-amber-400 ${l.published ? "bg-green-50 text-green-800 ring-green-200" : "bg-stone-50 text-stone-600 ring-stone-200"}`}
                  >
                    {l.title}
                    {!l.published && <span className="text-xs font-bold text-stone-400">Draft</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">New age group</h2>
        <form action={createAgeGroup} className="flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-start gap-3">
            <Field label="Name">
              <input name="label" placeholder="14-16 Jaar" required className={field} />
            </Field>
            <Field label="Address" hint="Optional. Used in the web address, e.g. /14-16. Made from the name if left blank.">
              <input name="slug" placeholder="14-16" className={`${field} w-40`} />
            </Field>
          </div>
          <button className={button("primary")}>Create age group</button>
        </form>
      </section>
    </main>
  );
}
