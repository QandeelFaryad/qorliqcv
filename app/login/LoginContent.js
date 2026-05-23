"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const callbackUrl = searchParams.get("callbackUrl") || "/pricing";
  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";
  const plan = searchParams.get("plan") || "";

  const finalCallbackUrl = useMemo(() => {
    const url = new URL(callbackUrl, "http://localhost");

    if (cvId && !url.searchParams.get("cvId")) {
      url.searchParams.set("cvId", cvId);
    }

    if (template && !url.searchParams.get("template")) {
      url.searchParams.set("template", template);
    }

    if (plan && !url.searchParams.get("plan")) {
      url.searchParams.set("plan", plan);
    }

    return `${url.pathname}${url.search}`;
  }, [callbackUrl, cvId, template, plan]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(finalCallbackUrl);
    }
  }, [status, router, finalCallbackUrl]);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGoogleLogin = async () => {
    setError("");

    await signIn("google", {
      callbackUrl: finalCallbackUrl,
    });
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(finalCallbackUrl);
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (
        !form.name.trim() ||
        !form.email.trim() ||
        !form.password ||
        !form.confirmPassword
      ) {
        setError("All fields are required.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Password and confirm password do not match.");
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Unable to create account.");
        return;
      }

      setMode("login");
      setError("Account created successfully. Please login to continue.");

      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Register error:", error);
      setError("Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <p className="text-sm font-bold text-white/60">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 text-white">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            Secure Account
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">
            Login to continue your CV download.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            Create your account to save your CV, choose your package, complete
            checkout and download your final PDF or MS Word file.
          </p>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold text-white">Your current flow:</p>

            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>1. Template selected</p>
              <p>2. CV details completed</p>
              <p>3. Login / create account</p>
              <p>4. Choose package</p>
              <p>5. Checkout</p>
              <p>6. Download PDF / Word</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl md:p-8">
          <div className="grid grid-cols-2 rounded-full bg-black/40 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                mode === "login"
                  ? "bg-qorliqGold text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                mode === "register"
                  ? "bg-qorliqGold text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-qorliqGold"
          >
            Continue with Google / Gmail
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form
            onSubmit={mode === "login" ? handleManualLogin : handleRegister}
            className="space-y-4"
          >
            {mode === "register" ? (
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                  Full Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none focus:border-qorliqGold"
                  placeholder="Enter your full name"
                  required={mode === "register"}
                />
              </div>
            ) : null}

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none focus:border-qorliqGold"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none focus:border-qorliqGold"
                placeholder="Enter password"
                required
              />
            </div>

            {mode === "register" ? (
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateForm("confirmPassword", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none focus:border-qorliqGold"
                  placeholder="Confirm password"
                  required={mode === "register"}
                />
              </div>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-qorliqGold px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login & Continue"
                : "Create Account & Continue"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}