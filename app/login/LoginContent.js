"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getSession,
  signIn,
  useSession,
} from "next-auth/react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Link from "next/link";
import Image from "next/image";

import CVBuilderFooter from "@/components/CVBuilderFooter";
import LoginHeader from "@/components/login/LoginHeader";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   ROUTES
========================================================= */

const ROUTES = {
  adminDashboard: "/admindashboard",
  cvBuilder: "/",
  cvBuilderSuccess: "/cv-builder/success",
  pricing: "/pricing",
};

/* =========================================================
   HELPERS
========================================================= */

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

  const subscriptionActive = [
    "active",
    "trialing",
  ].includes(subscriptionStatus);

  return Boolean(
    user.hasActiveSubscription === true ||
      subscriptionActive ||
      oneTimePlanActive
  );
}

function createInternalUrl(pathname, params = {}) {
  const url = new URL(
    pathname,
    "http://localhost"
  );

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(key, value);
      }
    }
  );

  return `${url.pathname}${url.search}`;
}

/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
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
    </svg>
  );
}

/* =========================================================
   NOTIFICATION COMPONENT
========================================================= */

function Notice({
  notice,
  onClose,
}) {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    if (!notice) return;

    setVisible(false);

    const enter = requestAnimationFrame(
      () => setVisible(true)
    );

    const leave = setTimeout(
      () => setVisible(false),
      4700
    );

    const remove = setTimeout(
      onClose,
      5000
    );

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, [notice, onClose]);

  if (!notice) return null;

  const success =
    notice.type === "success";

  return (
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="
    pointer-events-none
    fixed inset-x-0 top-3 z-[100]
    flex justify-center px-3
    sm:top-5 sm:justify-end sm:px-6
  "
>
  <div
    className={`
      qorliq-notice-enter
      pointer-events-auto
      flex w-full max-w-[410px]
      items-start gap-3
      rounded-2xl border
      px-4 py-3.5
      shadow-[0_20px_55px_rgba(15,23,42,0.18)]
      transition-all duration-300 ease-out
      motion-reduce:transition-none

      ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0"
      }

      ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }
    `}
  >
    {/* NOTIFICATION ICON */}

    {success ? (
      <CheckCircle2
        size={21}
        className="mt-0.5 shrink-0 text-emerald-600"
      />
    ) : (
      <XCircle
        size={21}
        className="mt-0.5 shrink-0 text-red-600"
      />
    )}

    {/* NOTIFICATION CONTENT */}

    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-bold">
        {success ? "Success" : "Something went wrong"}
      </p>

      <p className="mt-0.5 text-[13px] leading-relaxed">
        {notice.message}
      </p>
    </div>

    {/* DISMISS BUTTON */}

    <button
      type="button"
      aria-label="Dismiss notification"
      onClick={onClose}
      className="
        flex h-7 w-7 shrink-0
        cursor-pointer items-center justify-center
        rounded-lg
        transition-colors
        hover:bg-black/5
        focus-visible:outline-2
        focus-visible:outline-current
      "
    >
      <X size={16} />
    </button>
  </div>
</div>
  );
}

/* =========================================================
   LOGIN SUCCESS POPUP
   DESKTOP: CENTER MODAL
   MOBILE: BOTTOM SHEET
========================================================= */

function LoginSuccessPopup({
  open,
  userName,
  onDone,
  redirecting = false,
}) {
  const modalRef = useRef(null);
  const doneButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    const previousFocus =
      document.activeElement;

    document.body.style.overflow =
      "hidden";

    const focusFrame = requestAnimationFrame(
      () => {
        doneButtonRef.current?.focus();
      }
    );

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[
        focusable.length - 1
      ];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      cancelAnimationFrame(focusFrame);

      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  const firstName =
    userName?.trim()?.split(/\s+/)[0] ||
    "";

  return (
    <div
      className="
        fixed inset-0 z-[200]
        flex items-end justify-center
        sm:items-center
      "
    >
      {/* BACKDROP */}

      <div
        aria-hidden="true"
        className="
          qorliq-modal-backdrop
          absolute inset-0
          bg-[#061126]/65
          backdrop-blur-[4px]
          
        "
      />

      {/* MODAL */}

      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-success-title"
        aria-describedby="login-success-description"
        className="
          qorliq-modal-panel
          relative z-10
          w-full
          max-h-[92dvh]
          overflow-y-auto
          overscroll-contain
          rounded-t-[30px]
          border border-border
          bg-surface
          px-6
          pb-[calc(24px+env(safe-area-inset-bottom))]
          pt-7
          text-center
          shadow-[0_30px_100px_rgba(0,0,0,0.22)]
          

          sm:mx-4
          sm:max-w-[440px]
          sm:rounded-[26px]
          sm:px-9
          sm:py-10
          
        "
      >
        {/* MOBILE HANDLE */}

        <div
          aria-hidden="true"
          className="
            mx-auto mb-7
            h-1 w-11
            rounded-full
            bg-border-strong
            sm:hidden
          "
        />

        {/* SUCCESS ICON */}

        <div
          className="
            qorliq-success-emblem
            relative mx-auto
            flex h-[108px] w-[108px]
            items-center justify-center
          "
        >
          {/* Outer circle */}

          <div
            className="
              absolute inset-0
              rounded-full
              bg-emerald-500/10
            "
          />

          {/* Middle circle */}

          <div
            className="
              relative flex
              h-[82px] w-[82px]
              items-center justify-center
              rounded-full
              border border-emerald-500/20
              bg-emerald-500/10
            "
          >
            {/* Inner circle */}

            <div
              className="
                qorliq-success-check
                flex h-[58px] w-[58px]
                items-center justify-center
                rounded-full
                bg-emerald-600
                text-white
                shadow-[0_12px_28px_rgba(5,150,105,0.25)]
              "
            >
              <Check
                size={30}
                strokeWidth={3}
              />
            </div>
          </div>
        </div>

        {/* STATUS BADGE */}

        <div
          className="
            mx-auto mt-5
            inline-flex items-center gap-2
            rounded-full
            border border-emerald-500/20
            bg-emerald-500/10
            px-3.5 py-1.5
            text-[11px]
            font-semibold
            tracking-[0.02em]
            text-emerald-700
            dark:text-emerald-400
          "
        >
          <ShieldCheck size={14} />

          Authentication successful
        </div>

        {/* TITLE */}

        <h2
          id="login-success-title"
          className="
            mt-5
            text-[28px]
            font-semibold
            leading-tight
            tracking-[-0.05em]
            text-text-primary
            sm:text-[31px]
          "
        >
          You're signed in!
        </h2>

        {/* DESCRIPTION */}

        <p
          id="login-success-description"
          className="
            mx-auto mt-3
            max-w-[340px]
            text-[14px]
            leading-[1.8]
            text-text-secondary
          "
        >
          {firstName ? (
            <>
              Welcome back,{" "}
              <span className="font-semibold text-text-primary">
                {firstName}
              </span>
              ! Your account is ready.
              Continue to your QORLIQ CV
              experience.
            </>
          ) : (
            <>
              Login successful! Your
              account is ready. Continue
              to your QORLIQ CV experience.
            </>
          )}
        </p>

        {/* DONE BUTTON */}

        <button
          ref={doneButtonRef}
          type="button"
          onClick={onDone}
          disabled={redirecting}
          className="
            group mt-8
            flex h-[52px] w-full
            cursor-pointer
            items-center justify-center
            gap-2.5
            rounded-xl
            bg-[#07183F]
            px-5
            text-[14px]
            font-semibold
            text-white
            transition-all duration-200
            hover:bg-[#102B66]
            active:scale-[0.99]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-accent
            disabled:cursor-not-allowed
            disabled:opacity-60

            dark:bg-accent
            dark:text-[#07183F]
            dark:hover:brightness-95
          "
        >
          {redirecting ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              Redirecting...
            </>
          ) : (
            <>
              Done

              <ArrowRight
                size={17}
                strokeWidth={2}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </>
          )}
        </button>

        {/* FOOTER */}

        <p
          className="
            mt-5
            flex items-center justify-center
            gap-1.5
            text-[11px]
            text-text-muted
          "
        >
          <LockKeyhole size={12} />

          Securely connected to QORLIQ CV
        </p>
      </section>
    </div>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass = `
  mt-2
  h-12 w-full
  rounded-xl
  border border-border
  bg-background
  px-4
  text-[14px]
  text-text-primary
  outline-none
  transition-colors
  placeholder:text-text-muted
  focus:border-accent
  focus:ring-2
  focus:ring-accent/15
  disabled:opacity-60
`;

/* =========================================================
   MAIN LOGIN CONTENT
========================================================= */

export default function LoginContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const {
    data: session,
    status,
  } = useSession();

  /* =====================================================
     REFS
  ===================================================== */

  const redirectStartedRef = useRef(false);

  const submissionLockRef = useRef(false);

  const noticeIdRef = useRef(0);

  const redirectLockRef = useRef(false);

  /* =====================================================
     STATES
  ===================================================== */

  const [mode, setMode] =
    useState("login");

  const [busyAction, setBusyAction] =
    useState("");

  const [notice, setNotice] =
    useState(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    showLoginSuccess,
    setShowLoginSuccess,
  ] = useState(false);

  const [
    authenticatedSession,
    setAuthenticatedSession,
  ] = useState(null);

  const [
    isRedirecting,
    setIsRedirecting,
  ] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* =====================================================
     NOTIFICATION
  ===================================================== */

  const notify = useCallback(
    (message, type = "error") => {
      noticeIdRef.current += 1;

      setNotice({
        id: noticeIdRef.current,
        message,
        type,
      });
    },
    []
  );

  const dismissNotice = useCallback(
    () => setNotice(null),
    []
  );

  /* =====================================================
     SEARCH PARAMETERS
  ===================================================== */

  const template =
    searchParams.get("template") ||
    searchParams.get("selectedTemplate") ||
    "";

  const cvId =
    searchParams.get("cvId") || "";

  /* =====================================================
     EXISTING REDIRECT LOGIC
  ===================================================== */

  const redirectAfterLogin = useCallback(
    (currentSession) => {
      if (
        redirectStartedRef.current
      ) {
        return;
      }

      const user =
        currentSession?.user;

      if (!user) return;

      redirectStartedRef.current = true;

      // Admin redirect

      if (
        String(
          user.role || ""
        ).toLowerCase() === "admin"
      ) {
        router.replace(
          ROUTES.adminDashboard
        );

        return;
      }

      // Selected template

      const selectedTemplate =
        template ||
        user.selectedTemplate ||
        user.templateId ||
        "";

      // No template

      if (!selectedTemplate) {
        router.replace(
          ROUTES.cvBuilder
        );

        return;
      }

      const redirectParams = {
        template: selectedTemplate,
        cvId,
        service: "cv-builder",
      };

      // Active subscription

      if (checkActivePlan(user)) {
        router.replace(
          createInternalUrl(
            ROUTES.cvBuilderSuccess,
            redirectParams
          )
        );

        return;
      }

      // No active subscription

      router.replace(
        createInternalUrl(
          ROUTES.pricing,
          redirectParams
        )
      );
    },
    [
      router,
      template,
      cvId,
    ]
  );

  /* =====================================================
     AUTHENTICATED SESSION HANDLER

     IMPORTANT:
     NO AUTOMATIC REDIRECT.

     SHOW SUCCESS POPUP FIRST.
  ===================================================== */

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session?.user ||
      redirectStartedRef.current
    ) {
      return;
    }

    setAuthenticatedSession(session);

    setShowLoginSuccess(true);
  }, [
    status,
    session,
  ]);

  /* =====================================================
     SUCCESS POPUP DONE BUTTON
  ===================================================== */

  const handleLoginSuccessDone =
    useCallback(() => {
      if (
        redirectLockRef.current
      ) {
        return;
      }

      const currentSession =
        authenticatedSession ||
        session;

      if (
        !currentSession?.user
      ) {
        notify(
          "Unable to load your account. Please try again."
        );

        return;
      }

      redirectLockRef.current = true;

      setIsRedirecting(true);

      redirectAfterLogin(
        currentSession
      );
    }, [
      authenticatedSession,
      session,
      redirectAfterLogin,
      notify,
    ]);

  /* =====================================================
     FORM UPDATE
  ===================================================== */

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =====================================================
     GOOGLE LOGIN
  ===================================================== */

  const handleGoogleLogin =
    async () => {
      if (
        submissionLockRef.current ||
        status !== "unauthenticated"
      ) {
        return;
      }

      submissionLockRef.current = true;

      setBusyAction("google");

      dismissNotice();

      try {
        const result = await signIn(
          "google",
          {
            callbackUrl:
              createInternalUrl(
                "/login",
                {
                  template,
                  cvId,
                }
              ),
          }
        );

        if (result?.error) {
          notify(
            "Unable to continue with Google. Please try again."
          );
        }
      } catch (error) {
        console.error(
          "Google sign-in error:",
          error
        );

        notify(
          "Unable to continue with Google. Please try again."
        );
      } finally {
        submissionLockRef.current =
          false;

        setBusyAction("");
      }
    };

  /* =====================================================
     MANUAL LOGIN
  ===================================================== */

  const handleManualLogin =
    async (event) => {
      event.preventDefault();

      if (
        submissionLockRef.current ||
        status !== "unauthenticated"
      ) {
        return;
      }

      submissionLockRef.current = true;

      setBusyAction("login");

      dismissNotice();

      redirectStartedRef.current =
        false;

      redirectLockRef.current =
        false;

      try {
        const result = await signIn(
          "credentials",
          {
            email: form.email.trim(),
            password: form.password,
            redirect: false,
          }
        );

        if (
          !result ||
          result.error ||
          result.ok === false
        ) {
          notify(
            "Invalid email or password. Please try again."
          );

          return;
        }

        const updatedSession =
          await getSession();

        if (
          !updatedSession?.user
        ) {
          notify(
            "Signed in, but your account details could not be loaded. Please try again."
          );

          return;
        }

        // IMPORTANT:
        // Open popup instead of redirecting.

        setAuthenticatedSession(
          updatedSession
        );

        setShowLoginSuccess(true);
      } catch (error) {
        console.error(
          "Credentials login error:",
          error
        );

        notify(
          "Unable to sign in. Please check your connection and try again."
        );
      } finally {
        submissionLockRef.current =
          false;

        setBusyAction("");
      }
    };

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegister =
    async (event) => {
      event.preventDefault();

      if (
        submissionLockRef.current ||
        status !== "unauthenticated"
      ) {
        return;
      }

      submissionLockRef.current = true;

      setBusyAction("register");

      dismissNotice();

      try {
        if (
          !form.name.trim() ||
          !form.email.trim() ||
          !form.password ||
          !form.confirmPassword
        ) {
          notify(
            "Please complete all required fields."
          );

          return;
        }

        if (
          form.password !==
          form.confirmPassword
        ) {
          notify(
            "Password and confirmation do not match."
          );

          return;
        }

        const response = await fetch(
          "/api/auth/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
              confirmPassword:
                form.confirmPassword,
            }),
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          notify(
            data.error ||
              "Unable to create your account."
          );

          return;
        }

        setMode("login");

        setForm((previous) => ({
          ...previous,
          password: "",
          confirmPassword: "",
        }));

        notify(
          "Account created successfully. Sign in to continue.",
          "success"
        );
      } catch (error) {
        console.error(
          "Registration error:",
          error
        );

        notify(
          "Unable to create your account. Please check your connection."
        );
      } finally {
        submissionLockRef.current =
          false;

        setBusyAction("");
      }
    };

  /* =====================================================
     BUSY STATE
  ===================================================== */

  const busy =
    Boolean(busyAction) ||
    status !== "unauthenticated" ||
    showLoginSuccess ||
    isRedirecting;

  const redirecting =
    isRedirecting;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* Motion is intentionally CSS-only: no dependency, no React animation state. */}
      <style>{`
        @keyframes qorliqRise {
          from { opacity: 0; transform: translate3d(0, 17px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes qorliqBadgeGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,212,207,0); }
          50% { box-shadow: 0 0 0 5px rgba(22,212,207,0.07); }
        }
        @keyframes qorliqBackdropEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes qorliqSheetEnter {
          from { opacity: 0; transform: translate3d(0, 32px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes qorliqModalEnter {
          from { opacity: 0; transform: translate3d(0, 12px, 0) scale(.965); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes qorliqSuccessPop {
          0% { opacity: 0; transform: scale(.65); }
          65% { opacity: 1; transform: scale(1.065); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes qorliqCheckAppear {
          from { transform: scale(.75); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .qorliq-entrance { animation: qorliqRise 570ms cubic-bezier(.18,.7,.24,1) both; }
        .qorliq-entrance-back { animation-delay: 35ms; }
        .qorliq-entrance-hero { animation-delay: 90ms; }
        .qorliq-entrance-card { animation-delay: 135ms; }
        .qorliq-entrance-card-header { animation-delay: 185ms; }
        .qorliq-entrance-tabs { animation-delay: 225ms; }
        .qorliq-entrance-google { animation-delay: 270ms; }
        .qorliq-entrance-form { animation-delay: 320ms; }
        .qorliq-hero-badge { animation: qorliqBadgeGlow 4.5s ease-in-out 1.5s infinite; }
        .qorliq-action-button:not(:disabled) { transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease, opacity 180ms ease; }
        .qorliq-action-button:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 9px 20px rgba(7,24,63,.12); }
        .qorliq-action-button:not(:disabled):active { transform: translateY(0) scale(.99); box-shadow: none; }
        .qorliq-auth-card { transition: box-shadow 260ms ease, border-color 260ms ease; }
        .qorliq-auth-card:focus-within { border-color: rgba(22,212,207,.35); box-shadow: 0 18px 58px rgba(10,25,55,.09); }
        .qorliq-modal-backdrop { animation: qorliqBackdropEnter 260ms ease-out both; }
        .qorliq-modal-panel { animation: qorliqSheetEnter 420ms cubic-bezier(.18,.8,.23,1) both; }
        .qorliq-success-emblem { animation: qorliqSuccessPop 600ms cubic-bezier(.2,.8,.25,1) 120ms both; }
        .qorliq-success-check { animation: qorliqCheckAppear 340ms ease-out 320ms both; }
        @media (min-width: 640px) {
          .qorliq-modal-panel { animation-name: qorliqModalEnter; }
        }
        @media (prefers-reduced-motion: reduce) {
          .qorliq-entrance, .qorliq-hero-badge, .qorliq-modal-backdrop,
          .qorliq-modal-panel, .qorliq-success-emblem, .qorliq-success-check {
            animation: none !important;
          }
          .qorliq-action-button, .qorliq-auth-card { transition: none !important; }
          .qorliq-action-button:not(:disabled):hover,
          .qorliq-action-button:not(:disabled):active { transform: none; }
        }
      `}</style>

      <LoginHeader />

      {/* ===============================================
          LOGIN SUCCESS POPUP
      =============================================== */}

      <LoginSuccessPopup
        open={showLoginSuccess}
        userName={
          authenticatedSession?.user
            ?.name ||
          session?.user?.name ||
          ""
        }
        onDone={
          handleLoginSuccessDone
        }
        redirecting={
          isRedirecting
        }
      />

      {/* ===============================================
          MAIN CONTENT
      =============================================== */}

      <main
        className="
          min-h-[calc(100dvh-76px)]
          bg-background
          text-text-primary
          lg:min-h-[calc(100dvh-84px)]
        "
      >
        <Notice
          key={
            notice?.id ?? "empty"
          }
          notice={notice}
          onClose={
            dismissNotice
          }
        />

        <div
          className="
            mx-auto
            w-full
            max-w-[1240px]
            px-4 pb-12 pt-5
            sm:px-8
            sm:pb-16 sm:pt-8
            lg:px-12 lg:py-14
          "
        >
          {/* BACK HOME */}

          <Link
            href="/"
            className="
              qorliq-entrance qorliq-entrance-back
              inline-flex h-10
              items-center gap-2
              rounded-xl px-2
              text-[13px]
              font-medium
              text-text-secondary
              transition-colors
              hover:bg-background-soft
              hover:text-text-primary
              focus-visible:outline-2
              focus-visible:outline-accent
            "
          >
            <ArrowLeft size={17} />

            Back to home
          </Link>

          {/* ===========================================
              PAGE GRID
          =========================================== */}

          <div
            className="
              mx-auto mt-5
              grid max-w-[1100px]
              items-center gap-9
              lg:mt-8
              lg:grid-cols-[1fr_minmax(0,490px)]
              lg:gap-16
              xl:gap-24
            "
          >
            {/* =========================================
                LEFT BRAND PANEL
            ========================================= */}

            <div className="qorliq-entrance qorliq-entrance-hero hidden lg:block">
              {/* BADGE */}

              <div
                className="
                  inline-flex
                  items-center gap-2
                  qorliq-hero-badge
                  rounded-full
                  border border-accent/25
                  bg-accent/10
                  px-3.5 py-2
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.13em]
                  text-text-primary
                "
              >
                <Sparkles
                  size={14}
                  className="text-accent"
                />

                Your next opportunity starts here
              </div>

              {/* HEADING */}

              <h1
                className="
                  mt-7
                  max-w-[550px]
                  text-[clamp(2.9rem,4.5vw,4.8rem)]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.065em]
                  text-text-primary
                "
              >
                A better CV.
                <br />

                <span
                  className="
                    font-editorial
                    font-normal italic
                  "
                >
                  A brighter future.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-6
                  max-w-[420px]
                  text-[16px]
                  leading-[1.9]
                  text-text-secondary
                "
              >
                Create a clear, professional CV
                that puts your experience first.
                Pick a layout, refine your
                details, and move forward with
                confidence.
              </p>

              {/* BENEFITS */}

              <div
                className="
                  mt-10
                  grid max-w-[430px]
                  gap-4
                  border-t border-border
                  pt-7
                "
              >
                <div
                  className="
                    flex items-center gap-3
                    text-sm text-text-secondary
                  "
                >
                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl
                      bg-accent/10
                      text-accent
                    "
                  >
                    <FileCheck2 size={18} />
                  </span>

                  Professional, ATS-friendly layouts
                </div>

                <div
                  className="
                    flex items-center gap-3
                    text-sm text-text-secondary
                  "
                >
                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl
                      bg-accent/10
                      text-accent
                    "
                  >
                    <ShieldCheck size={18} />
                  </span>

                  Your account and CVs in one place
                </div>

                <div
                  className="
                    flex items-center gap-3
                    text-sm text-text-secondary
                  "
                >
                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl
                      bg-accent/10
                      text-accent
                    "
                  >
                    <LockKeyhole size={18} />
                  </span>

                  Secure sign-in experience
                </div>
              </div>
            </div>

            {/* =========================================
                AUTH CARD
            ========================================= */}

            <section
              aria-label="Account sign in"
              className="
                qorliq-entrance qorliq-entrance-card qorliq-auth-card
                w-full min-w-0
                rounded-[22px]
                border border-border
                bg-surface
                p-5
                shadow-[0_16px_50px_rgba(10,25,55,0.06)]
                sm:p-8
                lg:p-9
              "
            >
              {/* =======================================
                  LOGO AND HEADING
              ======================================= */}

              <div className="qorliq-entrance qorliq-entrance-card-header mb-6">
                {/* LIGHT LOGO */}

                <Image
                  src="/QORLIQ_cv.svg"
                  width={185}
                  height={56}
                  alt="QORLIQ CV"
                  priority
                  className="
                    h-auto w-[158px]
                    lg:w-[185px]
                    dark:hidden
                  "
                />

                {/* DARK LOGO */}

                <Image
                  src="/QORLIQ_cv_dark.svg"
                  width={185}
                  height={56}
                  alt="QORLIQ CV"
                  priority
                  className="
                    hidden h-auto
                    w-[158px]
                    lg:w-[185px]
                    dark:block
                  "
                />

                {/* HEADING */}

                <h2
                  className="
                    mt-6
                    text-[27px]
                    font-semibold
                    leading-tight
                    tracking-[-0.045em]
                    text-text-primary
                    sm:text-[31px]
                  "
                >
                  {mode === "login"
                    ? "Welcome back"
                    : "Create your account"}
                </h2>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-2
                    text-[13px]
                    leading-relaxed
                    text-text-secondary
                    sm:text-[14px]
                  "
                >
                  {mode === "login"
                    ? "Sign in to continue building your CV."
                    : "Get started with your QORLIQ CV account."}
                </p>
              </div>

              {/* =======================================
                  LOGIN / REGISTER TABS
              ======================================= */}

              <div
                role="tablist"
                aria-label="Account access"
                className="
                  qorliq-entrance qorliq-entrance-tabs
                  grid grid-cols-2 gap-1
                  rounded-xl
                  border border-border
                  bg-background-soft
                  p-1
                "
              >
                {[
                  {
                    value: "login",
                    text: "Sign in",
                  },
                  {
                    value: "register",
                    text: "Create account",
                  },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={
                      mode === tab.value
                    }
                    disabled={busy}
                    onClick={() => {
                      setMode(tab.value);

                      dismissNotice();

                      setShowPassword(false);

                      setShowConfirmPassword(
                        false
                      );
                    }}
                    className={`
                      min-h-10
                      cursor-pointer
                      rounded-lg px-2
                      text-[13px]
                      font-semibold
                      transition-all duration-200
                      focus-visible:outline-2
                      focus-visible:outline-accent
                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      ${
                        mode === tab.value
                          ? "bg-surface text-text-primary shadow-sm ring-1 ring-border"
                          : "text-text-secondary hover:text-text-primary"
                      }
                    `}
                  >
                    {tab.text}
                  </button>
                ))}
              </div>

              {/* =======================================
                  GOOGLE LOGIN
              ======================================= */}

              <button
                type="button"
                onClick={
                  handleGoogleLogin
                }
                disabled={busy}
                className="
                  qorliq-entrance qorliq-entrance-google qorliq-action-button
                  mt-6
                  flex h-12 w-full
                  cursor-pointer
                  items-center justify-center
                  gap-3
                  rounded-xl
                  border border-border-strong
                  bg-surface
                  px-4
                  text-sm
                  font-semibold
                  text-text-primary
                  transition-all
                  hover:border-accent
                  hover:bg-background-soft
                  focus-visible:outline-2
                  focus-visible:outline-accent
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {busyAction === "google" ? (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <GoogleIcon />
                )}

                {busyAction === "google"
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </button>

              {/* =======================================
                  DIVIDER
              ======================================= */}

              <div
                aria-hidden="true"
                className="
                  my-6
                  flex items-center gap-3
                "
              >
                <div
                  className="
                    h-px flex-1 bg-border
                  "
                />

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-text-muted
                  "
                >
                  or continue with email
                </span>

                <div
                  className="
                    h-px flex-1 bg-border
                  "
                />
              </div>

              {/* =======================================
                  FORM
              ======================================= */}

              <form
                onSubmit={
                  mode === "login"
                    ? handleManualLogin
                    : handleRegister
                }
                className="qorliq-entrance qorliq-entrance-form space-y-4"
                noValidate={false}
              >
                {/* FULL NAME */}

                {mode === "register" && (
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="
                        text-[12px]
                        font-semibold
                        text-text-primary
                      "
                    >
                      Full name
                    </label>

                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      required
                      disabled={busy}
                      value={form.name}
                      onChange={(event) =>
                        updateForm(
                          "name",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Your full name"
                    />
                  </div>
                )}

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="
                      text-[12px]
                      font-semibold
                      text-text-primary
                    "
                  >
                    Email address
                  </label>

                  <input
                    id="auth-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    disabled={busy}
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        "email",
                        event.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                    placeholder="you@example.com"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <div
                    className="
                      flex items-center
                      justify-between gap-3
                    "
                  >
                    <label
                      htmlFor="auth-password"
                      className="
                        text-[12px]
                        font-semibold
                        text-text-primary
                      "
                    >
                      Password
                    </label>

                    {mode === "login" && (
                      <a
                        href="#forgot-password"
                        onClick={(event) => {
                          event.preventDefault();

                          notify(
                            "Password reset will be available soon.",
                            "success"
                          );
                        }}
                        className="
                          text-[12px]
                          font-semibold
                          text-text-primary
                          underline
                          decoration-accent/60
                          underline-offset-4
                          transition-colors
                          hover:text-accent
                          focus-visible:outline-2
                          focus-visible:outline-accent
                        "
                      >
                        Forgot Password?
                      </a>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="auth-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete={
                        mode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      required
                      disabled={busy}
                      value={
                        form.password
                      }
                      onChange={(event) =>
                        updateForm(
                          "password",
                          event.target.value
                        )
                      }
                      className={`
                        ${inputClass}
                        pr-12
                      `}
                      placeholder="Enter your password"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={
                        showPassword
                      }
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="
                        absolute
                        right-2 top-[16px]
                        flex h-10 w-10
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-lg
                        text-text-secondary
                        transition-colors
                        hover:text-text-primary
                        focus-visible:outline-2
                        focus-visible:outline-accent
                      "
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}

                {mode === "register" && (
                  <div>
                    <label
                      htmlFor="auth-confirm"
                      className="
                        text-[12px]
                        font-semibold
                        text-text-primary
                      "
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        id="auth-confirm"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        required
                        disabled={busy}
                        value={
                          form.confirmPassword
                        }
                        onChange={(event) =>
                          updateForm(
                            "confirmPassword",
                            event.target.value
                          )
                        }
                        className={`
                          ${inputClass}
                          pr-12
                        `}
                        placeholder="Confirm your password"
                      />

                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirmation password"
                            : "Show confirmation password"
                        }
                        aria-pressed={
                          showConfirmPassword
                        }
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        className="
                          absolute
                          right-2 top-[16px]
                          flex h-10 w-10
                          cursor-pointer
                          items-center
                          justify-center
                          rounded-lg
                          text-text-secondary
                          transition-colors
                          hover:text-text-primary
                          focus-visible:outline-2
                          focus-visible:outline-accent
                        "
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* =====================================
                    SUBMIT BUTTON
                ===================================== */}

                <button
                  type="submit"
                  disabled={busy}
                  className="
                    qorliq-action-button
                    group mt-1
                    flex h-12 w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#07183F]
                    px-4
                    text-[13px]
                    font-semibold
                    text-white
                    transition-all
                    hover:bg-[#102B66]
                    hover:text-white
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-65

                    dark:bg-accent
                    dark:text-[#07183F]
                    dark:hover:opacity-90
                  "
                >
                  {busyAction === "login" ||
                  busyAction === "register" ||
                  redirecting ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : null}

                  <span>
                    {redirecting
                      ? "Redirecting..."
                      : busyAction === "login" ||
                          busyAction === "register"
                        ? "Please wait..."
                        : mode === "login"
                          ? "Sign in"
                          : "Create account"}
                  </span>

                  {!busy && (
                    <ArrowRight
                      size={16}
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  )}
                </button>
              </form>

              {/* =======================================
                  TERMS
              ======================================= */}

              <p
                className="
                  mt-6
                  text-center
                  text-[11px]
                  leading-relaxed
                  text-text-muted
                "
              >
                By continuing, you agree
                to use QORLIQ CV responsibly.
              </p>
            </section>
          </div>
        </div>
      </main>

      <CVBuilderFooter />
    </>
  );
}