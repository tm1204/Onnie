import Link from "next/link";
import { LinkButton } from "@/components/admin/ui";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-xl font-black text-amber-500">
            Onnie <span className="font-semibold text-stone-500">admin</span>
          </Link>
          <LinkButton href="/" size="sm">
            View app →
          </LinkButton>
        </div>
      </header>
      {children}
    </div>
  );
}
