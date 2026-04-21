"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  CodeIcon,
  CopyIcon,
  KeyIcon,
  ShieldIcon,
} from "../../../components/Icons";

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey =
    session?.user?.api_key || "sonic_sk_live_********************************";
  const hiddenKey = "sonic_sk_live_********************************";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[var(--color-accent-strong)]">
            Developer access
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">API keys</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Manage keys for the Sonic Serve AI API and SDK.
          </p>
        </div>
        <span className="status-pill bg-emerald-50 text-[var(--color-accent-strong)]">
          <ShieldIcon className="h-4 w-4" />
          Secret key
        </span>
      </section>

      <section className="panel p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
            <KeyIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold">Secret API key</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
              Keep this key private. It grants access to agent creation,
              streaming sessions, and account usage.
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <code className="min-h-12 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 font-mono text-sm text-[var(--color-ink)]">
            {reveal ? apiKey : hiddenKey}
          </code>
          <button
            type="button"
            onClick={() => setReveal(!reveal)}
            className="btn btn-secondary focus-ring"
          >
            {reveal ? "Hide" : "Reveal"}
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className="btn btn-primary focus-ring min-w-28"
          >
            <CopyIcon className="h-4 w-4" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p
          aria-live="polite"
          className="mt-3 min-h-6 text-sm font-bold text-[var(--color-accent-strong)]"
        >
          {copied ? "API key copied to clipboard." : ""}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="panel p-5 sm:p-6">
          <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
            <CodeIcon className="h-5 w-5" />
          </span>
          <h3 className="text-xl font-extrabold">SDK integration</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Embed voice into your product with an agent ID, key, and WebSocket
            session.
          </p>
        </div>

        <div className="code-panel overflow-hidden">
          <div className="border-b border-[#273244] px-5 py-3 text-sm font-bold text-white">
            install-and-connect.sh
          </div>
          <pre className="overflow-x-auto p-5 text-sm leading-7">
            {`npm install @sonicserve/sdk

import { SonicServeAI } from '@sonicserve/sdk';

const agent = new SonicServeAI({
  agentId: 'YOUR_AGENT_ID',
  apiKey: '${reveal ? apiKey : "YOUR_API_KEY"}',
});

await agent.connect();`}
          </pre>
        </div>
      </section>
    </div>
  );
}
