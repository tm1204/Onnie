import Link from "next/link";
import type { ReactNode } from "react";

// Shared admin theme: every admin screen builds from these, so buttons, fields,
// cards and headers stay uniform. Tailwind needs full class names as literals.

export const field =
  "h-11 rounded-xl border border-stone-300 bg-white px-3 text-base shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200";

export const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200";

type Variant = "primary" | "secondary" | "danger" | "dark" | "delete";
type Size = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold shadow-sm transition active:scale-95 disabled:opacity-50";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-amber-500 text-white hover:bg-amber-600",
  secondary: "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50",
  danger: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
  dark: "bg-stone-800 text-white hover:bg-stone-900",
  delete: "bg-red-600 text-white hover:bg-red-700",
};
const SIZES: Record<Size, string> = {
  md: "px-5 py-2.5 text-base",
  sm: "px-3 py-1.5 text-sm",
};

export function button(variant: Variant = "primary", size: Size = "md"): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`;
}

// Square icon buttons (reorder arrows, delete bin, ...).
export const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-700 shadow-sm ring-1 ring-stone-300 transition hover:bg-stone-50 active:scale-95 disabled:opacity-30 disabled:hover:bg-white";

export function LinkButton({
  href,
  children,
  variant = "secondary",
  size = "md",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}) {
  return (
    <Link href={href} className={button(variant, size)}>
      {children}
    </Link>
  );
}

export function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-stone-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

export function Banner({ kind, children }: { kind: "success" | "error"; children: ReactNode }) {
  const tone = kind === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  return <p className={`rounded-xl px-4 py-2.5 font-semibold ${tone}`}>{children}</p>;
}

export type Crumb = { label: string; href?: string };

// Breadcrumb trail on the left, page actions on the right.
export function PageHeader({ crumbs, actions }: { crumbs: Crumb[]; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-500">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>›</span>}
            {c.href ? (
              <Link href={c.href} className="rounded-lg px-2 py-1 hover:bg-stone-200/60 hover:text-stone-900">
                {c.label}
              </Link>
            ) : (
              <span className="px-2 py-1 text-stone-900">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
