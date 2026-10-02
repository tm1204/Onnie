import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import FormButtons from "@/components/admin/FormButtons";
import { Banner, Field, PageHeader, card, field } from "@/components/admin/ui";
import { deleteAgeGroup, saveAgeGroup } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function ManageAgeGroup({
  params,
  searchParams,
}: PageProps<"/admin/age-groups/[ageGroupId]/manage">) {
  const { ageGroupId } = await params;
  const { saved, error } = await searchParams;

  const group = await db.ageGroup.findUnique({
    where: { id: ageGroupId },
    include: { _count: { select: { lessons: true } } },
    relationLoadStrategy: "join",
  });
  if (!group) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <PageHeader
        crumbs={[
          { label: "Age groups", href: "/admin" },
          { label: group.label, href: `/admin/age-groups/${group.id}` },
        ]}
      />
      <h1 className="text-3xl font-black">Manage {group.label}</h1>
      {saved && <Banner kind="success">Saved.</Banner>}
      {typeof error === "string" && <Banner kind="error">{error}</Banner>}

      <section className={card}>
        <h2 className="mb-3 text-xl font-bold">Age group settings</h2>
        <form action={saveAgeGroup} className="flex flex-col items-start gap-4">
          <input type="hidden" name="id" value={group.id} />
          <div className="flex flex-wrap items-start gap-3">
            <Field label="Name">
              <input name="label" defaultValue={group.label} required className={field} />
            </Field>
            <Field
              label="Address"
              hint="Used in the web address. Changing it breaks any saved links to this age group."
            >
              <input name="slug" defaultValue={group.slug} required className={`${field} w-40`} />
            </Field>
          </div>
          <div className="w-full">
            <FormButtons
              backHref={`/admin/age-groups/${group.id}`}
              backLabel={group.label}
              deleteAction={deleteAgeGroup}
              deleteLabel="Delete age group"
              deleteMessage={`Delete the age group "${group.label}"?`}
              deleteDisabledReason={
                group._count.lessons > 0
                  ? `Has ${group._count.lessons} ${group._count.lessons === 1 ? "lesson" : "lessons"}. Delete them first.`
                  : undefined
              }
            />
          </div>
        </form>
      </section>
    </main>
  );
}
