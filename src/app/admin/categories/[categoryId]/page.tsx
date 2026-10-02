import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { previewHref } from "@/lib/preview";
import TileEditor from "@/components/admin/TileEditor";
import { ArrowUpIcon } from "@/components/admin/icons";
import { Banner, LinkButton, PageHeader } from "@/components/admin/ui";
import { deleteCategory, saveCategory } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminCategory({
  params,
  searchParams,
}: PageProps<"/admin/categories/[categoryId]">) {
  const { categoryId } = await params;
  const { tile, saved, error } = await searchParams;
  const parentId = typeof tile === "string" ? tile : null;

  const [category, parent, tiles] = await Promise.all([
    db.category.findUnique({
      where: { id: categoryId },
      include: { lesson: { include: { ageGroup: true } } },
      relationLoadStrategy: "join",
    }),
    parentId ? db.tile.findFirst({ where: { id: parentId, categoryId } }) : Promise.resolve(null),
    db.tile.findMany({
      where: { categoryId, parentId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: { _count: { select: { children: true } } },
      relationLoadStrategy: "join",
    }),
  ]);
  if (!category) notFound();
  if (parentId && !parent) notFound();

  const base = `/admin/categories/${categoryId}`;
  const upHref = parent ? (parent.parentId ? `${base}?tile=${parent.parentId}` : base) : null;
  const lesson = category.lesson;

  const initial = tiles.map((t) => ({
    id: t.id,
    displayValue: t.displayValue,
    visualType: t.visualType,
    visualValue: t.visualValue ?? "",
    colour: t.colour ?? "",
    audioUrl: t.audioUrl,
    childCount: t._count.children,
    href: `${base}?tile=${t.id}`,
  }));
  // Remount the editor whenever saved data changes, so new rows pick up their ids.
  const editorKey = `${parentId}:${tiles.map((t) => `${t.id}${t.audioUrl ?? ""}`).join(",")}`;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <PageHeader
        crumbs={[
          { label: "Age groups", href: "/admin" },
          { label: lesson.ageGroup.label, href: `/admin/age-groups/${lesson.ageGroupId}` },
          { label: lesson.title, href: `/admin/lessons/${lesson.id}` },
          ...(parent ? [{ label: category.name, href: base }] : []),
        ]}
        actions={
          <>
            {upHref && (
              <LinkButton href={upHref} size="sm">
                <ArrowUpIcon /> Up a level
              </LinkButton>
            )}
            <LinkButton
              href={previewHref(
                `/lessons/${lesson.id}/${categoryId}${parentId ? `?tile=${parentId}` : ""}`,
                `${base}${parentId ? `?tile=${parentId}` : ""}`,
              )}
              size="sm"
            >
              Preview
            </LinkButton>
          </>
        }
      />
      <h1 className="text-3xl font-black">
        {parent ? `Sub-tiles of “${parent.displayValue}”` : category.name}
      </h1>
      {saved && <Banner kind="success">Saved.</Banner>}
      {typeof error === "string" && <Banner kind="error">Could not save: {error}</Banner>}

      <TileEditor
        key={editorKey}
        initial={initial}
        action={saveCategory}
        deleteAction={parent ? undefined : deleteCategory}
        deleteMessage={`Delete "${category.name}" and all its tiles? This cannot be undone.`}
        categoryId={categoryId}
        parentId={parentId}
        categoryName={parent ? null : category.name}
        backHref={upHref ?? `/admin/lessons/${lesson.id}`}
        backLabel={parent ? "previous level" : lesson.title}
      />
    </main>
  );
}
