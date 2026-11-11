"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const ACCESS_API = "/api/user/access";
const BILLING_API = "/api/user/billing";
const CANCEL_API = "/api/user/cancel-subscription";

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    edit: (
      <>
        <path d="m16 3 5 5-12 12H4v-5L16 3Z" />
        <path d="m13 6 5 5" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    warning: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

function StatusBadge({ status }) {
  const value = String(status || "inactive").toLowerCase();
  const active = ["active", "paid", "trialing"].includes(value);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {value.replaceAll("_", " ")}
    </span>
  );
}

function normalizeBilling(data) {
  const user = data.user || data;
  const billing = data.billing || {};
  const source = user.billingDetails || {};
  const existing = billing.details || {};

  if (!user.id && !user._id && !data.billing) {
    throw new Error("User details are missing from the response.");
  }

  const plan = String(user.plan || user.planType || "").toLowerCase();

  const isOneTime = [
    user.plan,
    user.planType,
    user.accessType,
  ].some((value) =>
    ["one-time", "one_time", "onetime"].includes(
      String(value || "").toLowerCase()
    )
  );

  const isFree =
    plan === "free" ||
    (!plan && !billing.planName && !user.hasActiveSubscription);

  const planLabels = {
    free: "Free",
    "one-time": "One-Time",
    one_time: "One-Time",
    onetime: "One-Time",
    "3-months": "3 Months",
    "6-months": "6 Months",
    annual: "Annual",
  };

  const endDate = isFree
    ? null
    : billing.endDate ||
      user.accessExpiresAt ||
      user.subscriptionEndDate ||
      user.expiresAt ||
      null;

  const endTime = endDate ? new Date(endDate).getTime() : NaN;
  const expired =
    user.isExpired === true ||
    (Number.isFinite(endTime) && endTime <= Date.now());

  const status = isFree
    ? "inactive"
    : expired
      ? "expired"
      : billing.status ||
        (isOneTime
          ? user.oneTimeAccessStatus ||
            (data.hasAccess || user.hasAccess ? "active" : "inactive")
          : user.subscriptionStatus || "inactive");

  const fullName = [
    String(source.firstName || "").trim(),
    String(source.lastName || "").trim(),
  ]
    .filter(Boolean)
    .join(" ");

  // Keep the stored country code separate from its display name.
  const countryValue = String(
    source.country ?? existing.country ?? ""
  ).trim();

  const countryCode = /^[a-z]{2}$/i.test(countryValue)
    ? countryValue.toUpperCase()
    : "";

  const details = {
    firstName: source.firstName || "",
    lastName: source.lastName || "",
    name: fullName || existing.name || user.name || "",
    email: source.email ?? existing.email ?? user.email ?? "",
    phone:
      source.phone ||
      [source.mobileCountryCode, source.mobileNumber]
        .filter(Boolean)
        .join(" ") ||
      existing.phone ||
      "",
    line1: source.addressLine1 ?? existing.line1 ?? "",
    line2: source.addressLine2 ?? existing.line2 ?? "",
    city: source.city ?? existing.city ?? "",
    postalCode:
      source.postalCode ?? existing.postal_code ?? "",
    country: countryCode,
    countryName:
      source.countryName ||
      (countryCode ? "" : countryValue),
  };

  const finalStatus = String(status).toLowerCase();

  const canCancel =
    !isOneTime &&
    !isFree &&
    !["canceled", "cancelled", "incomplete_expired"].includes(
      finalStatus
    ) &&
    Boolean(
      user.stripeSubscriptionId ||
        user.hasActiveSubscription ||
        ["active", "trialing", "past_due", "unpaid", "paused"].includes(
          finalStatus
        )
    );

  return {
    planName: isFree
      ? "Free"
      : billing.planName ||
        user.planName ||
        planLabels[plan] ||
        user.plan ||
        "No plan",
    status: finalStatus,
    isOneTime,
    isFree,
    canCancel,
    cycle: isFree
      ? "No paid subscription"
      : isOneTime
        ? "One-time payment"
        : billing.cycle || user.billingCycle || "Subscription",
    endDate,
    paymentStatus:
      user.lastPaymentStatus ||
      user.paymentStatus ||
      billing.paymentStatus ||
      "Not available",
    cancelAtPeriodEnd: Boolean(
      billing.cancelAtPeriodEnd ?? user.cancelAtPeriodEnd
    ),
    cancellationDate: billing.cancellationDate || null,
    details,
    history: Array.isArray(billing.invoices) ? billing.invoices : [],
    historyAvailable: Array.isArray(billing.invoices),
  };
}

async function readResponse(response, fallback) {
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || fallback);
  }

  return data;
}

function Modal({
  title,
  description,
  icon,
  busy,
  onClose,
  children,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);

  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const selector =
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';

    (dialog?.querySelector(selector) || dialog)?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (!busyRef.current) closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        dialog?.querySelectorAll(selector) || []
      );

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (!first) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (
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
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-dialog-title"
        aria-describedby="billing-dialog-description"
        aria-busy={busy}
        tabIndex={-1}
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-[#111111] shadow-2xl outline-none"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/[0.06] bg-[#F7F2E8]/60 p-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C6A35D]/15 text-[#8A6A35]">
              <Icon name={icon} />
            </div>

            <div>
              <h2
                id="billing-dialog-title"
                className="text-lg font-bold"
              >
                {title}
              </h2>

              <p
                id="billing-dialog-description"
                className="mt-1 text-xs leading-5 text-black/55"
              >
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-black/50 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A35D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="close" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

const fields = [
  {
    key: "firstName",
    label: "First name",
    type: "text",
    autoComplete: "given-name",
    maxLength: 100,
  },
  {
    key: "lastName",
    label: "Last name",
    type: "text",
    autoComplete: "family-name",
    maxLength: 150,
  },
  {
    key: "email",
    label: "Billing email",
    type: "email",
    autoComplete: "email",
    maxLength: 254,
  },
  {
    key: "phone",
    label: "Phone number",
    type: "tel",
    autoComplete: "tel",
    maxLength: 50,
  },
  {
    key: "country",
    label: "Country code",
    type: "text",
    autoComplete: "country",
    maxLength: 2,
    placeholder: "GB, PK or SA",
    pattern: "[A-Za-z]{2}",
  },
  {
    key: "countryName",
    label: "Country name",
    type: "text",
    autoComplete: "country-name",
    maxLength: 100,
    placeholder: "United Kingdom",
  },
  {
    key: "line1",
    label: "Address line 1",
    type: "text",
    autoComplete: "address-line1",
    maxLength: 254,
    wide: true,
  },
  {
    key: "line2",
    label: "Address line 2",
    type: "text",
    autoComplete: "address-line2",
    maxLength: 254,
    wide: true,
  },
  {
    key: "city",
    label: "City",
    type: "text",
    autoComplete: "address-level2",
    maxLength: 100,
  },
  {
    key: "postalCode",
    label: "Postal code",
    type: "text",
    autoComplete: "postal-code",
    maxLength: 30,
  },
];

export default function BillingPage() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [online, setOnline] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [draftDetails, setDraftDetails] = useState({});
  const [modalNotice, setModalNotice] = useState("");
  const [cancelNotice, setCancelNotice] = useState("");

  const [savingBilling, setSavingBilling] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] =
    useState(false);

  const mutationRef = useRef(false);
  const loadControllerRef = useRef(null);
  const loadVersionRef = useRef(0);

  const busy = savingBilling || cancellingSubscription;

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#111111] transition hover:border-[#C6A35D] hover:bg-[#FFF9EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A35D] disabled:cursor-not-allowed disabled:opacity-50";

  const inputClass =
    "w-full min-w-0 rounded-xl border border-black/10 bg-[#FCFBF8] px-4 py-3 text-sm text-[#111111] outline-none transition placeholder:text-black/35 focus:border-[#C6A35D] focus:bg-white focus:ring-4 focus:ring-[#C6A35D]/10 disabled:opacity-60";

  const loadBilling = useCallback(async ({ quiet = false } = {}) => {
    loadControllerRef.current?.abort();

    const controller = new AbortController();
    loadControllerRef.current = controller;

    const version = ++loadVersionRef.current;
    setLoading(true);

    try {
      const response = await fetch(ACCESS_API, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      const data = await readResponse(
        response,
        "Unable to load billing information."
      );

      if (data.loggedIn === false) {
        throw new Error("Please sign in to view billing information.");
      }

      if (version === loadVersionRef.current) {
        setBilling(normalizeBilling(data));
      }

      return true;
    } catch (error) {
      if (error.name !== "AbortError" && !quiet) {
        setNotice({
          type: "error",
          text: error.message || "Unable to load billing information.",
        });
      }

      return false;
    } finally {
      if (version === loadVersionRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    loadBilling();

    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      loadControllerRef.current?.abort();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadBilling]);

  function stopPendingLoad() {
    loadControllerRef.current?.abort();
    loadVersionRef.current += 1;
    setLoading(false);
  }

  function openEditModal() {
    if (!billing || busy) return;

    const details = billing.details;

    // Only use the display name as a fallback when billing names
    // are absent from the API response.
    const fallbackParts = details.name.trim().split(/\s+/);

    setDraftDetails({
      ...details,
      firstName:
        details.firstName ||
        (!details.lastName ? fallbackParts.shift() || "" : ""),
      lastName:
        details.lastName ||
        (!details.firstName ? fallbackParts.join(" ") : ""),
    });

    setModalNotice("");
    setShowEditModal(true);
  }

  async function handleSaveBilling(event) {
    event.preventDefault();

    if (mutationRef.current) return;

    if (!navigator.onLine) {
      setModalNotice("You are offline. Reconnect and try again.");
      return;
    }

    mutationRef.current = true;
    stopPendingLoad();
    setSavingBilling(true);
    setModalNotice("");

    const submitted = { ...draftDetails };

    try {
      const response = await fetch(BILLING_API, {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          billingDetails: {
            firstName: submitted.firstName || "",
            lastName: submitted.lastName || "",
            email: submitted.email || "",
            phone: submitted.phone || "",
            country: (submitted.country || "").toUpperCase(),
            countryName: submitted.countryName || "",
            addressLine1: submitted.line1 || "",
            addressLine2: submitted.line2 || "",
            city: submitted.city || "",
            postalCode: submitted.postalCode || "",
          },
        }),
      });

      const data = await readResponse(
        response,
        "Unable to update billing details."
      );

      const saved = data.billingDetails || {};

      // Show the saved result immediately, without waiting for
      // another access API request.
      setBilling((previous) =>
        previous
          ? {
              ...previous,
              details: {
                ...previous.details,
                firstName: saved.firstName ?? submitted.firstName,
                lastName: saved.lastName ?? submitted.lastName,
                name: [
                  saved.firstName ?? submitted.firstName,
                  saved.lastName ?? submitted.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),
                email: saved.email ?? submitted.email,
                phone: saved.phone ?? submitted.phone,
                country: saved.country ?? submitted.country,
                countryName:
                  saved.countryName ?? submitted.countryName,
                line1: saved.addressLine1 ?? submitted.line1,
                line2: saved.addressLine2 ?? submitted.line2,
                city: saved.city ?? submitted.city,
                postalCode: saved.postalCode ?? submitted.postalCode,
              },
            }
          : previous
      );

      setShowEditModal(false);
      setNotice({
        type: "success",
        text: data.message || "Billing details updated successfully.",
      });
    } catch (error) {
      setModalNotice(
        error.message || "Unable to save billing details. Please retry."
      );
    } finally {
      mutationRef.current = false;
      setSavingBilling(false);
    }
  }

  async function handleCancelSubscription() {
if (mutationRef.current) return;

    if (!navigator.onLine) {
      setCancelNotice("You are offline. Reconnect and try again.");
      return;
    }

    mutationRef.current = true;
    stopPendingLoad();
    setCancellingSubscription(true);
    setCancelNotice("");

    try {
      const response = await fetch(CANCEL_API, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      const data = await readResponse(
        response,
        "Unable to cancel your subscription."
      );

      setBilling((previous) =>
        previous
          ? {
              ...previous,
              planName: "Free",
              status: "inactive",
              isFree: true,
              isOneTime: false,
              canCancel: false,
              cycle: "No paid subscription",
              endDate: null,
              paymentStatus: "Not available",
              cancelAtPeriodEnd: false,
              cancellationDate: null,
            }
          : previous
      );

      setShowCancelModal(false);
      setNotice({
        type: "success",
        text:
          data.message ||
          "Subscription cancelled. Your account is now on the free plan.",
      });
    } catch (error) {
      setCancelNotice(
        error.message ||
          "Unable to cancel your subscription. Please retry."
      );
    } finally {
      mutationRef.current = false;
      setCancellingSubscription(false);
    }
  }

  return (
    <>
      <main className="min-w-0 space-y-6 text-[#111111]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A35]">
              Your account
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Subscription & Billing
            </h1>

            <p className="mt-2 text-sm leading-6 text-black/55">
              Manage your plan, billing details and payment activity.
            </p>
          </div>

          <button
            type="button"
            className={buttonClass}
            disabled={loading || busy || !online}
            onClick={() => {
              setNotice(null);
              loadBilling();
            }}
          >
            <Icon
              name="refresh"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {!online && (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
          >
            You are offline. Reconnect to save changes or cancel your
            subscription.
          </div>
        )}

        {notice && (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : notice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-[#C6A35D]/30 bg-[#FFF9EF] text-[#8A6A35]"
            }`}
          >
            <p>{notice.text}</p>

            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-1 hover:bg-black/5"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading && !billing ? (
          <div role="status" className="animate-pulse space-y-5">
            <span className="sr-only">Loading billing information</span>
            <div className="h-56 rounded-3xl bg-black/10" />

            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-black/5"
                />
              ))}
            </div>

            <div className="h-48 rounded-2xl bg-black/5" />
          </div>
        ) : !billing ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-sm text-black/60">
              Billing information could not be loaded. Click Refresh to
              retry.
            </p>
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-[#111111] p-6 text-white sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[45px] border-[#C6A35D]/10"
              />

              <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9BD88]">
                      Current plan
                    </p>
                    <StatusBadge status={billing.status} />
                  </div>

                  <h2 className="mt-4 break-words text-2xl font-semibold sm:text-3xl">
                    CV Builder
                    <span className="ml-2 font-normal text-white/60">
                      / {billing.planName}
                    </span>
                  </h2>

                  <p className="mt-3 text-sm text-white/65">
                    {billing.cycle}
                    {billing.isOneTime && " — no automatic renewal"}
                  </p>

                  <p className="mt-4 text-xs leading-6 text-white/65">
                    {billing.isFree
                      ? "Choose a plan to activate paid CV Builder access."
                      : billing.cancelAtPeriodEnd
                        ? `Cancellation scheduled for ${formatDate(
                            billing.cancellationDate || billing.endDate
                          )}`
                        : `Access / current period ends: ${formatDate(
                            billing.endDate
                          )}`}
                  </p>
                </div>

                <Link
                  href="/pricing"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C6A35D] px-5 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#D6B77A]"
                >
                  View plans
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <div className="grid min-w-0 gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Billing cycle",
                  value: billing.cycle,
                  icon: "receipt",
                },
                {
                  label: "Access / period end",
                  value: formatDate(billing.endDate),
                  icon: "calendar",
                },
                {
                  label: "Last payment status",
                  value: billing.paymentStatus,
                  icon: "receipt",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-2xl border border-black/[0.06] bg-white p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-black/50">{item.label}</p>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F2E8] text-[#8A6A35]">
                      <Icon name={item.icon} className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="mt-3 break-words text-base font-bold capitalize">
                    {String(item.value).replaceAll("_", " ")}
                  </p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">Billing details</h2>
                  <p className="mt-1 text-xs leading-5 text-black/50">
                    Your billing contact and address.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy || loading || !online}
                  onClick={openEditModal}
                  className={buttonClass}
                >
                  <Icon name="edit" className="h-4 w-4" />
                  Edit details
                </button>
              </div>

              <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
                {[
                  ["Full name", billing.details.name],
                  ["Billing email", billing.details.email],
                  ["Phone number", billing.details.phone],
                  [
                    "Billing address",
                    [
                      billing.details.line1,
                      billing.details.line2,
                      billing.details.city,
                      billing.details.postalCode,
                      billing.details.countryName ||
                        billing.details.country,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-black/50">{label}</dt>
                    <dd className="mt-2 break-words font-medium leading-6">
                      {value || "Not provided"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
              <div className="border-b border-black/5 p-5 sm:p-6">
                <h2 className="text-base font-bold">Billing history</h2>
                <p className="mt-1 text-xs leading-5 text-black/50">
                  Billing records available for your account.
                </p>
              </div>

              {billing.history.length ? (
                <div className="divide-y divide-black/5">
                  {billing.history.map((record, index) => (
                    <div
                      key={record.id || record._id || index}
                      className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold">
                          {record.description || "Billing record"}
                        </p>
                        <p className="mt-1 text-xs text-black/50">
                          {formatDate(record.date)}
                        </p>

                        {record.number && (
                          <p className="mt-1 text-xs text-black/50">
                            {record.number}
                          </p>
                        )}
                      </div>

                      <div>
                        <StatusBadge status={record.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 sm:p-6">
                  <p className="text-sm text-black/55">
                    {billing.historyAvailable
                      ? "No billing records found."
                      : "Detailed billing history is not available yet."}
                  </p>
                </div>
              )}
            </section>

            <section className="flex flex-col justify-between gap-4 rounded-2xl border border-black/[0.06] bg-[#F7F2E8]/60 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-sm font-bold">
                  Manage your subscription
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-6 text-black/55">
                  {billing.isOneTime
                    ? "Your one-time plan does not renew automatically."
                    : billing.isFree
                      ? "You do not have an active paid subscription."
                      : billing.canCancel
                        ? "Cancellation ends your paid access immediately and returns your account to the free plan."
                        : "There is no subscription available to cancel."}
                </p>
              </div>
<button
  type="button"
  disabled={busy || loading || !online}
  onClick={() => {
    setCancelNotice("");
    setShowCancelModal(true);
  }}
  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
>
  Cancel subscription
</button>
            </section>
          </>
        )}
      </main>

      {showEditModal && (
        <Modal
          title="Edit billing details"
          description="Update your billing contact and address."
          icon="user"
          busy={savingBilling}
          onClose={() => setShowEditModal(false)}
        >
          <form
            onSubmit={handleSaveBilling}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className={
                      field.wide
                        ? "min-w-0 sm:col-span-2"
                        : "min-w-0"
                    }
                  >
                    <label
                      htmlFor={`billing-${field.key}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      {field.label}
                    </label>

                    <input
                      id={`billing-${field.key}`}
                      name={field.key}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      maxLength={field.maxLength}
                      pattern={field.pattern}
                      title={
                        field.key === "country"
                          ? "Enter a two-letter country code, such as GB, PK or SA."
                          : undefined
                      }
                      value={draftDetails[field.key] || ""}
                      disabled={savingBilling}
                      placeholder={
                        field.placeholder ||
                        `Enter ${field.label.toLowerCase()}`
                      }
                      onChange={(event) => {
                        const value =
                          field.key === "country"
                            ? event.target.value.toUpperCase()
                            : event.target.value;

                        setModalNotice("");
                        setDraftDetails((previous) => ({
                          ...previous,
                          [field.key]: value,
                        }));
                      }}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs leading-5 text-black/50">
                Billing email is separate from your login email.
              </p>

              {modalNotice && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {modalNotice}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-black/[0.06] bg-white p-5 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                disabled={savingBilling}
                onClick={() => setShowEditModal(false)}
                className={buttonClass}
              >
                Close
              </button>

              <button
                type="submit"
                disabled={savingBilling || !online}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C6A35D] px-6 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#B89450] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6A35] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingBilling && <Spinner />}
                {savingBilling ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showCancelModal && (
        <Modal
          title="Cancel subscription?"
          description="Please review what happens when you cancel."
          icon="warning"
          busy={cancellingSubscription}
          onClose={() => setShowCancelModal(false)}
        >
          <div className="min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6">
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Your paid CV Builder access will end immediately.
              </p>
              <p className="mt-2 text-sm leading-6 text-red-700">
                Your account will return to the free plan. This action
                does not issue a refund.
              </p>
            </div>

            <p className="text-sm leading-6 text-black/60">
              Your saved CVs, billing details and order history will
              remain in your account.
            </p>

            {cancelNotice && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {cancelNotice}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-black/[0.06] p-5 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              disabled={cancellingSubscription}
              onClick={() => setShowCancelModal(false)}
              className={buttonClass}
            >
              Keep subscription
            </button>

            <button
              type="button"
              disabled={cancellingSubscription || !online}
              onClick={handleCancelSubscription}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancellingSubscription && <Spinner />}
              {cancellingSubscription
                ? "Cancelling..."
                : "Yes, cancel subscription"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}