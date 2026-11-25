"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to sign in.");
        return;
      }
      window.location.assign("/admin/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof DOMException && submitError.name === "AbortError"
          ? "Sign-in timed out. Check the Supabase connection and try again."
          : "Unable to establish a secure session.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FBF7EE] px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 -top-32 size-[34rem] rounded-full bg-[#E9DCC5]/55 blur-3xl" />
        <div className="absolute -bottom-48 -right-40 size-[38rem] rounded-full bg-[#E9DCC5]/60 blur-3xl" />
        <div className="absolute left-[8%] top-[20%] hidden h-px w-40 bg-[#A8B88A]/70 sm:block" />
        <div className="absolute bottom-[15%] right-[8%] hidden h-px w-40 bg-[#A8B88A]/70 sm:block" />
      </div>

      <div className="relative flex min-h-[calc(100vh-3rem)] items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <section
          aria-label="Admin login"
          className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#E9DCC5] bg-[#FFFEFA] px-5 py-7 shadow-[0_18px_50px_rgba(38,61,24,0.12)] sm:px-9 sm:py-9"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[#EAF1DF]" aria-hidden="true" />

          <div className="relative text-center">
            <div className="flex justify-center">
              <Logo size="md" href="/" />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#A8B88A]/55 bg-[#EAF1DF] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-[#536B35]">
              <Sparkles className="size-3" aria-hidden="true" />
              <span>AUTHORIZED ACCESS</span>
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-none text-[#1D3214] sm:text-5xl">Admin login</h1>
            <div className="mx-auto mt-4 h-0.5 w-12 bg-[#536B35]" aria-hidden="true" />
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#777968]">
              Manage products, categories, orders, customers, and storefront content securely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative mt-6 space-y-3.5 sm:mt-7" noValidate>
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            <label className="relative block">
              <span className="sr-only">Admin email address</span>
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#536B35]" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                aria-label="Admin email address"
                placeholder="Admin email address"
                className="h-14 w-full rounded-xl border border-[#28321F]/12 bg-white px-4 pl-12 text-sm text-[#28321F] shadow-[0_2px_6px_rgba(38,61,24,0.03)] outline-none transition placeholder:text-[#AAA7A1] focus:border-[#536B35] focus:ring-4 focus:ring-[#A8B88A]/25"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Admin password</span>
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#536B35]" aria-hidden="true" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                aria-label="Admin password"
                placeholder="Admin password"
                className="h-14 w-full rounded-xl border border-[#28321F]/12 bg-white px-4 pl-12 pr-12 text-sm text-[#28321F] shadow-[0_2px_6px_rgba(38,61,24,0.03)] outline-none transition placeholder:text-[#AAA7A1] focus:border-[#536B35] focus:ring-4 focus:ring-[#A8B88A]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#99958D] transition hover:bg-[#EAF1DF] hover:text-[#536B35]"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-[#263D18] text-sm font-bold tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(38,61,24,0.18)] transition hover:bg-[#1D3214] hover:shadow-[0_12px_24px_rgba(38,61,24,0.24)] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "SIGNING IN..." : "LOG IN"}
            </button>
          </form>

          <div className="relative mt-6 border-t border-[#28321F]/10 pt-5 text-center text-sm text-[#777968] sm:mt-7">
            <span>Return to Liyana Naturals?</span>{" "}
            <Link href="/" className="font-semibold text-[#536B35] transition hover:text-[#263D18]">
              Storefront
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
