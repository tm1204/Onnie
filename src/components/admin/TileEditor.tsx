"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toHex } from "@/lib/colour";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon, UndoIcon } from "./icons";
import FormButtons from "./FormButtons";
import { button, field, iconBtn } from "./ui";

export type EditorRow = {
  id: string;
  displayValue: string;
  visualType: "TEXT" | "COLOUR" | "IMAGE";
  visualValue: string; // caption (text), colour (colour tile) or picture link (picture tile)
  colour: string; // optional splash colour for text tiles
  audioUrl: string | null;
  childCount: number;
  href: string | null; // link to this tile's sub-tiles (saved rows only)
};

type Row = EditorRow & { key: string; deleted: boolean };

let counter = 0;
const blank = (): Row => ({
  key: `new-${counter++}`,
  id: "",
  displayValue: "",
  visualType: "TEXT",
  visualValue: "",
  colour: "",
  audioUrl: null,
  childCount: 0,
  href: null,
  deleted: false,
});

const DEFAULT_COLOUR = "#ff8a3d";

const fileInput =
  "text-sm text-stone-500 file:mr-3 file:cursor-pointer file:rounded-xl file:border file:border-solid file:border-stone-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-stone-700 file:shadow-sm file:transition hover:file:bg-stone-50";
const picker = "h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-stone-300 bg-white p-1";

function Labelled({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      {children}
    </label>
  );
}

// Non-label version of the small heading, for groups that hold buttons instead of one input.
function Heading({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">{children}</span>;
}

const snapshot = (rows: Row[]) =>
  JSON.stringify(rows.map((r) => [r.id, r.displayValue, r.visualType, r.visualValue, r.colour, r.deleted]));

export default function TileEditor({
  initial,
  action,
  deleteAction,
  deleteMessage,
  categoryId,
  parentId,
  categoryName,
  backHref,
  backLabel,
}: {
  initial: EditorRow[];
  action: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>; // top level only
  deleteMessage?: string;
  categoryId: string;
  parentId: string | null;
  categoryName: string | null; // shown (editable) at the top level only
  backHref: string;
  backLabel: string;
}) {
  const fresh = () => initial.map((r) => ({ ...r, key: r.id, deleted: false }));
  const [rows, setRows] = useState<Row[]>(fresh);
  const [name, setName] = useState(categoryName ?? "");
  const [pickedFiles, setPickedFiles] = useState(0);
  const [epoch, setEpoch] = useState(0); // bumping this remounts the rows, clearing chosen files

  const baseline = snapshot(fresh());
  const dirty = snapshot(rows) !== baseline || pickedFiles > 0 || (categoryName !== null && name !== categoryName);

  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) =>
    setRows((rs) => {
      const j = i + d;
      if (j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const remove = (r: Row) =>
    r.id ? update(r.key, { deleted: !r.deleted }) : setRows((rs) => rs.filter((x) => x.key !== r.key));

  // A caption is not a colour and vice versa, so changing the style starts that field fresh.
  function changeType(r: Row, type: Row["visualType"]) {
    const visualValue = type === "COLOUR" ? (toHex(r.visualValue) ?? "#ff0000") : type === r.visualType ? r.visualValue : "";
    update(r.key, { visualType: type, visualValue, colour: type === "TEXT" ? r.colour : "" });
  }

  function cancel() {
    setRows(fresh());
    setName(categoryName ?? "");
    setPickedFiles(0);
    setEpoch((e) => e + 1);
  }

  const leave = (e: React.MouseEvent) => {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) e.preventDefault();
  };

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="id" value={categoryId} />
      <input type="hidden" name="parentId" value={parentId ?? ""} />
      <input type="hidden" name="count" value={rows.length} />

      {categoryName !== null && (
        <Labelled label="Category name" className="max-w-sm">
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`${field} w-full`}
          />
        </Labelled>
      )}

      <div key={epoch} className="space-y-3">
        {rows.length === 0 && <p className="text-stone-500">No tiles yet. Add the first one below.</p>}
        {rows.map((r, i) => (
          <div
            key={r.key}
            className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 ${r.deleted ? "opacity-40" : ""}`}
          >
            <input type="hidden" name={`id_${i}`} value={r.id} />
            <input type="hidden" name={`delete_${i}`} value={r.deleted ? "1" : "0"} />
            <input type="hidden" name={`visualValue_${i}`} value={r.visualValue} />
            <input type="hidden" name={`colour_${i}`} value={r.colour} />

            <div className="flex flex-wrap items-end gap-3">
              <span className="w-6 pb-3 text-center text-sm font-bold text-stone-400">{i + 1}</span>
              <Labelled label="Shown on tile" className="w-36">
                <input
                  name={`displayValue_${i}`}
                  value={r.displayValue}
                  onChange={(e) => update(r.key, { displayValue: e.target.value })}
                  placeholder="1, A, rooi…"
                  className={`${field} w-full`}
                />
              </Labelled>
              <Labelled label="Tile style">
                <select
                  name={`visualType_${i}`}
                  value={r.visualType}
                  onChange={(e) => changeType(r, e.target.value as Row["visualType"])}
                  className={field}
                >
                  <option value="TEXT">Text tile</option>
                  <option value="COLOUR">Colour tile</option>
                  <option value="IMAGE">Picture tile</option>
                </select>
              </Labelled>

              {r.visualType === "COLOUR" && (
                <div>
                  <Heading>Colour</Heading>
                  <input
                    type="color"
                    value={toHex(r.visualValue) ?? "#ff0000"}
                    onChange={(e) => update(r.key, { visualValue: e.target.value })}
                    className={picker}
                    aria-label="Pick the tile colour"
                  />
                </div>
              )}

              {r.visualType === "IMAGE" && (
                <Labelled label="Picture link (URL)" className="min-w-44 flex-1">
                  <input
                    value={r.visualValue}
                    onChange={(e) => update(r.key, { visualValue: e.target.value })}
                    placeholder="https://…"
                    className={`${field} w-full`}
                  />
                </Labelled>
              )}

              {r.visualType === "TEXT" && (
                <>
                  <Labelled label="Caption (optional)" className="min-w-40 flex-1">
                    <input
                      value={r.visualValue}
                      onChange={(e) => update(r.key, { visualValue: e.target.value })}
                      placeholder="een"
                      className={`${field} w-full`}
                    />
                  </Labelled>
                  <div>
                    <Heading>Tile colour (optional)</Heading>
                    {r.colour ? (
                      <span className="flex items-center gap-2">
                        <input
                          type="color"
                          value={toHex(r.colour) ?? DEFAULT_COLOUR}
                          onChange={(e) => update(r.key, { colour: e.target.value })}
                          className={picker}
                          aria-label="Pick the tile colour"
                        />
                        <button type="button" className={button("secondary", "sm")} onClick={() => update(r.key, { colour: "" })}>
                          Automatic
                        </button>
                      </span>
                    ) : (
                      <button type="button" className={`${button("secondary")} h-11`} onClick={() => update(r.key, { colour: DEFAULT_COLOUR })}>
                        Choose colour
                      </button>
                    )}
                  </div>
                </>
              )}

              <div className="ml-auto flex gap-1 pb-1">
                <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up"><ArrowUpIcon /></button>
                <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" title="Move down"><ArrowDownIcon /></button>
                <button type="button" className={iconBtn} onClick={() => remove(r)} aria-label={r.deleted ? "Undo delete" : "Delete tile"} title={r.deleted ? "Undo delete" : "Delete tile"}>
                  {r.deleted ? <UndoIcon /> : <TrashIcon />}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2 pl-9">
              <Labelled label={r.audioUrl ? "Replace sound" : "Sound"}>
                <input
                  type="file"
                  name={`audio_${i}`}
                  accept="audio/*"
                  onChange={() => setPickedFiles((n) => n + 1)}
                  className={fileInput}
                />
              </Labelled>
              {r.audioUrl && <audio controls src={r.audioUrl} className="h-9" />}
            </div>

            <div className="mt-3 border-t border-stone-100 pt-3 pl-9">
              <Heading>Add sub-tiles for drill down</Heading>
              {r.href ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={r.href} onClick={leave} className={button("secondary", "sm")}>
                    Open sub-tiles ({r.childCount})
                  </Link>
                  <span className="text-sm text-stone-500">Tapping this tile will open its sub-tiles.</span>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Save this tile first, then you can add sub-tiles to it.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setRows((rs) => [...rs, blank()])} className={button("secondary")}>
          + Add tile
        </button>
      </div>

      <FormButtons
        backHref={backHref}
        backLabel={backLabel}
        dirty={dirty}
        onCancel={cancel}
        deleteAction={deleteAction}
        deleteLabel="Delete category"
        deleteMessage={deleteMessage}
      />
    </form>
  );
}
