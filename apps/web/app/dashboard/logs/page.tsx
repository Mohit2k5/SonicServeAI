"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { SignalIcon, TableIcon } from "../../../components/Icons";
import { apiUrl } from "../../../lib/api";

interface LogEntry {
  id: string;
  started_at: string;
  agent_name?: string;
  duration_seconds?: number;
  status: string;
}

export default function LogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetch(apiUrl("/api/agents/all/logs"), {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setLogs(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="panel h-80 animate-pulse bg-white p-6">
        <div className="h-6 w-40 rounded bg-[var(--color-surface-muted)]" />
        <div className="mt-8 grid gap-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 rounded bg-[var(--color-surface-muted)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-extrabold text-[var(--color-accent-strong)]">
          Session history
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">Usage logs</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Track each voice interaction, duration, and completion status.
        </p>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
            <TableIcon className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-extrabold">Voice sessions</h3>
        </div>

        <div className="scrollbar-clean overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <caption className="sr-only">Voice session logs</caption>
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                <th
                  className="px-5 py-4 text-sm font-extrabold text-[var(--color-muted)]"
                  scope="col"
                >
                  Date
                </th>
                <th
                  className="px-5 py-4 text-sm font-extrabold text-[var(--color-muted)]"
                  scope="col"
                >
                  Agent
                </th>
                <th
                  className="px-5 py-4 text-sm font-extrabold text-[var(--color-muted)]"
                  scope="col"
                >
                  Duration
                </th>
                <th
                  className="px-5 py-4 text-sm font-extrabold text-[var(--color-muted)]"
                  scope="col"
                >
                  Status
                </th>
                <th
                  className="px-5 py-4 text-sm font-extrabold text-[var(--color-muted)]"
                  scope="col"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-white">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const completed = log.status === "completed";
                  return (
                    <tr
                      key={log.id}
                      className="transition hover:bg-[var(--color-page)]"
                    >
                      <td className="px-5 py-4 text-sm font-bold">
                        {new Date(log.started_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {log.agent_name || "Voice Agent"}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {log.duration_seconds || 0}s
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`status-pill ${completed ? "bg-emerald-50 text-[var(--color-accent-strong)]" : "bg-amber-50 text-[var(--color-amber)]"}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${completed ? "bg-[var(--color-accent)]" : "bg-[var(--color-amber)]"}`}
                          />
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="focus-ring rounded-md text-sm font-extrabold text-[var(--color-accent-strong)] hover:text-[var(--color-ink)]"
                        >
                          View transcript
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                        <SignalIcon className="h-5 w-5" />
                      </span>
                      <p className="font-extrabold">No session logs yet</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                        Start a voice session from an agent to create the first
                        log.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
