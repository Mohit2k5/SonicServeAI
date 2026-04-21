"use client";
import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import { VoiceAssistant } from "../../../components/VoiceAssistant";
import {
  CloseIcon,
  MicIcon,
  PlusIcon,
  SignalIcon,
} from "../../../components/Icons";
import { apiUrl } from "../../../lib/api";

interface Agent {
  id: string;
  name: string;
  language: string;
  is_active: boolean;
  created_at: string;
}

const languageLabels: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  bn: "Bengali",
  te: "Telugu",
  mr: "Marathi",
  ta: "Tamil",
};

export default function AgentsPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("hi");
  const [prompt, setPrompt] = useState("");

  const fetchAgents = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(apiUrl("/api/agents"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setCreating(true);
    try {
      const res = await fetch(apiUrl("/api/agents"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, language, system_prompt: prompt }),
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setPrompt("");
        setLanguage("hi");
        await fetchAgents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="panel h-48 animate-pulse bg-white p-6">
            <div className="h-11 w-11 rounded-lg bg-[var(--color-surface-muted)]" />
            <div className="mt-8 h-5 w-36 rounded bg-[var(--color-surface-muted)]" />
            <div className="mt-4 h-4 w-24 rounded bg-[var(--color-surface-muted)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[var(--color-accent-strong)]">
            Agent builder
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">My agents</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Manage multilingual assistants and run live voice sessions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn btn-primary focus-ring"
        >
          <PlusIcon className="h-4 w-4" />
          Create agent
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <article key={agent.id} className="panel flex min-h-64 flex-col p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <MicIcon className="h-6 w-6" />
              </div>
              <span
                className={`status-pill ${agent.is_active ? "bg-emerald-50 text-[var(--color-accent-strong)]" : "bg-red-50 text-[var(--color-danger)]"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${agent.is_active ? "bg-[var(--color-accent)]" : "bg-[var(--color-danger)]"}`}
                />
                {agent.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-extrabold">{agent.name}</h3>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[var(--color-muted)]">
                    Language
                  </dt>
                  <dd className="font-extrabold">
                    {languageLabels[agent.language] || agent.language}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[var(--color-muted)]">
                    Created
                  </dt>
                  <dd className="font-extrabold">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAgent(agent)}
              className="btn btn-secondary focus-ring mt-6 w-full"
            >
              <SignalIcon className="h-4 w-4" />
              Launch session
            </button>
          </article>
        ))}

        {agents.length === 0 && (
          <div className="panel col-span-full flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
              <MicIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold">
              Create your first voice agent
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">
              Add a language, prompt, and behavior profile before starting a
              live test session.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn btn-primary focus-ring mt-6"
            >
              Create agent
            </button>
          </div>
        )}
      </section>

      {selectedAgent && (
        <VoiceAssistant
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div
            className="panel w-full max-w-lg bg-white p-6 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-agent-title"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="create-agent-title" className="text-2xl font-extrabold">
                  New voice agent
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  Set the language and behavior for your next session.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                aria-label="Close dialog"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="agent-name" className="text-sm font-extrabold">
                  Agent name
                </label>
                <input
                  id="agent-name"
                  type="text"
                  placeholder="Customer Support"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="agent-language"
                  className="text-sm font-extrabold"
                >
                  Primary language
                </label>
                <select
                  id="agent-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field"
                >
                  <option value="hi">Hindi</option>
                  <option value="en">English</option>
                  <option value="bn">Bengali</option>
                  <option value="te">Telugu</option>
                  <option value="mr">Marathi</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="agent-prompt"
                  className="text-sm font-extrabold"
                >
                  System prompt
                </label>
                <textarea
                  id="agent-prompt"
                  placeholder="Describe the agent role, escalation rules, and tone."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="input-field min-h-36 resize-y"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary focus-ring flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary focus-ring flex-1"
                >
                  {creating ? "Creating..." : "Create agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
