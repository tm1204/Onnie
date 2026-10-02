"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAuthorised } from "@/lib/adminAuth";
import { uploadAudio } from "@/lib/storage";

// The proxy already gates /admin, but server actions are public POST endpoints,
// so each one re-checks.
async function requireAdmin() {
  if (!isAuthorised((await headers()).get("authorization"))) {
    throw new Error("Unauthorised");
  }
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => Number.parseInt(str(f, k), 10) || 0;
const VISUALS = ["TEXT", "COLOUR", "IMAGE"] as const;
type Visual = (typeof VISUALS)[number];

// Slugs become the student-facing URL (/5-7), so they must be URL-safe, unique,
// and must not shadow a real route.
const RESERVED_SLUGS = new Set(["admin", "lessons", "api", "manifest.webmanifest"]);
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function slugProblem(slug: string): string | null {
  if (!slug) return "Address (slug) cannot be empty.";
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" is reserved. Choose a different address.`;
  return null;
}

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === "P2002";

export async function createAgeGroup(formData: FormData) {
  await requireAdmin();
  const label = str(formData, "label");
  const slug = slugify(str(formData, "slug") || label);
  const problem = !label ? "Name cannot be empty." : slugProblem(slug);
  if (problem) redirect(`/admin?error=${encodeURIComponent(problem)}`);

  let error: string | null = null;
  try {
    const last = await db.ageGroup.aggregate({ _max: { sortOrder: true } });
    await db.ageGroup.create({
      data: { label, slug, sortOrder: (last._max.sortOrder ?? -1) + 1 },
    });
  } catch (e) {
    error = isUniqueViolation(e) ? `An age group with the address "${slug}" already exists.` : "Could not create age group.";
  }
  redirect(error ? `/admin?error=${encodeURIComponent(error)}` : "/admin");
}

export async function saveAgeGroup(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const label = str(formData, "label");
  const slug = slugify(str(formData, "slug"));
  const problem = !label ? "Name cannot be empty." : slugProblem(slug);
  if (problem) redirect(`/admin/age-groups/${id}/manage?error=${encodeURIComponent(problem)}`);

  let error: string | null = null;
  try {
    await db.ageGroup.update({ where: { id }, data: { label, slug } });
  } catch (e) {
    error = isUniqueViolation(e) ? `An age group with the address "${slug}" already exists.` : "Could not save.";
  }
  redirect(
    error
      ? `/admin/age-groups/${id}/manage?error=${encodeURIComponent(error)}`
      : `/admin/age-groups/${id}/manage?saved=1`,
  );
}

export async function deleteAgeGroup(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const lessons = await db.lesson.count({ where: { ageGroupId: id } });
  if (lessons > 0) {
    redirect(
      `/admin/age-groups/${id}/manage?error=${encodeURIComponent("Delete this age group's lessons first.")}`,
    );
  }
  await db.ageGroup.delete({ where: { id } });
  redirect("/admin");
}

export async function moveAgeGroup(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const dir = str(formData, "dir") === "up" ? -1 : 1;
  const siblings = await db.ageGroup.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const order = swapped(siblings.map((s) => s.id), id, dir);
  if (order) {
    await db.$transaction(
      order.map((sid, n) => db.ageGroup.update({ where: { id: sid }, data: { sortOrder: n } })),
    );
  }
  redirect("/admin");
}

export async function createLesson(formData: FormData) {
  await requireAdmin();
  const ageGroupId = str(formData, "ageGroupId");
  // Append after the existing lessons instead of jumping to the front.
  const last = await db.lesson.aggregate({ where: { ageGroupId }, _max: { sortOrder: true } });
  const lesson = await db.lesson.create({
    data: {
      ageGroupId,
      title: str(formData, "title"),
      language: str(formData, "language"),
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  });
  redirect(`/admin/lessons/${lesson.id}`);
}

export async function saveLesson(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await db.lesson.update({
    where: { id },
    data: {
      title: str(formData, "title"),
      language: str(formData, "language"),
      published: formData.get("published") === "on",
    },
  });
  redirect(`/admin/lessons/${id}?saved=1`);
}

// Renumber siblings 0..n-1 with one swapped, so ties and gaps never matter.
function swapped(ids: string[], id: string, dir: number): string[] | null {
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return null;
  const next = [...ids];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export async function moveLesson(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const dir = str(formData, "dir") === "up" ? -1 : 1;
  const lesson = await db.lesson.findUniqueOrThrow({ where: { id } });
  const siblings = await db.lesson.findMany({
    where: { ageGroupId: lesson.ageGroupId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const order = swapped(siblings.map((s) => s.id), id, dir);
  if (order) {
    await db.$transaction(
      order.map((sid, n) => db.lesson.update({ where: { id: sid }, data: { sortOrder: n } })),
    );
  }
  redirect(`/admin/age-groups/${lesson.ageGroupId}`);
}

export async function moveCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const dir = str(formData, "dir") === "up" ? -1 : 1;
  const category = await db.category.findUniqueOrThrow({ where: { id } });
  const siblings = await db.category.findMany({
    where: { lessonId: category.lessonId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const order = swapped(siblings.map((s) => s.id), id, dir);
  if (order) {
    await db.$transaction(
      order.map((sid, n) => db.category.update({ where: { id: sid }, data: { sortOrder: n } })),
    );
  }
  redirect(`/admin/lessons/${category.lessonId}`);
}

export async function deleteLesson(formData: FormData) {
  await requireAdmin();
  const lesson = await db.lesson.delete({ where: { id: str(formData, "id") } });
  redirect(`/admin/age-groups/${lesson.ageGroupId}`);
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const lessonId = str(formData, "lessonId");
  const count = await db.category.count({ where: { lessonId } });
  const category = await db.category.create({
    data: { lessonId, name: str(formData, "name"), sortOrder: count },
  });
  redirect(`/admin/categories/${category.id}`);
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const category = await db.category.delete({ where: { id: str(formData, "id") } });
  redirect(`/admin/lessons/${category.lessonId}`);
}

// One save for a whole category screen: the category name (top level only) and
// every tile row on it, including new rows, edits, reordering, deletions and audio.
export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const categoryId = str(formData, "categoryId");
  const parentId = str(formData, "parentId") || null;
  const count = int(formData, "count");
  const back = `/admin/categories/${categoryId}${parentId ? `?tile=${parentId}&` : "?"}`;

  let error: string | null = null;
  try {
    const name = str(formData, "name");
    if (name) await db.category.update({ where: { id: categoryId }, data: { name } });

    for (let i = 0; i < count; i++) {
      const id = str(formData, `id_${i}`);
      if (formData.get(`delete_${i}`) === "1") {
        if (id) await db.tile.deleteMany({ where: { id, categoryId } });
        continue;
      }
      const displayValue = str(formData, `displayValue_${i}`);
      if (!displayValue) continue; // blank new row
      const vt = str(formData, `visualType_${i}`) as Visual;
      const audio = formData.get(`audio_${i}`);
      const audioUrl = audio instanceof File && audio.size > 0 ? await uploadAudio(audio) : undefined;
      const data = {
        displayValue,
        visualType: VISUALS.includes(vt) ? vt : ("TEXT" as const),
        visualValue: str(formData, `visualValue_${i}`) || null,
        // Only text tiles carry their own colour (colour tiles keep theirs in visualValue).
        colour: vt === "TEXT" ? str(formData, `colour_${i}`) || null : null,
        sortOrder: i,
        ...(audioUrl ? { audioUrl } : {}),
      };
      if (id) {
        await db.tile.updateMany({ where: { id, categoryId }, data });
      } else {
        await db.tile.create({ data: { ...data, categoryId, parentId } });
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Save failed";
  }

  redirect(error ? `${back}error=${encodeURIComponent(error)}` : `${back}saved=1`);
}
