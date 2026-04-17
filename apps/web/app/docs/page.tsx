import { Header } from "../../components/Header";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  BookIcon,
  CodeIcon,
  KeyIcon,
  MicIcon,
  SignalIcon,
} from "../../components/Icons";

const sections = [
  { id: "quickstart", title: "Quickstart" },
  { id: "api", title: "REST API" },
  { id: "websocket", title: "WebSocket" },
  { id: "sdk", title: "SDK" },
  { id: "languages", title: "Languages" },
];

export default function DocsPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--color-page)] text-[var(--color-ink)]"
    >
      <Header />

      <section className="border-b border-[var(--color-border)] bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-extrabold text-[var(--color-accent-strong)]">
              Developer docs
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Build and test a voice agent from the dashboard or API.
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-[var(--color-muted)]">
              Create an agent, copy a key, and connect a real-time voice session
              through WebSocket streaming.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary focus-ring">
                Get an API key
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="#quickstart" className="btn btn-secondary focus-ring">
                Start quickstart
              </Link>
            </div>
          </div>
          <Image
            src="/file-text.svg"
            alt="Documentation file illustration"
            className="hidden h-32 w-32 opacity-80 lg:block"
            width="128"
            height="128"
          />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:py-14">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <p className="mb-3 text-sm font-extrabold text-[var(--color-muted)]">
              On this page
            </p>
            <nav className="grid gap-1" aria-label="Documentation sections">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="focus-ring rounded-lg px-3 py-2 text-sm font-bold text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-ink)]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-16">
          <section id="quickstart">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                <BookIcon className="h-5 w-5" />
              </span>
              <h2 className="text-3xl font-extrabold">Quickstart</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Create an agent",
                  copy: "Choose the primary language and set the system prompt from your dashboard.",
                  href: "/dashboard/agents",
                },
                {
                  title: "Copy an API key",
                  copy: "Use a secret key for SDK setup and server-side requests.",
                  href: "/dashboard/api-keys",
                },
                {
                  title: "Open a stream",
                  copy: "Send microphone audio and receive transcript, response text, and voice output.",
                  href: "#websocket",
                },
              ].map((item, index) => (
                <article key={item.title} className="panel p-5">
                  <p className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-sm font-extrabold text-[var(--color-primary)]">
                    {index + 1}
                  </p>
                  <h3 className="text-lg font-extrabold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                    {item.copy}
                  </p>
                  <Link
                    href={item.href}
                    className="focus-ring mt-5 inline-flex rounded-md text-sm font-extrabold text-[var(--color-accent-strong)] hover:text-[var(--color-ink)]"
                  >
                    Continue
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section
            id="api"
            className="border-t border-[var(--color-border)] pt-12"
          >
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <KeyIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold">REST API</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  Create and manage voice agents from your backend.
                </p>
              </div>
            </div>
            <div className="panel overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
                <span className="status-pill bg-emerald-50 text-[var(--color-accent-strong)]">
                  POST
                </span>
                <code className="font-mono text-sm font-extrabold">
                  /api/agents
                </code>
              </div>
              <div className="grid gap-6 p-5 lg:grid-cols-[0.8fr_1.2fr]">
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  Create a new agent with a name, language, and system prompt.
                </p>
                <pre className="code-panel overflow-x-auto p-5 text-sm leading-7">
                  {`{
  "name": "Customer Support",
  "language": "hi",
  "system_prompt": "Answer policy questions and escalate billing issues."
}`}
                </pre>
              </div>
            </div>
          </section>

          <section
            id="websocket"
            className="border-t border-[var(--color-border)] pt-12"
          >
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <SignalIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold">WebSocket protocol</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  Stream raw audio and receive events in the same session.
                </p>
              </div>
            </div>
            <pre className="code-panel overflow-x-auto p-5 text-sm leading-7">
              {`wss://api.sonicserve.ai/voice?agentId=AGENT_ID&apiKey=API_KEY

events:
ready
processing
transcript
response_text
audio_meta
done`}
            </pre>
          </section>

          <section
            id="sdk"
            className="border-t border-[var(--color-border)] pt-12"
          >
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <CodeIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold">SDK reference</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  Initialize an agent and open a live connection from your app.
                </p>
              </div>
            </div>
            <pre className="code-panel overflow-x-auto p-5 text-sm leading-7">
              {`npm install @sonicserve/sdk

import { SonicServeAI } from '@sonicserve/sdk';

const agent = new SonicServeAI({
  agentId: 'YOUR_AGENT_ID',
  apiKey: 'YOUR_API_KEY',
});

await agent.connect();`}
            </pre>
          </section>

          <section
            id="languages"
            className="border-t border-[var(--color-border)] pt-12"
          >
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <MicIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-3xl font-extrabold">Supported languages</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  Start with major Indian languages and expand coverage as your
                  rollout grows.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                "Hindi",
                "Bengali",
                "Telugu",
                "Marathi",
                "Tamil",
                "Urdu",
                "Gujarati",
                "Kannada",
                "Odia",
                "Malayalam",
                "Punjabi",
                "Assamese",
              ].map((language) => (
                <div
                  key={language}
                  className="panel px-4 py-3 text-center text-sm font-extrabold"
                >
                  {language}
                </div>
              ))}
              <div className="panel-muted px-4 py-3 text-center text-sm font-extrabold text-[var(--color-muted)]">
                91 more
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
