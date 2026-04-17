"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { apiUrl } from "../../lib/api";
import { CheckIcon, LogoMark, MicIcon } from "../../components/Icons";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (res.ok) {
        // Automatically sign in after signup
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (loginResult?.error) {
          setError("Account created, but auto login failed. Please log in.");
          setLoading(false);
          router.push("/login");
          return;
        }
        router.push("/dashboard");
      } else {
        setError(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create account");
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[var(--color-page)] text-[var(--color-ink)] lg:grid-cols-[0.95fr_1fr]">
      <section className="hidden border-r border-[var(--color-border)] bg-[var(--color-primary)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[var(--color-primary)]">
            <MicIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-8 max-w-md text-4xl font-extrabold leading-tight">
            Launch the first agent from a clean setup path.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-white/80">
            Create an account, add an agent, copy a key, and run a live voice
            session from the dashboard.
          </p>
          <ul className="mt-8 grid gap-4">
            {[
              "No credit card for the developer plan",
              "Agent setup in the dashboard",
              "Docs and keys ready after signup",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm font-bold"
              >
                <CheckIcon className="h-5 w-5 text-emerald-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/globe.svg"
          alt="Global language coverage illustration"
          className="h-44 w-44 opacity-80 invert"
          width="176"
          height="176"
        />
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="panel w-full max-w-md p-6 sm:p-8">
          <Link
            href="/"
            className="focus-ring mb-8 inline-flex items-center gap-3 rounded-lg font-extrabold"
          >
            <LogoMark className="h-8 w-8 text-[var(--color-primary)]" />
            Sonic Serve AI
          </Link>
          <h1 className="text-3xl font-extrabold">Create account</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Start with a developer workspace for multilingual voice agents.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-extrabold">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-extrabold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-extrabold">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-[var(--color-danger)]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary focus-ring mt-1 w-full"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="focus-ring rounded-md font-extrabold text-[var(--color-ink)] hover:text-[var(--color-accent-strong)]"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
