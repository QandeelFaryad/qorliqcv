"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { pricingPlans } from "@/lib/pricingPlans";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const COUNTRIES = [
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

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();

  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [intentLoading, setIntentLoading] = useState(false);
  const [error, setError] = useState("");

  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",

    mobileCountryCode: "+44",
    mobileCountryFlag: "🇬🇧",
    mobileNumber: "",

    country: "GB",
    countryName: "United Kingdom",
    countryFlag: "🇬🇧",

    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    
  });

  const intentCreatedRef = useRef(false);

  const planId = searchParams.get("plan") || "";
  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";

  const selectedPlan = pricingPlans.find((plan) => plan.id === planId);
  const isSubscription = selectedPlan?.type === "subscription";

  const updateCustomerForm = (field, value) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCountry = (countryCode) => {
    const selectedCountry = COUNTRIES.find((item) => item.code === countryCode);

    if (!selectedCountry) return;

    setCustomerForm((prev) => ({
      ...prev,
      country: selectedCountry.code,
      countryName: selectedCountry.name,
      countryFlag: selectedCountry.flag,
      mobileCountryCode: selectedCountry.dialCode,
      mobileCountryFlag: selectedCountry.flag,
    }));
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = `/checkout?plan=${planId}&cvId=${cvId}&template=${template}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [status, router, planId, cvId, template]);

  useEffect(() => {
    if (session?.user?.email) {
      setCustomerForm((prev) => ({
        ...prev,
        email: prev.email || session.user.email,
      }));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    const createIntent = async () => {
      try {
        if (status !== "authenticated") return;
        if (!selectedPlan) return;
        if (clientSecret) return;
        if (intentCreatedRef.current) return;

        intentCreatedRef.current = true;

        setIntentLoading(true);
        setError("");

        const res = await fetch("/api/checkout/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId,
            cvId,
            template,
            customerForm,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          intentCreatedRef.current = false;
          setError(data.error || "Unable to load payment form.");
          return;
        }

        setClientSecret(data.clientSecret);

        if (data.subscriptionId) {
          setSubscriptionId(data.subscriptionId);
        }
      } catch (error) {
        intentCreatedRef.current = false;
        console.error("Create intent error:", error);
        setError("Unable to load payment form.");
      } finally {
        setIntentLoading(false);
      }
    };

    createIntent();
  }, [status, selectedPlan, planId, cvId, template, clientSecret]);

  const elementsOptions = useMemo(() => {
  if (!clientSecret) return null;

  return {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#d6b25e",
        colorBackground: "#ffffff",
        colorText: "#111827",
        colorDanger: "#dc2626",
        borderRadius: "14px",
        fontFamily: "Inter, system-ui, sans-serif",
        spacingUnit: "4px",
      },
      rules: {
        ".Input": {
          border: "1px solid #e5e7eb",
          boxShadow: "none",
          fontSize: "15px",
          padding: "14px",
        },
        ".Input:focus": {
          border: "1px solid #d6b25e",
          boxShadow: "0 0 0 4px rgba(214,178,94,0.16)",
        },
        ".Label": {
          fontSize: "12px",
          fontWeight: "700",
          color: "#4b5563",
        },
        ".Tab": {
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "12px",
        },
        ".Tab--selected": {
          borderColor: "#d6b25e",
          boxShadow: "0 0 0 3px rgba(214,178,94,0.16)",
        },
      },
    },
  };
}, [clientSecret]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <p className="text-sm font-bold text-white/60">Checking login...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <p className="text-sm font-bold text-white/60">
          Redirecting to login...
        </p>
      </main>
    );
  }

  if (!selectedPlan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center">
          <h1 className="text-3xl font-black">Package not found</h1>

          <p className="mt-3 text-sm text-white/50">
            Please go back and select a valid package.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(`/pricing?cvId=${cvId}&template=${template}`)
            }
            className="mt-6 rounded-full bg-qorliqGold px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white"
          >
            Back to Pricing
          </button>
        </div>
      </main>
    );
  }

return (
  <main className="min-h-screen w-full overflow-x-hidden bg-[#050505] text-white">
    <section className="w-full px-0 py-0 sm:px-5 sm:py-5 lg:px-8 lg:py-10">
      <div className="w-full min-w-0 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
      
{/* Mobile Order Summary */}
<div className="w-full border-b border-qorliqGold/25 bg-gradient-to-br from-qorliqGold/20 via-white/[0.06] to-black px-4 py-10 shadow-2xl lg:hidden">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-qorliqGold">
        Order Summary
      </p>

      <h2 className="mt-1 truncate text-lg font-black leading-tight text-white">
        {selectedPlan.name}
      </h2>

      <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-white/55">
        {selectedPlan.smallText ||
          (isSubscription ? "Recurring subscription" : "One-time payment")}
      </p>
    </div>

    <div className="shrink-0 text-right">
      <p className="text-xl font-black leading-none tracking-[-0.04em] text-white">
        {selectedPlan.price}
      </p>

      <button
        type="button"
        onClick={() =>
          router.push(`/pricing?cvId=${cvId}&template=${template}`)
        }
        className="mt-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/75"
      >
        Change
      </button>
    </div>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-2.5">
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
        Payment
      </p>
      <p className="mt-0.5 text-[11px] font-bold text-white/80">
        {isSubscription ? "Subscription" : "One-time"}
      </p>
    </div>

    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
        Access
      </p>
      <p className="mt-0.5 text-[11px] font-bold text-white/80">
        PDF + Word
      </p>
    </div>
  </div>
</div>

        {/* Main Checkout Card */}
       <div className="w-full min-w-0 rounded-none border-0 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur sm:rounded-[26px] sm:border sm:border-white/10 sm:p-6 lg:p-8">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-qorliqGold sm:text-xs">
              Secure Checkout
            </p>

            <h1 className="mt-3 text-[28px] font-black leading-[1.05] tracking-[-0.05em] sm:text-4xl lg:text-5xl">
              Complete your CV order.
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
              Enter your billing details and complete payment securely through Stripe.
            </p>
          </div>

          {/* Mobile-friendly info row */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard
              title="Customer"
              value={customerForm.email || session?.user?.email || "Logged in"}
            />

            <InfoCard
              title="Template"
              value={template || "Selected"}
            />

            <InfoCard
              title="Payment"
              value={isSubscription ? "Subscription" : "One-time"}
            />

            <InfoCard
              title="Access"
              value="PDF + Word"
            />
          </div>

          {/* Billing Details */}
          <div className="mt-5 rounded-[22px] border border-white/10 bg-black/35 p-4 sm:mt-7 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
                  Billing Details
                </p>

                <p className="mt-1 text-xs leading-5 text-white/35">
                  Required for payment confirmation and receipt.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-qorliqGold/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-qorliqGold">
                Required
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <CheckoutInput
                label="First Name"
                value={customerForm.firstName}
                onChange={(value) => updateCustomerForm("firstName", value)}
                placeholder="First name"
                required
              />

              <CheckoutInput
                label="Last Name"
                value={customerForm.lastName}
                onChange={(value) => updateCustomerForm("lastName", value)}
                placeholder="Last name"
                required
              />

              <div className="sm:col-span-2">
                <CheckoutInput
                  label="Email Address"
                  type="email"
                  value={customerForm.email}
                  onChange={(value) => updateCustomerForm("email", value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <PhoneInput
                label="Mobile Number"
                countryCode={customerForm.mobileCountryCode}
                countryFlag={customerForm.mobileCountryFlag}
                value={customerForm.mobileNumber}
                onChange={(value) => updateCustomerForm("mobileNumber", value)}
                placeholder="Mobile number"
                required
              />

              <CountrySelect
                label="Country"
                value={customerForm.country}
                onChange={updateCountry}
                required
              />

              <CheckoutInput
                label="Postal Code"
                value={customerForm.postalCode}
                onChange={(value) => updateCustomerForm("postalCode", value)}
                placeholder="Postal code"
                required
              />

              <CheckoutInput
                label="City / Town"
                value={customerForm.city}
                onChange={(value) => updateCustomerForm("city", value)}
                placeholder="City or town"
                required
              />

              <div className="sm:col-span-2">
                <CheckoutInput
                  label="Address Line 1"
                  value={customerForm.addressLine1}
                  onChange={(value) => updateCustomerForm("addressLine1", value)}
                  placeholder="House / flat / street"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <CheckoutInput
                  label="Address Line 2"
                  value={customerForm.addressLine2}
                  onChange={(value) => updateCustomerForm("addressLine2", value)}
                  placeholder="Apartment / area / optional"
                />
              </div>
            </div>
          </div>

     {/* Payment Details */}
{/* Payment Details */}
<div className="relative z-30 mt-5 rounded-[24px] border border-white/10 bg-[#0b0b0b] p-4 shadow-2xl shadow-black/25 sm:mt-7 sm:p-5 lg:p-6">
  <div className="relative z-10 border-b border-white/10 pb-4">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
          Payment Details
        </p>

        <p className="mt-1 text-xs leading-5 text-white/40">
          Secure encrypted payment powered by Stripe.
        </p>
      </div>

      <span className="shrink-0 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-green-300">
        Secure
      </span>
    </div>
  </div>

  <div className="relative z-40 mt-5 w-full min-w-0">
    {intentLoading ? (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm font-bold text-white/60">
        Loading secure payment form...
      </div>
    ) : clientSecret && elementsOptions ? (
      <Elements stripe={stripePromise} options={elementsOptions}>
        <StripePaymentForm
          selectedPlan={selectedPlan}
          cvId={cvId}
          template={template}
          planId={planId}
          subscriptionId={subscriptionId}
          customerForm={customerForm}
        />
      </Elements>
    ) : (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm font-bold text-white/60">
        Payment form not loaded.
      </div>
    )}
  </div>
</div>

          {error ? (
            <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        {/* Desktop Order Summary */}
        <aside className="hidden h-fit rounded-[28px] border border-qorliqGold/30 bg-qorliqGold/10 p-6 shadow-2xl lg:block">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            Order Summary
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight">
            {selectedPlan.name}
          </h2>

          <p className="mt-3 text-5xl font-black tracking-[-0.05em]">
            {selectedPlan.price}
          </p>

          <p className="mt-2 text-sm leading-6 text-white/50">
            {selectedPlan.smallText}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              Billing
            </p>

            <p className="mt-1 text-sm font-bold text-white/80">
              {isSubscription ? "Recurring subscription" : "One-time payment"}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {selectedPlan.features?.map((feature) => (
              <div key={feature} className="flex gap-3 text-sm leading-6 text-white/70">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-qorliqGold" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/pricing?cvId=${cvId}&template=${template}`)
            }
            className="mt-7 w-full rounded-full border border-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/10"
          >
            Change Plan
          </button>
        </aside>
      </div>
    </section>
  </main>
);
}

function StripePaymentForm({
  selectedPlan,
  cvId,
  template,
  planId,
  subscriptionId,
  customerForm,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSubscription = selectedPlan?.type === "subscription";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe is not ready yet.");
      return;
    }

    if (
      !customerForm?.firstName?.trim() ||
      !customerForm?.lastName?.trim() ||
      !customerForm?.email?.trim() ||
      !customerForm?.mobileNumber?.trim() ||
      !customerForm?.country?.trim() ||
      !customerForm?.postalCode?.trim() ||
      !customerForm?.addressLine1?.trim() ||
      !customerForm?.city?.trim() 
      
    ) {
      setMessage("Please complete all required billing details first.");
      return;
    }

    try {
      setIsProcessing(true);
      setMessage("");

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
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
                city: customerForm.city.trim(),
                
                postal_code: customerForm.postalCode.trim(),
                country: customerForm.country,
              },
            },
          },
          return_url: `${window.location.origin}/cv-builder/success?cvId=${
            cvId || ""
          }&template=${template || ""}&plan=${planId || ""}`,
        },
      });

      if (error) {
        setMessage(error.message || "Payment failed. Please try again.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        if (isSubscription) {
          const verifyRes = await fetch("/api/stripe/sync-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscriptionId,
              planId,
              customerForm,
            }),
          });

          const verifyData = await verifyRes.json();

          console.log("Subscription verify response:", verifyData);

          if (!verifyRes.ok || !verifyData.success) {
            setMessage(
              verifyData.error ||
                "Payment completed, but subscription verification failed."
            );
            return;
          }
        }

        if (!isSubscription) {
          const oneTimeRes = await fetch("/api/stripe/verify-one-time", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              planId,
              cvId,
              customerForm,
            }),
          });

          const oneTimeData = await oneTimeRes.json();

          console.log("One-time verify response:", oneTimeData);

          if (
            !oneTimeRes.ok ||
            !oneTimeData.success ||
            oneTimeData.hasAccess !== true
          ) {
            setMessage(
              oneTimeData.error ||
                "Payment completed, but one-time access could not be activated."
            );
            return;
          }
        }

        router.push(
          `/cv-builder/success?cvId=${cvId || ""}&template=${
            template || ""
          }&plan=${planId || ""}&payment_intent=${paymentIntent.id}`
        );
        return;
      }

      if (paymentIntent?.status === "processing") {
        setMessage(
          "Payment is processing. Please wait and refresh after a moment."
        );
        return;
      }

      setMessage("Payment is not completed yet. Please try again.");
    } catch (error) {
      console.error("Payment confirm error:", error);
      setMessage("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

return (
  <form
    onSubmit={handleSubmit}
    className="relative z-50 w-full min-w-0"
    style={{
      touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent",
    }}
  >
    <div className="relative z-50 w-full min-w-0 rounded-[22px] border border-slate-200 bg-white p-3 shadow-xl sm:p-4">
      <PaymentElement
        onReady={() => setIsReady(true)}
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
        }}
      />
    </div>

    {message ? (
      <p className="relative z-50 mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
        {message}
      </p>
    ) : null}

    <button
      type="submit"
      disabled={!stripe || !elements || !isReady || isProcessing}
      className="relative z-50 mt-5 flex min-h-[58px] w-full items-center justify-center rounded-2xl bg-qorliqGold px-5 py-4 text-center text-[12px] font-black uppercase tracking-[0.12em] text-black shadow-xl shadow-qorliqGold/20 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-full"
    >
      {isProcessing
        ? "Processing Securely..."
        : isSubscription
        ? "Confirm & Start Subscription"
        : "Confirm Payment"}
    </button>

    <p className="relative z-50 mt-4 text-center text-[11px] leading-5 text-white/40 sm:text-xs">
      Your payment details are encrypted and processed securely.
    </p>
  </form>
);
}

function CheckoutInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div className="w-full min-w-0">
      <label className="text-[11px] font-black uppercase tracking-[0.13em] text-white/50">
        {label} {required ? <span className="text-qorliqGold">*</span> : null}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-[54px] w-full min-w-0 rounded-2xl border border-white/10 bg-[#101010] px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/15 sm:text-sm"
      />
    </div>
  );
}
function CountrySelect({ label, value, onChange, required = false }) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.13em] text-white/50">
        {label} {required ? <span className="text-qorliqGold">*</span> : null}
      </label>

      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="h-[56px] w-full appearance-none rounded-2xl border border-white/10 bg-[#101010] px-4 pr-11 text-[15px] font-semibold text-white outline-none transition focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/15"
        >
          {COUNTRIES.map((country) => (
            <option
              key={country.code}
              value={country.code}
              className="bg-black text-white"
            >
              {country.flag} {country.name}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/45">
          ▼
        </span>
      </div>
    </div>
  );
}
function PhoneInput({
  label,
  countryCode,
  countryFlag,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="w-full min-w-0">
      <label className="text-[11px] font-black uppercase tracking-[0.13em] text-white/50">
        {label} {required ? <span className="text-qorliqGold">*</span> : null}
      </label>

      <div className="mt-2 flex h-[54px] w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition focus-within:border-qorliqGold focus-within:ring-4 focus-within:ring-qorliqGold/15">
        <div className="flex shrink-0 items-center gap-1.5 border-r border-white/10 px-3 text-sm font-black text-white">
          <span>{countryFlag}</span>
          <span>{countryCode}</span>
        </div>

        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s-]/g, ""))}
          placeholder={placeholder}
          required={required}
          className="min-w-0 flex-1 bg-transparent px-3 text-base font-semibold text-white outline-none placeholder:text-white/25 sm:text-sm"
        />
      </div>
    </div>
  );
}
function InfoCard({ title, value }) {
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.075] to-black/30 p-4 shadow-lg shadow-black/10 sm:block">
      <p className="shrink-0 text-[10px] font-black uppercase tracking-[0.13em] text-qorliqGold/80 sm:text-[10px]">
        {title}
      </p>

      <p className="min-w-0 break-words text-right text-sm font-bold leading-5 text-white/85 sm:mt-1 sm:text-left">
        {value}
      </p>
    </div>
  );
}