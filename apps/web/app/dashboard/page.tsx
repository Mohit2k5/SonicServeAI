"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiUrl } from "../../lib/api";
import {
  ArrowRightIcon,
  CodeIcon,
  MicIcon,
  ShieldIcon,
  SignalIcon,
  TableIcon,
} from "../../components/Icons";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalTokens: 0,
    activeAgents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetch(apiUrl("/api/dashboard/stats"), {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch(console.error);
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="panel h-32 animate-pulse bg-white p-6">
            <div className="h-4 w-24 rounded bg-[var(--color-surface-muted)]" />
            <div className="mt-6 h-8 w-20 rounded bg-[var(--color-surface-muted)]" />
          </div>
        ))}
      </div>
    );
  }

  const totalTokens = Number(stats.totalTokens || 0);

  const statCards = [
    {
      label: "Total sessions",
      value: stats.totalSessions,
      change: "+12% this week",
      icon: SignalIcon,
    },
    {
      label: "Tokens used",
      value: totalTokens.toLocaleString(),
      change: "Speech and reasoning usage",
      icon: CodeIcon,
    },
    {
      label: "Active agents",
      value: stats.activeAgents,
      change: "Ready for sessions",
      icon: MicIcon,
    },
    {
      label: "This month cost",
      value: `$${(totalTokens * 0.00002).toFixed(2)}`,
      change: "Current plan: Developer",
      icon: TableIcon,
    },
  ];

  const pipelineHealth = [
    { label: "Voice streaming", value: "98.7%", tone: "good" },
    { label: "Agent responses", value: "1.9s avg", tone: "good" },
    { label: "Session handoff", value: "< 2s", tone: "good" },
    { label: "Security checks", value: "No alerts", tone: "stable" },
  ] as const;

  return (
    <div className="space-y-8">
      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 px-5 py-6 text-white sm:px-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-sky-200">
                Workspace overview
              </p>
              <h2 className="mt-2 text-3xl font-extrabold">
                Voice operations command center
              </h2>
              <p className="mt-2 text-sm font-bold text-slate-200">
                Watch performance, launch agents, and monitor usage from one
                place.
              </p>
            </div>
            <Link
              href="/dashboard/agents"
              className="btn btn-accent focus-ring"
            >
              Create agent
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.label} className="panel p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[var(--color-muted)]">
                      {card.label}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold">{card.value}</p>
                  <p className="mt-2 text-sm font-bold text-[var(--color-muted)]">
                    {card.change}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Activity feed</p>
            <h3 className="mt-2 text-2xl font-extrabold">
              Recent voice sessions
            </h3>
          </div>
          <Link
            href="/dashboard/logs"
            className="focus-ring rounded-md text-sm font-extrabold text-[var(--color-accent-strong)] hover:text-[var(--color-ink)]"
          >
            View all logs
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-5 sm:p-6">
          <div className="divide-y divide-[var(--color-border)]">
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-[var(--color-accent-strong)]">
                    <SignalIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-extrabold">
                      Voice session #{1002 - item}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Customer Support, Hindi
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-[var(--color-muted)]">
                  {item + 2} mins ago
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="panel p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">Pipeline health</h3>
            </div>
            <div className="space-y-3">
              {pipelineHealth.map((item) => (
                <div key={item.label} className="panel-muted p-3">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--color-muted)]">
                    {item.label}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-extrabold">{item.value}</p>
                    <span
                      className={`status-pill ${item.tone === "good" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}
                    >
                      {item.tone === "good" ? "Healthy" : "Stable"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Link
              href="/dashboard/agents"
              className="panel focus-ring block p-5 transition hover:border-[var(--color-primary)]"
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                <MicIcon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">Create a voice agent</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                Choose a language, set the behavior, and start a live test.
              </p>
            </Link>
            <Link
              href="/docs"
              className="panel focus-ring block p-5 transition hover:border-[var(--color-primary)]"
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <CodeIcon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">Open the API guide</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                Review agent creation, streaming, and SDK setup.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
