"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const ROUTES = {
  adminDashboard: "/admindashboard",
  cvBuilder: "/cv-builder",
  cvBuilderSuccess: "/cv-builder/success",
  pricing: "/pricing",
};

/*
|--------------------------------------------------------------------------
| Check whether the user has an active CV Builder plan
|--------------------------------------------------------------------------
*/

function checkActivePlan(user) {
  if (!user) return false;

  const subscriptionStatus = String(
    user.subscriptionStatus || ""
  ).toLowerCase();

  const oneTimeAccessStatus = String(
    user.oneTimeAccessStatus || ""
  ).toLowerCase();

  const accessExpiresAt = user.accessExpiresAt
    ? new Date(user.accessExpiresAt).getTime()
    : null;

  const oneTimePlanActive =
    oneTimeAccessStatus === "active" &&
    (!accessExpiresAt || accessExpiresAt > Date.now());

  const subscriptionActive = ["active", "trialing"].includes(
    subscriptionStatus
  );

  return Boolean(
    user.hasActiveSubscription === true ||
      subscriptionActive ||
      oneTimePlanActive
  );
}

/*
|--------------------------------------------------------------------------
| Create internal URL with query parameters
|--------------------------------------------------------------------------
*/

function createInternalUrl(pathname, params = {}) {
  const url = new URL(pathname, "http://localhost");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
}

function GoogleIcon() {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="block h-5 w-5 shrink-0"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />

      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />

      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />

      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />

      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession();

  const redirectStartedRef = useRef(false);

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Selected template details coming from CV Builder
  |--------------------------------------------------------------------------
  */

  const template =
    searchParams.get("template") ||
    searchParams.get("selectedTemplate") ||
    "";

  const cvId = searchParams.get("cvId") || "";

  /*
  |--------------------------------------------------------------------------
  | Login redirect logic
  |--------------------------------------------------------------------------
  |
  | 1. Admin => Admin dashboard
  | 2. User + template + active plan => CV Builder success
  | 3. User + template + inactive plan => Pricing
  | 4. No template => CV Builder
  |
  */

  const redirectAfterLogin = useCallback(
    (currentSession) => {
      if (redirectStartedRef.current) return;

      const user = currentSession?.user;

      if (!user) return;

      redirectStartedRef.current = true;

      const role = String(user.role || "").toLowerCase();

      /*
      |--------------------------------------------------------------------------
      | Admin redirect
      |--------------------------------------------------------------------------
      */

      if (role === "admin") {
        router.replace(ROUTES.adminDashboard);
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Detect selected template
      |--------------------------------------------------------------------------
      */

      const selectedTemplate =
        template ||
        user.selectedTemplate ||
        user.templateId ||
        "";

      /*
      |--------------------------------------------------------------------------
      | No template selected
      |--------------------------------------------------------------------------
      */

      if (!selectedTemplate) {
        router.replace(ROUTES.cvBuilder);
        return;
      }

      const redirectParams = {
        template: selectedTemplate,
        cvId,
        service: "cv-builder",
      };

      /*
      |--------------------------------------------------------------------------
      | Template selected and plan active
      |--------------------------------------------------------------------------
      */

      if (checkActivePlan(user)) {
        router.replace(
          createInternalUrl(
            ROUTES.cvBuilderSuccess,
            redirectParams
          )
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Template selected but plan inactive
      |--------------------------------------------------------------------------
      */

      router.replace(
        createInternalUrl(ROUTES.pricing, redirectParams)
      );
    },
    [router, template, cvId]
  );

  /*
  |--------------------------------------------------------------------------
  | Handle already-authenticated users and Google login return
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      redirectAfterLogin(session);
    }
  }, [status, session, redirectAfterLogin]);

  const updateForm = (field, value) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Google callback URL
  |--------------------------------------------------------------------------
  |
  | Google returns the user to this login page.
  | The useEffect above then applies the same redirect rules.
  |
  */

  const getGoogleCallbackUrl = () => {
    return createInternalUrl("/login", {
      template,
      cvId,
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError("");

      await signIn("google", {
        callbackUrl: getGoogleCallbackUrl(),
      });
    } catch (loginError) {
      console.error("Google login error:", loginError);

      setError("Unable to continue with Google.");
      setGoogleLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Manual credentials login
  |--------------------------------------------------------------------------
  */

  const handleManualLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      redirectStartedRef.current = false;

      const result = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      const updatedSession = await getSession();

      if (!updatedSession?.user) {
        setError(
          "Login completed, but account details could not be loaded."
        );
        return;
      }

      redirectAfterLogin(updatedSession);
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError("Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Register account
  |--------------------------------------------------------------------------
  */

  const handleRegister = async (event) => {
    event.preventDefault();

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

      const response = await fetch("/api/auth/register", {
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Unable to create account.");
        return;
      }

      setMode("login");

      setError(
        "Account created successfully. Please login to continue."
      );

      setForm((previousForm) => ({
        ...previousForm,
        password: "",
        confirmPassword: "",
      }));
    } catch (registerError) {
      console.error("Register error:", registerError);
      setError("Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading and redirect screen
  |--------------------------------------------------------------------------
  */

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <p className="text-sm font-bold text-white/60">
          {status === "authenticated"
            ? "Redirecting..."
            : "Loading..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 text-white">
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:border-qorliqGold hover:bg-qorliqGold hover:text-black"
        >
          <span className="text-lg leading-none">←</span>
          Back to Home
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            Secure Account
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">
            Login to continue.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            Login or create your account to continue with your CV.
          </p>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold text-white">
              Your current flow:
            </p>

            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>1. Select your CV template</p>
              <p>2. Login or create account</p>
              <p>3. Choose a plan if required</p>
              <p>4. Complete your CV</p>
              <p>5. Download your CV</p>
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
            disabled={googleLoading}
            className="group relative mx-auto mt-6 flex h-10 w-full max-w-[400px] select-none items-center justify-center overflow-hidden rounded-[20px] bg-[#f2f2f2] px-3 text-center font-['Roboto',Arial,sans-serif] text-sm font-medium tracking-[0.25px] text-[#1f1f1f] outline-none transition-[background-color,border-color,box-shadow] duration-200 hover:shadow-[0_1px_2px_0_rgba(60,64,67,.30),0_1px_3px_1px_rgba(60,64,67,.15)] focus:shadow-[0_1px_2px_0_rgba(60,64,67,.30),0_1px_3px_1px_rgba(60,64,67,.15)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {googleLoading ? (
              <span className="absolute inset-0 z-10 flex items-center justify-center bg-[#f2f2f2]/90">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1f1f1f]/25 border-t-[#1f1f1f]" />
              </span>
            ) : null}

            <span className="relative flex h-full w-full items-center justify-center gap-3">
              <GoogleIcon />

              <span>
                {googleLoading
                  ? "Please wait..."
                  : "Sign in with Google"}
              </span>
            </span>
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Or
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form
            onSubmit={
              mode === "login"
                ? handleManualLogin
                : handleRegister
            }
            className="space-y-4"
          >
            {mode === "register" ? (
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                  Full Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none focus:border-qorliqGold"
                  placeholder="Enter your full name"
                  required
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
                onChange={(event) =>
                  updateForm("email", event.target.value)
                }
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
                onChange={(event) =>
                  updateForm("password", event.target.value)
                }
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
                  onChange={(event) =>
                    updateForm(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none focus:border-qorliqGold"
                  placeholder="Confirm password"
                  required
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
                  : "Create Account"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}