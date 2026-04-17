"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, LogoMark, MenuIcon, SignalIcon } from "./Icons";

const navLinks = [
  { label: "Platform", href: "/#how-it-works" },
  { label: "Agents", href: "/#custom-agents" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="focus-ring flex min-h-11 items-center gap-3 rounded-lg font-extrabold text-[var(--color-ink)]"
            >
              <LogoMark className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="truncate">Sonic Serve AI</span>
            </Link>
            <span className="status-pill hidden bg-sky-50 text-[var(--color-accent-strong)] lg:inline-flex">
              <SignalIcon className="h-4 w-4" />
              Realtime voice ops
            </span>
          </div>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => {
              const isActive = link.href === "/docs" && pathname === "/docs";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`focus-ring rounded-lg px-3 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-[var(--color-surface-muted)] text-[var(--color-ink)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <Link href="/dashboard" className="btn btn-primary focus-ring">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn btn-secondary focus-ring hidden sm:inline-flex"
                >
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-accent focus-ring">
                  Start free
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-ink)] lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-white lg:hidden">
          <nav
            className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:px-6"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-extrabold text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <Link
                href="/login"
                className="focus-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-extrabold text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
