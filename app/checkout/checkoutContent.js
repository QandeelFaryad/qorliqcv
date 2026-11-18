"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2,
  CreditCard, LoaderCircle, LockKeyhole, ShieldCheck, X,
} from "lucide-react";
import { pricingPlans } from "@/lib/pricingPlans";
import PricingHeader from "@/components/pricing/PricingHeader";
import CVBuilderFooter from "@/components/CVBuilderFooter";

// Create the Stripe.js promise only once, outside of React render.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
// Stable Stripe options avoid payment element reconfiguration during billing edits.
const PAYMENT_ELEMENT_OPTIONS = {
  layout: { type: "tabs", defaultCollapsed: false },
};

const COUNTRY_OPTIONS = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31" },
];

const INITIAL_BILLING = {
  firstName: "", lastName: "", email: "",
  mobileCountryCode: "+44", mobileCountryFlag: "🇬🇧", mobileNumber: "",
  country: "GB", countryName: "United Kingdom", countryFlag: "🇬🇧",
  postalCode: "", addressLine1: "", addressLine2: "", city: "",
};

const REQUIRED_BILLING_KEYS = [
  "firstName", "lastName", "email", "mobileNumber", "country",
  "postalCode", "addressLine1", "city",
];

function hasCompleteBilling(form) {
  return REQUIRED_BILLING_KEYS.every((key) => String(form[key] || "").trim());
}

function getPlanAmountPence(plan) {
  if (!plan) return 0;
  if (typeof plan.amount === "number") return Math.round(plan.amount);
  if (typeof plan.amountPence === "number") return Math.round(plan.amountPence);
  if (typeof plan.priceInPence === "number") return Math.round(plan.priceInPence);
  const amount = Number(String(plan.price || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function paymentSuccessUrl({ cvId, template, planId, intentId }) {
  const params = new URLSearchParams();
  if (cvId) params.set("cvId", cvId);
  if (template) params.set("template", template);
  if (planId) params.set("plan", planId);
  if (intentId) params.set("payment_intent", intentId);
  return `/cv-builder/success?${params.toString()}`;
}

function InlineSpinner({ className = "" }) {
  return <LoaderCircle size={18} className={`animate-spin ${className}`} aria-hidden="true" />;
}

function TopNotification({ notice, onDismiss }) {
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(onDismiss, 5800);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);
  if (!notice) return null;
  const isSuccess = notice.tone === "success";
  return (
    <div className="pointer-events-none fixed inset-x-3 top-4 z-[200] flex justify-center sm:top-6" role="status" aria-live="polite">
      <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }} className={`pointer-events-auto flex w-full max-w-[480px] items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_20px_55px_rgba(15,23,42,0.18)] ${isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
        {isSuccess ? <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-emerald-600" /> : <AlertCircle size={21} className="mt-0.5 shrink-0 text-red-600" />}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold">{isSuccess ? "Notice" : "Something went wrong"}</p>
          <p className="mt-0.5 text-[13px] leading-relaxed">{notice.message}</p>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg hover:bg-black/5"><X size={16} /></button>
      </motion.div>
    </div>
  );
}

function PaymentSuccessDialog({ onContinue }) {
  const reduceMotion = useReducedMotion();
  // The dialog is only mounted after verified payment, so this responsive
  // initial state does not cause an SSR hydration mismatch.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches
  );
  const continueRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    continueRef.current?.focus();
    return () => {
      media.removeEventListener("change", update);
      document.body.style.overflow = oldOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[210] flex items-end justify-center overflow-hidden sm:items-center sm:px-4 sm:py-8 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-success-title"
      aria-describedby="payment-success-description"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[#07183F]/60 backdrop-blur-[3px]"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      />

      <motion.div
        initial={
          reduceMotion
            ? { opacity: 1, y: 0, scale: 1 }
            : isMobile
              ? { opacity: 1, y: "100%", scale: 1 }
              : { opacity: 0, y: 14, scale: 0.94 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : isMobile
              ? { type: "spring", stiffness: 270, damping: 30, mass: 0.95 }
              : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative z-10 w-full max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[28px] border border-b-0 border-border bg-surface px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5 text-center shadow-[0_-14px_65px_rgba(7,24,63,0.22)] sm:max-w-[440px] sm:rounded-[26px] sm:border sm:px-9 sm:py-10 sm:shadow-[0_24px_75px_rgba(7,24,63,0.28)]"
      >
        <div aria-hidden="true" className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border-strong sm:hidden" />
        <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-emerald-50 ring-[9px] ring-emerald-500/10 dark:bg-emerald-500/10">
          <CheckCircle2 size={39} strokeWidth={1.7} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 id="payment-success-title" className="mt-7 text-[27px] font-bold tracking-[-0.045em] text-text-primary">
          Payment Successful!
        </h2>
        <p id="payment-success-description" className="mt-3 text-[14px] leading-7 text-text-secondary">
          Your purchase is complete. You're all set to create your professional CV.
        </p>
        <button
          ref={continueRef}
          type="button"
          onClick={onContinue}
          className="mt-8 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07183F] px-5 text-sm font-semibold text-white transition-colors  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-accent dark:text-[#07183F]"
        >
          Continue <ArrowRight size={17} />
        </button>
        <p className="mt-4 text-[11px] text-text-muted">
          Payment verified. Your CV access has been confirmed.
        </p>
      </motion.div>
    </div>
  );
}

function BillingInput({ label, value, onChange, type = "text", placeholder = "", required = false, autoComplete }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12px] font-semibold text-text-primary">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} autoComplete={autoComplete}
        className="h-11 w-full min-w-0 rounded-xl border border-border-strong bg-background px-3.5 text-[14px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/15" />
    </label>
  );
}

function BillingFields({ form, updateField, updateCountry }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <BillingInput label="First name" value={form.firstName} onChange={(value) => updateField("firstName", value)} required autoComplete="given-name" />
      <BillingInput label="Last name" value={form.lastName} onChange={(value) => updateField("lastName", value)} required autoComplete="family-name" />
      <div className="sm:col-span-2"><BillingInput label="Email address" value={form.email} onChange={(value) => updateField("email", value)} type="email" required autoComplete="email" placeholder="you@example.com" /></div>
      <label className="block min-w-0">
        <span className="mb-1.5 block text-[12px] font-semibold text-text-primary">Mobile number<span className="ml-0.5 text-red-500">*</span></span>
        <div className="flex h-11 min-w-0 overflow-hidden rounded-xl border border-border-strong bg-background focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
          <span className="flex shrink-0 items-center gap-1.5 border-r border-border px-3 text-[13px] text-text-secondary">{form.mobileCountryFlag} {form.mobileCountryCode}</span>
          <input type="tel" value={form.mobileNumber} onChange={(e) => updateField("mobileNumber", e.target.value.replace(/[^\d\s-]/g, ""))} required autoComplete="tel-national" placeholder="Mobile number" className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-text-primary outline-none placeholder:text-text-muted" />
        </div>
      </label>
      <label className="block min-w-0">
        <span className="mb-1.5 block text-[12px] font-semibold text-text-primary">Country<span className="ml-0.5 text-red-500">*</span></span>
        <select value={form.country} onChange={(e) => updateCountry(e.target.value)} className="h-11 w-full min-w-0 rounded-xl border border-border-strong bg-background px-3 text-[14px] text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" required>
          {COUNTRY_OPTIONS.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}
        </select>
      </label>
      <BillingInput label="Postal code" value={form.postalCode} onChange={(value) => updateField("postalCode", value)} autoComplete="postal-code" required />
      <BillingInput label="City / town" value={form.city} onChange={(value) => updateField("city", value)} autoComplete="address-level2" required />
      <div className="sm:col-span-2"><BillingInput label="Address line 1" value={form.addressLine1} onChange={(value) => updateField("addressLine1", value)} autoComplete="address-line1" required placeholder="Street address" /></div>
      <div className="sm:col-span-2"><BillingInput label="Address line 2 (optional)" value={form.addressLine2} onChange={(value) => updateField("addressLine2", value)} autoComplete="address-line2" /></div>
    </div>
  );
}

function OrderSummary({ plan, isSubscription }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.aside initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.48, delay: reduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }} className="rounded-[22px] border border-border bg-surface p-5 shadow-[0_6px_28px_rgba(7,24,63,0.04)] sm:p-6 lg:sticky lg:top-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">Order summary</p>
      <h2 className="mt-3 text-[22px] font-bold tracking-[-0.035em] text-text-primary">{plan.name}</h2>
      <p className="mt-1 text-[13px] leading-6 text-text-secondary">{plan.smallText || (isSubscription ? "Recurring subscription" : "One-time payment")}</p>
      <div className="mt-5 flex items-end justify-between border-y border-border py-5">
        <span className="text-[13px] font-semibold text-text-secondary">Total</span>
        <strong className="text-[31px] font-bold tracking-[-0.06em] text-text-primary">{plan.price}</strong>
      </div>
      <p className="mt-4 text-[12px] font-semibold text-text-primary">{isSubscription ? "Subscription plan" : "One-time access"}</p>
      <div className="mt-4 space-y-3">
        {(plan.features || []).map((feature) => (
          <div key={feature} className="flex items-start gap-2.5 text-[12px] leading-5 text-text-secondary">
            <Check size={15} strokeWidth={2.3} className="mt-0.5 shrink-0 text-emerald-600" /><span>{feature}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-xl bg-background-soft px-3 py-3 text-[12px] text-text-secondary"><ShieldCheck size={17} className="shrink-0 text-accent" /> Secure checkout powered by Stripe</div>
      <Link href="/pricing" className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-text-secondary hover:text-text-primary"><ArrowLeft size={15} /> Change plan</Link>
    </motion.aside>
  );
}

export default function CheckoutContent() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();
  const planId = searchParams.get("plan") || "";
  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";
  const selectedPlan = useMemo(() => pricingPlans.find((plan) => plan.id === planId && (plan.serviceId || "cv-builder") === "cv-builder"), [planId]);
  const isSubscription = selectedPlan?.type === "subscription";
  const userEmail = session?.user?.email || "";

  const [customerForm, setCustomerForm] = useState(INITIAL_BILLING);
  const [notice, setNotice] = useState(null);
  const [successUrl, setSuccessUrl] = useState("");
  const [verified, setVerified] = useState(false);
  const userEditedFieldsRef = useRef(new Set());
  const noticeIdRef = useRef(0);

  const notify = useCallback((message, tone = "error") => {
    const id = ++noticeIdRef.current;
    setNotice({ id, message, tone });
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);
  const updateField = useCallback((field, value) => {
    userEditedFieldsRef.current.add(field);
    setCustomerForm((previous) => ({ ...previous, [field]: value }));
  }, []);
  const updateCountry = useCallback((code) => {
    const country = COUNTRY_OPTIONS.find((item) => item.code === code);
    if (!country) return;
    ["country", "countryName", "countryFlag", "mobileCountryCode", "mobileCountryFlag"].forEach((key) => userEditedFieldsRef.current.add(key));
    setCustomerForm((previous) => ({ ...previous, country: country.code, countryName: country.name, countryFlag: country.flag, mobileCountryCode: country.dialCode, mobileCountryFlag: country.flag }));
  }, []);

  const backToLogin = useMemo(() => {
    const callback = new URLSearchParams();
    callback.set("plan", planId);
    if (cvId) callback.set("cvId", cvId);
    if (template) callback.set("template", template);
    return `/login?callbackUrl=${encodeURIComponent(`/checkout?${callback}`)}`;
  }, [planId, cvId, template]);

  useEffect(() => {
    if (status === "unauthenticated" && selectedPlan) router.replace(backToLogin);
  }, [status, selectedPlan, router, backToLogin]);

  // Optional saved billing details are loaded in parallel, and never gate Stripe Elements.
  useEffect(() => {
    if (status !== "authenticated" || !userEmail) return;
    const controller = new AbortController();
    setCustomerForm((previous) => userEditedFieldsRef.current.has("email") || previous.email ? previous : { ...previous, email: userEmail });
    const loadBilling = async () => {
      try {
        const response = await fetch("/api/user/access", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!data?.success || !data.billingDetails) return;
        setCustomerForm((previous) => {
          const next = { ...previous };
          for (const key of Object.keys(INITIAL_BILLING)) {
            if (!userEditedFieldsRef.current.has(key) && !previous[key] && data.billingDetails[key]) next[key] = data.billingDetails[key];
          }
          return next;
        });
      } catch (error) {
        if (error.name !== "AbortError") console.warn("Billing details could not be prefetched", error);
      }
    };
    loadBilling();
    return () => controller.abort();
  }, [status, userEmail]);

  // Deferred Stripe Elements: render payment methods immediately, without
  // creating a PaymentIntent or subscription before the billing form is ready.
  const stripeAppearance = useMemo(() => {
    const amount = getPlanAmountPence(selectedPlan);
    if (!selectedPlan || amount < 50) return null;
    return {
    mode: isSubscription ? "subscription" : "payment",
amount,
currency: "gbp",
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#0F8F8B", colorBackground: "#ffffff", colorText: "#07183F",
          colorDanger: "#DC2626", borderRadius: "11px",
          fontFamily: "Inter, system-ui, sans-serif", spacingUnit: "4px",
        },
        rules: {
          ".Input": { border: "1px solid #DDE3E9", padding: "13px" },
          ".Input:focus": { borderColor: "#0F8F8B", boxShadow: "0 0 0 3px rgba(15,143,139,.12)" },
        },
      },
    };
  }, [selectedPlan]);

  const markSuccess = useCallback((intentId) => {
    if (verified) return;
    setVerified(true);
    setSuccessUrl(paymentSuccessUrl({ cvId, template, planId, intentId }));
  }, [verified, cvId, template, planId]);

  const continueAfterPayment = useCallback(() => {
    if (successUrl) router.replace(successUrl);
  }, [router, successUrl]);

  return (
    <>
    <PricingHeader/>
    <main className="min-h-screen bg-background text-text-primary">
      <TopNotification key={notice?.id || "empty"} notice={notice} onDismiss={dismissNotice} />
      {verified && successUrl && <PaymentSuccessDialog onContinue={continueAfterPayment} />}
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-7 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pt-12">
        {!selectedPlan ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
            <AlertCircle size={32} className="mx-auto text-red-500" />
            <h1 className="mt-4 text-xl font-semibold">CV plan not found</h1>
            <p className="mt-2 text-sm text-text-secondary">Please choose one of the available CV Builder plans.</p>
            <Link href="/pricing" className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#07183F] px-5 text-sm font-semibold text-white">Back to pricing</Link>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }} className="mb-7 sm:mb-9">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted"><LockKeyhole size={14} className="text-accent" /> Secure checkout</span>
              <h1 className="mt-2 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">Complete your purchase</h1>
              <p className="mt-2 text-[14px] text-text-secondary">Review your details and pay securely to unlock your CV.</p>
            </motion.div>
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-7">
              <div className="min-w-0 space-y-5">
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.08 }} id="payment-section" aria-labelledby="payment-heading" className="scroll-mt-6 rounded-[22px] border border-border bg-surface p-4 shadow-[0_6px_28px_rgba(7,24,63,0.04)] sm:p-6">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <h2 id="payment-heading" className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.03em]"><CreditCard size={19} className="text-accent" /> Payment details</h2>
                      <p className="mt-1 text-[12px] text-text-secondary">Secure payment powered by Stripe</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"><ShieldCheck size={13} /> Secure</span>
                  </div>
                  <div className="mt-5 min-h-[205px]">
                    {status !== "authenticated" ? (
                      <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                        <InlineSpinner className="text-accent" />
                        <p className="mt-3 text-[13px] text-text-secondary">{status === "loading" ? "Checking your account…" : "Redirecting to login…"}</p>
                      </div>
                    ) : !stripePromise ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-[13px] text-red-800">Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</div>
                    ) : stripeAppearance ? (
                      <Elements stripe={stripePromise} options={stripeAppearance}>
                        <StripePaymentForm
                          planId={planId} cvId={cvId} template={template}
                          isSubscription={isSubscription} customerForm={customerForm}
                          onError={notify} onVerified={markSuccess} disabled={verified}
                        />
                      </Elements>
                    ) : (
                      <div role="status" className="flex min-h-[175px] items-center justify-center gap-3 rounded-xl border border-border bg-background-soft text-[13px] text-text-secondary"><InlineSpinner className="text-accent" /> Initializing secure payment…</div>
                    )}
                  </div>
                </motion.section>
                <motion.section initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }} aria-labelledby="billing-heading" className="rounded-[22px] border border-border bg-surface p-4 shadow-[0_6px_28px_rgba(7,24,63,0.04)] sm:p-6">
                  <div className="mb-5 border-b border-border pb-4">
                    <h2 id="billing-heading" className="text-[17px] font-bold tracking-[-0.03em]">Billing information</h2>
                    <p className="mt-1 text-[12px] text-text-secondary">Complete these details before confirming your payment.</p>
                  </div>
                  <BillingFields form={customerForm} updateField={updateField} updateCountry={updateCountry} />
                </motion.section>
              </div>
              <OrderSummary plan={selectedPlan} isSubscription={isSubscription} />
            </div>
          </>
        )}
      </div>
    </main>
    <CVBuilderFooter/>
    </>
  );
}

function StripePaymentForm({ planId, cvId, template, isSubscription, customerForm, onError, onVerified, disabled }) {
  const reduceMotion = useReducedMotion();
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const confirmedRef = useRef(false);
  const intentRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (processingRef.current || confirmedRef.current || disabled) return;
    if (!stripe || !elements || !ready) { onError("Payment options are still loading. Please try again shortly."); return; }
    if (!hasCompleteBilling(customerForm)) { onError("Please complete all required billing information before paying."); document.getElementById("billing-heading")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email.trim())) { onError("Please enter a valid billing email address."); return; }

    processingRef.current = true;
    setProcessing(true);
    try {
      const { error: elementsError } = await elements.submit();
      if (elementsError) { onError(elementsError.message || "Please check your payment details."); return; }

      // Server creates the actual intent ONLY after the customer's billing
      // details and Stripe payment inputs have passed validation.
      let intentData = intentRef.current;
      if (!intentData) {
        const response = await fetch("/api/checkout/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, cvId, template, customerForm }),
        });
        intentData = await response.json().catch(() => ({}));
        if (!response.ok || !intentData.success || !intentData.clientSecret) {
          onError(intentData.error || "Could not start payment. Check your billing details and try again.");
          return;
        }
        // Reuse the same intent on retries to prevent duplicate subscriptions.
        intentRef.current = intentData;
      }
      const subscriptionId = intentData.subscriptionId || "";
      const successPath = paymentSuccessUrl({ cvId, template, planId });
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: intentData.clientSecret,
        redirect: "if_required",
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: `${customerForm.firstName.trim()} ${customerForm.lastName.trim()}`,
              email: customerForm.email.trim(),
              phone: `${customerForm.mobileCountryCode}${customerForm.mobileNumber.trim()}`,
              address: {
                line1: customerForm.addressLine1.trim(),
                line2: customerForm.addressLine2?.trim() || "",
                city: customerForm.city.trim(), postal_code: customerForm.postalCode.trim(), country: customerForm.country,
              },
            },
          },
          // Redirect-based payment methods may navigate away. The existing
          // success route must independently validate payment on return.
          return_url: `${window.location.origin}${successPath}`,
        },
      });
      if (stripeError) { onError(stripeError.message || "Payment could not be completed. Please try again."); return; }
      if (!paymentIntent) { onError("Payment confirmation is pending. Please check your account before retrying."); return; }
      if (paymentIntent.status === "processing") { onError("Your payment is processing. Please wait for confirmation before trying again.", "success"); return; }
      if (paymentIntent.status !== "succeeded") { onError("Payment has not been completed. Please check your payment method."); return; }

      // Prevent a second charge even if server verification subsequently fails.
      confirmedRef.current = true;
      // Successful Stripe status alone isn't enough: preserve backend verification.
      if (isSubscription) {
        if (!subscriptionId) { onError("Payment received, but subscription details are missing. Please contact support; do not pay again."); return; }
        const response = await fetch("/api/stripe/sync-subscription", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId, planId, customerForm }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          onError(data.error || "Payment received, but subscription verification is pending. Please contact support; do not pay again.");
          return;
        }
      } else {
        const response = await fetch("/api/stripe/verify-one-time", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id, planId, cvId, customerForm }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success || data.hasAccess !== true) {
          onError(data.error || "Payment received, but CV access verification is pending. Please contact support; do not pay again.");
          return;
        }
      }
      onVerified(paymentIntent.id);
    } catch (error) {
      console.error("Checkout confirmation error:", error);
      onError("Unable to confirm payment status. If you were charged, please contact support instead of paying again.");
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="relative min-h-[205px] w-full bg-white p-0 dark:rounded-xl dark:p-3">
        {!ready && (
          <div
            role="status"
            aria-label="Loading secure payment methods"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 space-y-3 rounded-lg bg-white p-2"
          >
            <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
            <p className="text-xs text-slate-500">Loading secure payment methods…</p>
          </div>
        )}
        <PaymentElement
          onReady={() => setReady(true)}
          onLoadError={(event) => onError(event.error?.message || "Payment options failed to load.")}
          options={PAYMENT_ELEMENT_OPTIONS}
        />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-surface/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_rgba(7,24,63,0.08)] backdrop-blur-lg sm:static sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
      <motion.button type="submit" disabled={!ready || !stripe || !elements || processing || disabled || confirmedRef.current}
        whileHover={reduceMotion ? undefined : { scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07183F] px-4 text-[14px] font-semibold text-white transition-colors  disabled:cursor-not-allowed disabled:opacity-60 dark:bg-accent dark:text-[#07183F]">
        {processing ? <><InlineSpinner /> Processing securely…</> : <><LockKeyhole size={16} /> {isSubscription ? "Order now · Start subscription" : "Order now · Confirm payment"} <ArrowRight size={16} /></>}
      </motion.button>
      </div>
      <p className="mt-3 text-center text-[11px] text-text-muted">Encrypted payment · Securely processed by Stripe</p>
    </form>
  );
}
