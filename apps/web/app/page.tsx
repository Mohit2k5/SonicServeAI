import { Header } from "../components/Header";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  CodeIcon,
  MicIcon,
  ShieldIcon,
  SignalIcon,
} from "../components/Icons";

export default function Home() {
  const waveform = [
    22, 56, 34, 74, 48, 82, 28, 62, 90, 44, 70, 36, 88, 58, 30, 66, 50, 78, 40,
    86, 32, 68, 52, 76,
  ];

  const steps = [
    {
      icon: MicIcon,
      title: "Listen",
      desc: "Capture live speech from web, mobile, or kiosk flows with clear consent states.",
    },
    {
      icon: SignalIcon,
      title: "Understand",
      desc: "Transcribe, detect language, and route each utterance through your agent policy.",
    },
    {
      icon: BookIcon,
      title: "Ground",
      desc: "Answer with product, policy, and support knowledge from your approved sources.",
    },
    {
      icon: ShieldIcon,
      title: "Respond",
      desc: "Return natural speech and a text trail for audit, analytics, and follow-up.",
    },
  ];

  const features = [
    "Real-time multilingual STT",
    "Configurable voice agents",
    "RAG knowledge grounding",
    "Session logs and transcripts",
    "Developer API keys",
    "Usage and cost visibility",
    "WebSocket voice streaming",
    "Enterprise access controls",
    "103 Indian languages",
  ];

  const pricing = [
    {
      name: "Developer",
      description: "For prototypes, pilots, and first production agents.",
      price: "$0.02",
      suffix: "/ 1k tokens",
      cta: "Start building",
      href: "/signup",
      tone: "light",
      items: [
        "All supported languages",
        "Dashboard access",
        "Standard RAG support",
        "Community support",
      ],
    },
    {
      name: "Enterprise",
      description: "For dedicated capacity, governance, and support.",
      price: "Custom",
      suffix: "",
      cta: "Talk to sales",
      href: "#contact",
      tone: "dark",
      items: [
        "Dedicated infrastructure",
        "Custom model policy",
        "Security review support",
        "Priority response SLAs",
      ],
    },
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--color-page)] text-[var(--color-ink)]"
    >
      <Header />

      <section className="relative overflow-hidden bg-[var(--color-hero)] px-4 py-16 text-white sm:px-6 lg:py-20">
        <Image
          src="/globe.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-8 h-72 w-72 opacity-10 invert sm:h-96 sm:w-96 lg:right-20"
          width="384"
          height="384"
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex min-h-9 items-center rounded-lg border border-white/20 px-3 text-sm font-bold text-emerald-100">
              Voice automation for India-scale support
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Give every customer a fluent voice agent.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Build real-time AI voice agents that listen, answer, and escalate
              across Indian languages with audit-ready logs and developer
              controls.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-accent focus-ring">
                Start building
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="btn border border-white/25 bg-white text-[var(--color-primary)] hover:bg-emerald-50 focus-ring"
              >
                Read docs
              </Link>
            </div>
          </div>

          <div className="mt-12 max-w-4xl border-t border-white/20 pt-7">
            <div className="flex h-20 items-end gap-2" aria-hidden="true">
              {waveform.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="w-2 rounded-sm bg-emerald-400"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-5 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
              <p>
                <strong className="text-white">103</strong> Indian languages and
                dialects
              </p>
              <p>
                <strong className="text-white">Live</strong> speech-to-speech
                sessions
              </p>
              <p>
                <strong className="text-white">Built-in</strong> agent logs and
                API access
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Operational highlights"
        className="border-b border-[var(--color-border)] bg-white px-4 py-6 sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          {[
            ["Average handoff time", "< 2 sec"],
            ["Supported regions", "India-first"],
            ["Setup path", "API or dashboard"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-6"
            >
              <span className="text-sm font-bold text-[var(--color-muted)]">
                {label}
              </span>
              <span className="text-lg font-extrabold text-[var(--color-ink)]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold text-[var(--color-accent-strong)]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              One pipeline for speech, reasoning, and recovery.
            </h2>
            <p className="mt-4 leading-7 text-[var(--color-muted)]">
              Your agent receives voice, grounds each answer, and keeps a
              readable trail for support teams.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="panel p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-extrabold text-[var(--color-muted)]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                    {step.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-extrabold text-[var(--color-cyan)]">
                Platform coverage
              </p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                The controls teams need after the demo works.
              </h2>
              <p className="mt-4 leading-7 text-[var(--color-muted)]">
                Sonic Serve AI pairs voice quality with operational basics:
                keys, logs, agent setup, and usage views.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="panel flex min-h-28 flex-col justify-between p-5"
                >
                  <CheckIcon className="h-5 w-5 text-[var(--color-accent)]" />
                  <h3 className="mt-4 text-sm font-extrabold">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="custom-agents" className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-extrabold text-[var(--color-accent-strong)]">
              Custom agents
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Configure the agent, then launch the session.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-[var(--color-muted)]">
              Set the language, system behavior, and knowledge source. The same
              agent can run in a dashboard test, a web widget, or your own voice
              flow.
            </p>
            <ul className="mt-8 grid gap-3">
              {[
                "SDK integration for web and mobile",
                "Custom system prompts and policies",
                "Knowledge grounding for product answers",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm font-bold text-[var(--color-ink)]"
                >
                  <CheckIcon className="mt-0.5 h-5 w-5 flex-none text-[var(--color-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="code-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#273244] px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <CodeIcon className="h-4 w-4 text-emerald-400" />
                agent.ts
              </div>
              <span className="status-pill bg-emerald-500/15 text-emerald-200">
                Ready
              </span>
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-7">
              {`import { SonicServeAI } from '@sonicserve/sdk';

const agent = new SonicServeAI({
  agentId: 'agent_customer_support',
  apiKey: process.env.SONIC_SERVE_API_KEY,
  language: 'hi',
});

await agent.connect();`}
            </pre>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold text-[var(--color-cyan)]">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Start small. Keep the path to production open.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {pricing.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-lg border p-6 ${
                  plan.tone === "dark"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-white"
                }`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold">{plan.name}</h3>
                    <p
                      className={`mt-2 max-w-md text-sm leading-6 ${plan.tone === "dark" ? "text-white/80" : "text-[var(--color-muted)]"}`}
                    >
                      {plan.description}
                    </p>
                  </div>
                  <p className="text-3xl font-extrabold">
                    {plan.price}
                    {plan.suffix && (
                      <span
                        className={`text-base font-bold ${plan.tone === "dark" ? "text-white/80" : "text-[var(--color-muted)]"}`}
                      >
                        {" "}
                        {plan.suffix}
                      </span>
                    )}
                  </p>
                </div>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {plan.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm font-bold"
                    >
                      <CheckIcon
                        className={`h-5 w-5 ${plan.tone === "dark" ? "text-emerald-300" : "text-[var(--color-accent)]"}`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`btn mt-8 focus-ring ${plan.tone === "dark" ? "bg-white text-[var(--color-primary)] hover:bg-emerald-50" : "btn-primary"}`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer
        id="contact"
        className="border-t border-[var(--color-border)] px-4 py-12 sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="focus-ring inline-flex items-center gap-3 rounded-lg font-extrabold"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                <SignalIcon className="h-5 w-5" />
              </span>
              Sonic Serve AI
            </Link>
            <p className="mt-5 max-w-md leading-7 text-[var(--color-muted)]">
              Voice agents for multilingual support teams, developer-led pilots,
              and enterprise customer operations.
            </p>
          </div>
          <div>
            <h3 className="font-extrabold">Resources</h3>
            <ul className="mt-4 grid gap-3 text-sm font-bold text-[var(--color-muted)]">
              <li>
                <Link
                  className="focus-ring rounded-md hover:text-[var(--color-ink)]"
                  href="/docs"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  className="focus-ring rounded-md hover:text-[var(--color-ink)]"
                  href="/dashboard/api-keys"
                >
                  API keys
                </Link>
              </li>
              <li>
                <Link
                  className="focus-ring rounded-md hover:text-[var(--color-ink)]"
                  href="/dashboard/agents"
                >
                  Agents
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold">Sales</h3>
            <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
              Tell us your language coverage, expected sessions, and compliance
              needs.
            </p>
            <Link
              href="mailto:sales@sonicserve.ai"
              className="btn btn-secondary mt-5 focus-ring"
            >
              sales@sonicserve.ai
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-[var(--color-border)] pt-6 text-sm font-bold text-[var(--color-muted)]">
          &copy; {new Date().getFullYear()} Sonic Serve AI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
