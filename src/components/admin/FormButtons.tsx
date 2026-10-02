"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { button } from "./ui";

// The one button row every admin edit screen uses: Save, Cancel and Back on the left,
// Delete (red) on the right. Render it inside the <form> being edited.
//  - Cancel resets the form (or calls onCancel for forms that keep their own state).
//  - Delete is a second server action on the same form, so it shares the row.
export default function FormButtons({
  backHref,
  backLabel,
  dirty,
  onCancel,
  deleteAction,
  deleteLabel,
  deleteMessage,
  deleteDisabledReason,
}: {
  backHref: string;
  backLabel: string;
  dirty?: boolean; // omit for plain forms: Cancel is always available and Back never asks
  onCancel?: () => void;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteLabel?: string;
  deleteMessage?: string;
  deleteDisabledReason?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-5">
      <button disabled={pending} className={button("primary")}>
        {pending ? "Working…" : "Save"}
      </button>
      <button
        type={onCancel ? "button" : "reset"}
        onClick={onCancel}
        disabled={pending || dirty === false}
        className={button("secondary")}
      >
        Cancel
      </button>
      <Link
        href={backHref}
        onClick={(e) => {
          if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) e.preventDefault();
        }}
        className={button("secondary")}
      >
        ← Back to {backLabel}
      </Link>
      {dirty && <span className="text-sm font-semibold text-amber-700">Unsaved changes</span>}

      {deleteAction && (
        <div className="ml-auto flex items-center gap-3">
          {deleteDisabledReason && <span className="text-sm text-stone-500">{deleteDisabledReason}</span>}
          <button
            type="submit"
            formAction={deleteAction}
            formNoValidate
            disabled={pending || !!deleteDisabledReason}
            onClick={(e) => {
              if (!window.confirm(deleteMessage ?? "Delete this? This cannot be undone.")) e.preventDefault();
            }}
            className={button("delete")}
          >
            {deleteLabel ?? "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
