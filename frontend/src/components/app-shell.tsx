import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { Bot, GitBranch, History, LayoutDashboard } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/runs", label: "Runs", icon: History },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--ctp-base)] text-[var(--ctp-text)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] px-4 py-5 md:block">
        <div className="mb-8">
          <p className="text-sm font-medium text-[var(--ctp-mauve)]">
            Llama Herd
          </p>
          <h1 className="mt-1 text-lg font-semibold">Studio</h1>
        </div>

        <nav className="grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--ctp-subtext1)] transition hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-text)]"
                href={item.href}
                key={item.href}
              >
                <Icon size={18} className="text-[var(--ctp-mauve)]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="flex h-14 items-center border-b border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] px-5 md:hidden">
          <div>
            <p className="text-sm font-medium text-[var(--ctp-mauve)]">
              Llama Herd
            </p>
          </div>
        </header>

        <main className="min-h-screen px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
