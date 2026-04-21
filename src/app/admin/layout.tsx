import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Admin
            </span>
            <span className="text-sm font-bold text-zinc-900">NoPersonAI</span>
          </div>
          <Link href="/app" className="text-sm text-zinc-600 hover:text-zinc-900">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
