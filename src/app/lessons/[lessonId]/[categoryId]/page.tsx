import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { readableTextOn } from "@/lib/colour";
import { SPLASH_FILLS, splash } from "@/lib/splash";
import { tileFontSize } from "@/lib/tileText";
import { categoryIcon, gradient } from "@/lib/ui";
import NavBar from "@/components/NavBar";
import TileButton, { type TileView } from "@/components/TileButton";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/lessons/[lessonId]/[categoryId]">) {
  const { lessonId, categoryId } = await params;
  const { tile } = await searchParams;
  const parentId = typeof tile === "string" ? tile : null;

  // Independent lookups run together: one database round trip instead of several.
  const [category, siblings, parent, tiles] = await Promise.all([
    db.category.findFirst({
      where: { id: categoryId, lessonId, lesson: { published: true } },
    }),
    db.category.findMany({
      where: { lessonId, lesson: { published: true } },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, name: true },
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

  const base = `/lessons/${lessonId}/${categoryId}`;
  const backHref = parent
    ? parent.parentId
      ? `${base}?tile=${parent.parentId}`
      : base
    : `/lessons/${lessonId}`;

  const views: TileView[] = tiles.map((t, i) => {
    const isColour = t.visualType === "COLOUR" && !!t.visualValue;
    const isImage = t.visualType === "IMAGE" && !!t.visualValue;
    const fill = isColour
      ? t.visualValue!
      : isImage
        ? "#ffffff"
        : (t.visualType === "TEXT" && t.colour) || SPLASH_FILLS[i % SPLASH_FILLS.length];
    return {
      id: t.id,
      displayValue: t.displayValue,
      caption: t.visualType === "TEXT" ? t.visualValue : null,
      imageUrl: isImage ? t.visualValue : null,
      audioUrl: t.audioUrl,
      hasChildren: t._count.children > 0,
      fill,
      ink: readableTextOn(fill),
      shape: splash(t.id),
    };
  });

  const fontSize = tileFontSize(views.map((v) => v.displayValue));

  // Previous/next category, only at the top level of a category (not while drilled into sub-tiles).
  const at = siblings.findIndex((s) => s.id === categoryId);
  const prev = !parent && at > 0 ? { ...siblings[at - 1], index: at - 1 } : null;
  const next = !parent && at >= 0 && at < siblings.length - 1 ? { ...siblings[at + 1], index: at + 1 } : null;

  return (
    <>
      <NavBar backHref={backHref} title={parent ? parent.displayValue : category.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 p-6 pb-10">
        {views.length === 0 ? (
          <p className="mt-16 text-center text-xl text-stone-500">Nog niks hier nie.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
            {views.map((v) => (
              <li key={v.id}>
                <TileButton basePath={base} tile={v} fontSize={fontSize} />
              </li>
            ))}
          </ul>
        )}
      </main>
      {(prev || next) && (
        <nav className="sticky bottom-0 z-10 bg-amber-50/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 p-3">
            {prev ? (
              <PagerLink href={`/lessons/${lessonId}/${prev.id}`} label="Vorige" name={prev.name} index={prev.index} dir="prev" />
            ) : (
              <span />
            )}
            {next ? (
              <PagerLink href={`/lessons/${lessonId}/${next.id}`} label="Volgende" name={next.name} index={next.index} dir="next" />
            ) : (
              <span />
            )}
          </div>
        </nav>
      )}
    </>
  );
}

// Same colour as the category's card on the lesson page, so the theme carries across.
// Compact pill: arrow on the outside, small label over the category name.
function PagerLink({
  href,
  label,
  name,
  index,
  dir,
}: {
  href: string;
  label: string;
  name: string;
  index: number;
  dir: "prev" | "next";
}) {
  const isNext = dir === "next";
  return (
    <Link
      href={href}
      className={`flex min-w-0 max-w-[48%] items-center gap-3 rounded-full bg-gradient-to-br ${gradient(index)} px-5 py-2.5 text-white shadow-lg transition active:scale-95 ${isNext ? "flex-row-reverse text-right" : "text-left"}`}
    >
      <span className="shrink-0 text-2xl font-black leading-none" aria-hidden>
        {isNext ? "→" : "←"}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase leading-tight tracking-wide opacity-90">{label}</span>
        <span className={`flex items-center gap-1.5 text-lg font-black leading-tight ${isNext ? "justify-end" : ""}`}>
          <span aria-hidden>{categoryIcon(name)}</span>
          <span className="truncate">{name}</span>
        </span>
      </span>
    </Link>
  );
}
