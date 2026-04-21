"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckIcon, LogoMark, ShieldIcon } from "../../components/Icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="grid min-h-screen bg-[var(--color-page)] text-[var(--color-ink)] lg:grid-cols-[1fr_0.95fr]">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="panel w-full max-w-md p-6 sm:p-8">
          <Link
            href="/"
            className="focus-ring mb-8 inline-flex items-center gap-3 rounded-lg font-extrabold"
          >
            <LogoMark className="h-8 w-8 text-[var(--color-primary)]" />
            Sonic Serve AI
          </Link>
          <h1 className="text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Sign in to manage agents, keys, and usage logs.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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
                autoComplete="current-password"
                placeholder="Enter your password"
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
                {error}. Check your email and password, then try again.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary focus-ring mt-1 w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-muted)]">
            Do not have an account?{" "}
            <Link
              href="/signup"
              className="focus-ring rounded-md font-extrabold text-[var(--color-ink)] hover:text-[var(--color-accent-strong)]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden border-l border-[var(--color-border)] bg-white px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="panel-muted inline-flex h-12 w-12 items-center justify-center">
            <ShieldIcon className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <h2 className="mt-8 max-w-md text-4xl font-extrabold leading-tight">
            Return to your voice operations workspace.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-[var(--color-muted)]">
            Monitor sessions, update agents, and keep API access under team
            control.
          </p>
          <ul className="mt-8 grid gap-4">
            {[
              "Secure dashboard access",
              "Live agent testing",
              "Usage and transcript history",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm font-bold"
              >
                <CheckIcon className="h-5 w-5 text-[var(--color-accent)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/window.svg"
          alt="Browser window illustration"
          className="h-44 w-44 opacity-80"
          width="176"
          height="176"
        />
      </section>
    </main>
  );
}
