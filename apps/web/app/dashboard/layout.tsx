"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  BookIcon,
  KeyIcon,
  LogoMark,
  MicIcon,
  SignalIcon,
  TableIcon,
} from "../../components/Icons";

const sidebarLinks = [
  { label: "Overview", href: "/dashboard", icon: SignalIcon },
  { label: "Agents", href: "/dashboard/agents", icon: MicIcon },
  { label: "Usage logs", href: "/dashboard/logs", icon: TableIcon },
  { label: "API keys", href: "/dashboard/api-keys", icon: KeyIcon },
  { label: "Docs", href: "/docs", icon: BookIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-page)] px-4 text-[var(--color-ink)]">
        <div className="panel w-full max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
            <SignalIcon className="h-5 w-5" />
          </div>
          <p className="font-extrabold">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const currentLabel =
    sidebarLinks.find((link) => link.href === pathname)?.label || "Dashboard";
  const breadcrumb = pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((segment) => segment.replaceAll("-", " "));

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-ink)] lg:flex">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside className="hidden w-72 border-r border-[var(--color-border)] bg-white lg:flex lg:flex-col">
        <div className="p-5">
          <Link
            href="/"
            className="focus-ring flex min-h-11 items-center gap-3 rounded-lg font-extrabold"
          >
            <LogoMark className="h-8 w-8 text-[var(--color-primary)]" />
            Sonic Serve AI
          </Link>
          <p className="mt-3 text-sm font-bold text-[var(--color-muted)]">
            Workspace
          </p>
        </div>
        <nav className="flex-1 px-3" aria-label="Dashboard navigation">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring mb-1 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-extrabold transition ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--color-border)] p-4">
          <div className="panel-muted p-4">
            <p className="text-sm font-extrabold text-[var(--color-muted)]">
              Current plan
            </p>
            <p className="mt-1 text-base font-extrabold capitalize">
              {session?.user?.plan || "Free"}
            </p>
            <p className="mt-2 text-xs font-bold text-[var(--color-muted)]">
              Upgrade for enterprise governance and dedicated capacity.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[var(--color-border)] bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <Link
                href="/"
                className="focus-ring flex items-center gap-2 rounded-lg text-sm font-extrabold text-[var(--color-muted)] lg:hidden"
              >
                <LogoMark className="h-7 w-7 text-[var(--color-primary)]" />
                Sonic Serve AI
              </Link>
              <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-[var(--color-accent-strong)] lg:mt-0">
                Operations
              </p>
              <h1 className="truncate text-xl font-extrabold">{currentLabel}</h1>
              <p className="mt-1 truncate text-sm font-bold text-[var(--color-muted)]">
                Home
                {breadcrumb.map((segment) => ` / ${segment}`)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs font-extrabold text-[var(--color-muted)] sm:block">
                Live status: healthy
              </div>
              <button
                type="button"
                className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
              >
                <span className="sr-only">Notifications</span>
                <SignalIcon className="h-5 w-5" />
              </button>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-extrabold text-white"
                aria-label="User profile"
              >
                {session.user?.name?.[0] || "U"}
              </div>
            </div>
          </div>

          <nav
            className="scrollbar-clean flex gap-2 overflow-x-auto border-t border-[var(--color-border)] px-4 py-2 sm:px-6 lg:hidden"
            aria-label="Dashboard navigation"
          >
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-extrabold ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-white text-[var(--color-muted)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main
          id="main-content"
          className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
