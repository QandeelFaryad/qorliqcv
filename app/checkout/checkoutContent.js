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

function formatCountdown(seconds) {
  const safeSeconds = Math.max(Number(seconds || 0), 0);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

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

const serviceId = selectedPlan?.serviceId || "cv-builder";
const isSubscription = selectedPlan?.type === "subscription";
const isCvBuilderPlan = serviceId === "cv-builder";
const isGuestServicePlan = serviceId === "logo-design" || serviceId === "ads";

const hasRequiredBillingDetails = Boolean(
  customerForm.firstName?.trim() &&
    customerForm.lastName?.trim() &&
    customerForm.email?.trim() &&
    customerForm.mobileNumber?.trim() &&
    customerForm.country?.trim() &&
    customerForm.postalCode?.trim() &&
    customerForm.addressLine1?.trim() &&
    customerForm.city?.trim()
);

const checkoutCopy = useMemo(() => {
  if (serviceId === "logo-design") {
    return {
      badge: "Logo Design Checkout",
      title: "Complete your logo design order.",
      description:
        "Enter your billing details and complete payment securely. After payment, our team will start your logo design request.",
      accessTitle: "Service",
      accessValue: "Logo Design",
      itemTitle: "Logo Package",
      customerValue: customerForm.email || session?.user?.email || "Guest checkout",
      orderButton: "Place Logo Order",
      successPath: "/logo-design/success",
      pricingPath: "/pricing?service=logo-design",
    };
  }

  if (serviceId === "ads") {
    return {
      badge: "Ads Service Checkout",
      title: "Complete your ads service order.",
      description:
        "Enter your billing details and complete payment securely. After payment, our team will review your campaign requirement.",
      accessTitle: "Service",
      accessValue: "Ads Service",
      itemTitle: "Ads Package",
      customerValue: customerForm.email || session?.user?.email || "Guest checkout",
      orderButton: "Place Ads Order",
      successPath: "/ads/success",
      pricingPath: "/pricing?service=ads",
    };
  }

  return {
    badge: "Secure Checkout",
    title: "Complete your CV order.",
    description:
      "Enter your billing details and complete payment securely through Stripe.",
    accessTitle: "Access",
    accessValue: "PDF + Word",
    itemTitle: "CV Package",
    customerValue: customerForm.email || session?.user?.email || "Logged in",
    orderButton: "Continue Order",
    successPath: "/cv-builder/success",
    pricingPath: `/pricing?cvId=${cvId}&template=${template}`,
  };
}, [serviceId, customerForm.email, session?.user?.email, cvId, template]);

  const [checkoutRemainingSeconds, setCheckoutRemainingSeconds] = useState(
    10 * 60
  );

  useEffect(() => {
    if (!selectedPlan) return;

    const isCvBuilder = (selectedPlan.serviceId || "cv-builder") === "cv-builder";
    const hasCountdownOffer = Boolean(
      selectedPlan.offerDurationMinutes && selectedPlan.oldPrice
    );

    if (!isCvBuilder || !hasCountdownOffer) return;

    const userKey =
      session?.user?.email?.toLowerCase()?.trim() || "guest";

    const storageKey = `cvBuilderOfferStartedAt:${userKey}`;
    const now = Date.now();

    let startedAt = Number(window.localStorage.getItem(storageKey));

    if (!startedAt || Number.isNaN(startedAt)) {
      startedAt = now;
      window.localStorage.setItem(storageKey, String(startedAt));
    }

    const updateCountdown = () => {
      const durationSeconds =
        Number(selectedPlan.offerDurationMinutes || 10) * 60;

      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(durationSeconds - elapsedSeconds, 0);

      setCheckoutRemainingSeconds(left);
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [selectedPlan, session?.user?.email]);

  const getCheckoutDisplayPrice = (plan) => {
    const isCvBuilder = (plan.serviceId || "cv-builder") === "cv-builder";
    const hasCountdownOffer = Boolean(plan.offerDurationMinutes && plan.oldPrice);

    if (!isCvBuilder || !hasCountdownOffer) {
      return plan.price;
    }

    return checkoutRemainingSeconds > 0 ? plan.price : plan.oldPrice;
  };

  const getCheckoutPriceLabel = (plan) => {
    const isCvBuilder = (plan.serviceId || "cv-builder") === "cv-builder";
    const hasCountdownOffer = Boolean(plan.offerDurationMinutes && plan.oldPrice);

    if (!isCvBuilder || !hasCountdownOffer) {
      return "";
    }

    return checkoutRemainingSeconds > 0
      ? `Offer price ends in ${formatCountdown(checkoutRemainingSeconds)}`
      : "Standard price after offer expired";
  };

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
  if (!selectedPlan) return;
  if (status !== "unauthenticated") return;

  // Login required only for CV Builder
  if (isCvBuilderPlan) {
    const callbackUrl = `/checkout?plan=${planId}&cvId=${cvId}&template=${template}`;
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
}, [
  status,
  router,
  planId,
  cvId,
  template,
  selectedPlan,
  isCvBuilderPlan,
]);

  useEffect(() => {
    if (!session?.user?.email) return;

    setCustomerForm((prev) => ({
      ...prev,
      email: prev.email || session.user.email,
    }));

    const fetchBillingDetails = async () => {
      try {
        const res = await fetch("/api/user/access");
        const data = await res.json();
        if (data.success && data.billingDetails) {
          const bd = data.billingDetails;
          setCustomerForm((prev) => ({
            ...prev,
            firstName: prev.firstName || bd.firstName || "",
            lastName: prev.lastName || bd.lastName || "",
            email: prev.email || bd.email || session.user.email || "",
            mobileCountryCode: bd.mobileCountryCode || prev.mobileCountryCode || "+44",
            mobileCountryFlag: bd.mobileCountryFlag || prev.mobileCountryFlag || "🇬🇧",
            mobileNumber: prev.mobileNumber || bd.mobileNumber || "",
            country: bd.country || prev.country || "GB",
            countryName: bd.countryName || prev.countryName || "United Kingdom",
            countryFlag: bd.countryFlag || prev.countryFlag || "🇬🇧",
            postalCode: prev.postalCode || bd.postalCode || "",
            addressLine1: prev.addressLine1 || bd.addressLine1 || "",
            addressLine2: prev.addressLine2 || bd.addressLine2 || "",
            city: prev.city || bd.city || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching billing details:", err);
      }
    };

    fetchBillingDetails();
  }, [status, session?.user?.email]);

useEffect(() => {
  const createIntent = async () => {
    try {
      if (!selectedPlan) return;
      if (clientSecret) return;
      if (intentCreatedRef.current) return;

      const currentServiceId = selectedPlan?.serviceId || "cv-builder";
      const isCvBuilder = currentServiceId === "cv-builder";
      const isGuestService =
        currentServiceId === "logo-design" || currentServiceId === "ads";

      if (isCvBuilder && status !== "authenticated") return;
      if (isGuestService && status === "loading") return;

      if (isGuestService && !hasRequiredBillingDetails) {
        setError("");
        return;
      }

      if (isCvBuilder && !hasRequiredBillingDetails) {
        setError("");
        return;
      }

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
}, [
  status,
  selectedPlan,
  planId,
  cvId,
  template,
  clientSecret,
  hasRequiredBillingDetails,
  customerForm.firstName,
  customerForm.lastName,
  customerForm.email,
  customerForm.mobileNumber,
  customerForm.country,
  customerForm.postalCode,
  customerForm.addressLine1,
  customerForm.city,
]);

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

if (status === "loading" && isCvBuilderPlan) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
      <p className="text-sm font-bold text-white/60">Checking login...</p>
    </main>
  );
}

if (status === "unauthenticated" && isCvBuilderPlan) {
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

  const priceLabel = getCheckoutPriceLabel(selectedPlan);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#050505] text-white">
      <section className="w-full px-0 py-0 sm:px-5 sm:py-5 lg:px-8 lg:py-10">
        <div className="w-full min-w-0 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
          {/* Mobile Order Summary */}
          <div className="w-full border-b border-qorliqGold/25 bg-gradient-to-br from-qorliqGold/20 via-white/[0.06] to-black px-4 py-6 shadow-2xl lg:hidden">
            <div className="flex flex-col gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-qorliqGold">
                  Order Summary
                </p>

                <h2 className="mt-1 break-words text-xl font-black leading-tight text-white">
                  {selectedPlan.name}
                </h2>

                <p className="mt-2 text-[12px] leading-5 text-white/60">
                  {selectedPlan.smallText ||
                    (isSubscription
                      ? "Recurring subscription"
                      : "One-time payment")}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                    Total Price
                  </p>

                  <p className="mt-1 text-2xl font-black leading-none tracking-[-0.04em] text-white">
                    {getCheckoutDisplayPrice(selectedPlan)}
                  </p>

                  {priceLabel ? (
                    <p className="mt-1 text-[10px] font-bold leading-4 text-qorliqGold">
                      {priceLabel}
                    </p>
                  ) : null}
                </div>

               <button
  type="button"
  onClick={() => {
    const paymentBox = document.getElementById("payment-section");
    paymentBox?.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
  className="rounded-full border border-qorliqGold/30 bg-qorliqGold px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-black transition hover:bg-white"
>
  Order
</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                  Payment
                </p>

                <p className="mt-1 text-[12px] font-bold text-white/80">
                  {isSubscription ? "Subscription" : "One-time"}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                  Access
                </p>

                <p className="mt-1 text-[12px] font-bold text-white/80">
                 {checkoutCopy.accessValue}
                </p>
              </div>

              {selectedPlan.features?.length ? (
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 sm:col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                    Included
                  </p>

                  <div className="mt-3 space-y-2">
                    {selectedPlan.features.slice(0, 5).map((feature) => (
                      <div
                        key={feature}
                        className="flex gap-2 text-[12px] leading-5 text-white/75"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-qorliqGold" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Main Checkout Card */}
          <div className="w-full min-w-0 rounded-none border-0 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur sm:rounded-[26px] sm:border sm:border-white/10 sm:p-6 lg:p-8">
            <div className="max-w-3xl">
             <p className="text-[10px] font-black uppercase tracking-[0.22em] text-qorliqGold sm:text-xs">
  {checkoutCopy.badge}
</p>

<h1 className="mt-3 text-[28px] font-black leading-[1.05] tracking-[-0.05em] sm:text-4xl lg:text-5xl">
  {checkoutCopy.title}
</h1>

<p className="mt-3 text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
  {checkoutCopy.description}
</p>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <InfoCard title="Customer" value={checkoutCopy.customerValue} />

<InfoCard title={checkoutCopy.itemTitle} value={selectedPlan.name} />

<InfoCard
  title="Payment"
  value={isSubscription ? "Subscription" : "One-time"}
/>

<InfoCard title={checkoutCopy.accessTitle} value={checkoutCopy.accessValue} />
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
                    onChange={(value) =>
                      updateCustomerForm("addressLine1", value)
                    }
                    placeholder="House / flat / street"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <CheckoutInput
                    label="Address Line 2"
                    value={customerForm.addressLine2}
                    onChange={(value) =>
                      updateCustomerForm("addressLine2", value)
                    }
                    placeholder="Apartment / area / optional"
                  />
                </div>
              </div>
            </div>

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
              {getCheckoutDisplayPrice(selectedPlan)}
            </p>

            {priceLabel ? (
              <p className="mt-2 rounded-full border border-qorliqGold/20 bg-black/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-qorliqGold">
                {priceLabel}
              </p>
            ) : null}

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
                <div
                  key={feature}
                  className="flex gap-3 text-sm leading-6 text-white/70"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-qorliqGold" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

          <button
  type="button"
  onClick={() => {
    const paymentBox = document.getElementById("payment-section");
    paymentBox?.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
  className="mt-7 w-full rounded-full bg-qorliqGold px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white"
>
  Order Now
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
const serviceId = selectedPlan?.serviceId;
const isCvBuilderPlan = serviceId === "cv-builder";
const isGuestCheckoutPlan = serviceId === "logo-design" || serviceId === "ads";

const paymentButtonText =
  serviceId === "logo-design"
    ? "Confirm Logo Order"
    : serviceId === "ads"
    ? "Confirm Ads Order"
    : isSubscription
    ? "Confirm & Start Subscription"
    : "Confirm Payment";

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

      const currentServiceId = selectedPlan?.serviceId || "cv-builder";

      const successPath =
        currentServiceId === "logo-design"
          ? "/logo-design/success"
          : currentServiceId === "ads"
          ? "/ads/success"
          : "/cv-builder/success";

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
          return_url: `${window.location.origin}${successPath}?cvId=${
            cvId || ""
          }&template=${template || ""}&plan=${planId || ""}`,
        },
      });

      if (error) {
        setMessage(error.message || "Payment failed. Please try again.");
        return;
      }

      if (paymentIntent?.status === "processing") {
        setMessage(
          "Payment is processing. Please wait and refresh after a moment."
        );
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        setMessage("Payment is not completed yet. Please try again.");
        return;
      }

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

        if (!verifyRes.ok || !verifyData?.success) {
          setMessage(
            verifyData?.error || "Payment completed, but verification failed."
          );
          return;
        }

        router.push(
          `/cv-builder/success?cvId=${cvId || ""}&template=${
            template || ""
          }&plan=${planId || ""}&payment_intent=${paymentIntent.id}`
        );
        return;
      }

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

      if (!oneTimeRes.ok || !oneTimeData?.success) {
        setMessage(
          oneTimeData?.error || "Payment completed, but verification failed."
        );
        return;
      }

      const serviceId =
        oneTimeData?.serviceId || selectedPlan?.serviceId || "cv-builder";

      if (serviceId === "cv-builder" && oneTimeData.hasAccess !== true) {
        setMessage(
          "Payment completed, but CV Builder access could not be activated."
        );
        return;
      }

      if (serviceId === "logo-design") {
        router.push(
          `/logo-design/success?plan=${planId || ""}&payment_intent=${
            paymentIntent.id
          }`
        );
        return;
      }

      if (serviceId === "ads") {
        router.push(
          `/ads/success?plan=${planId || ""}&payment_intent=${
            paymentIntent.id
          }`
        );
        return;
      }

      router.push(
        `/cv-builder/success?cvId=${cvId || ""}&template=${
          template || ""
        }&plan=${planId || ""}&payment_intent=${paymentIntent.id}`
      );
      return;
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
        {isProcessing ? "Processing Securely..." : paymentButtonText}
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