"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";

export default function AccountSettingsPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState(null);

  const submittingRef = useRef(false);

  const inputClass =
    "w-full min-w-0 rounded-xl border border-black/10 bg-[#FCFBF8] px-4 py-3.5 text-sm text-[#111111] outline-none transition placeholder:text-black/35 focus:border-[#C6A35D] focus:bg-white focus:ring-4 focus:ring-[#C6A35D]/10 disabled:cursor-not-allowed disabled:opacity-60";

  function showError(text) {
    setMessage({ type: "error", text });
  }

  async function handleLogout() {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoggingOut(true);
    setMessage(null);

    try {
      await signOut({ redirect: false });
      window.location.assign("/login");
    } catch {
      showError("Unable to log out. Check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setLoggingOut(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submittingRef.current || saved) return;

    setMessage(null);

    if (!email.trim() && !password) {
      showError("Enter an email or new password to update.");
      return;
    }

    if (!currentPassword) {
      showError("Enter your current password.");
      return;
    }

    if (password && password.length < 8) {
      showError("Your new password must contain at least 8 characters.");
      return;
    }

    if (
      password &&
      new TextEncoder().encode(password).length > 72
    ) {
      showError("Your new password must not exceed 72 bytes.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    if (!navigator.onLine) {
      showError("You are offline. Connect to the internet and try again.");
      return;
    }

    submittingRef.current = true;
    setSaving(true);

    try {
      const response = await fetch("/api/user/access", {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          currentPassword,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        showError(
          data?.message ||
            (response.status === 401
              ? "Your session has expired. Please sign in again."
              : "Unable to update your account. Please try again.")
        );
        return;
      }

      setSaved(true);
      setEmail("");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);

      setMessage({
        type: "success",
        text: "Your account has been updated. Redirecting to sign in...",
      });

      try {
        await signOut({ redirect: false });
        window.location.assign("/login");
      } catch {
        setMessage({
          type: "success",
          text: "Your account has been updated. Please use the Log out button and sign in again.",
        });
      }
    } catch {
      showError(
        "Unable to confirm the update. Check your connection before trying again."
      );
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="w-full min-w-0 max-w-2xl space-y-5 text-[#111111]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Account Settings
        </h1>

        <p className="mt-1.5 text-sm leading-6 text-black/55">
          Manage your email address and password.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#F7F2E8]/60 px-5 py-5 sm:px-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C6A35D]/15 text-[#8A6A35]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold">
              Account details
            </h2>

            <p className="mt-1 text-xs leading-5 text-black/55">
              Confirm your current password to save changes.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={saving}
          className="space-y-5 p-5 sm:p-7"
        >
          <fieldset
            disabled={saving || loggingOut || saved}
            className="min-w-0 space-y-5"
          >
            <legend className="sr-only">
              Update your login details
            </legend>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                New email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Enter your new email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                aria-describedby="email-help"
                className={inputClass}
              />

              <p
                id="email-help"
                className="mt-2 text-xs leading-5 text-black/55"
              >
                Leave blank to keep your existing email address.
              </p>
            </div>

            <div className="border-t border-black/[0.06] pt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Password settings
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-pressed={showPassword}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-[#8A6A35] transition hover:bg-[#F7F2E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A35D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showPassword ? "Hide passwords" : "Show passwords"}
                </button>
              </div>

              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Current password
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <input
                  id="current-password"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  required
                  aria-describedby="current-password-help"
                  className={inputClass}
                />

                <p
                  id="current-password-help"
                  className="mt-2 text-xs leading-5 text-black/55"
                >
                  Required when changing your email or password.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    New password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    minLength={8}
                    required={Boolean(confirmPassword)}
                    aria-describedby="password-help"
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    minLength={8}
                    required={Boolean(password)}
                    aria-describedby="password-help"
                    className={inputClass}
                  />
                </div>
              </div>

              <p
                id="password-help"
                className="mt-3 text-xs leading-5 text-black/55"
              >
                Leave both new password fields blank to keep your
                existing password.
              </p>
            </div>
          </fieldset>

          {message && (
            <div
              role={message.type === "error" ? "alert" : "status"}
              className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-black/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-black/55">
              You will need to sign in again after saving.
            </p>

            <button
              type="submit"
              disabled={saving || loggingOut || saved}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C6A35D] px-6 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#B89450] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6A35] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : saved ? (
                "Changes saved"
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-col justify-between gap-4 border-t border-black/[0.06] bg-[#FCFBF8] p-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <h3 className="text-sm font-semibold">Log out</h3>

            <p className="mt-1 text-xs leading-5 text-black/55">
              Sign out of your account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={saving || loggingOut}
            aria-busy={loggingOut}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#8A6A35] transition hover:bg-[#F7F2E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A35D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? (
              <Spinner />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5M21 12H9" />
              </svg>
            )}

            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}