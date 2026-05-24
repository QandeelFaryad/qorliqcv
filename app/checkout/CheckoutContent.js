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

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();

  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [intentLoading, setIntentLoading] = useState(false);
  const [error, setError] = useState("");
  const intentCreatedRef = useRef(false);

  const planId = searchParams.get("plan") || "";
  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";

  const selectedPlan = pricingPlans.find((plan) => plan.id === planId);
  const isSubscription = selectedPlan?.type === "subscription";

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = `/checkout?plan=${planId}&cvId=${cvId}&template=${template}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [status, router, planId, cvId, template]);

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
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
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
}finally {
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
        theme: "night",
        variables: {
          colorPrimary: "#d6b25e",
          colorBackground: "#050505",
          colorText: "#ffffff",
          colorDanger: "#ff6b6b",
          borderRadius: "14px",
          fontFamily: "Inter, system-ui, sans-serif",
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
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:py-12">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            Secure Checkout
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] md:text-5xl">
            Complete your CV order.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            Enter your card details below. Your payment is processed securely by
            Stripe.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoCard
              title="Customer"
              value={session?.user?.email || "Logged in"}
            />
            <InfoCard
              title="Selected Template"
              value={template || "Selected CV template"}
            />
            <InfoCard
              title="Payment Type"
              value={
                isSubscription ? "Recurring subscription" : "One-time payment"
              }
            />
            <InfoCard title="Access" value="PDF and MS Word download included" />
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
              Card Details
            </p>

            <div className="mt-5">
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
/>
                </Elements>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm font-bold text-white/60">
                  Payment form not loaded.
                </div>
              )}
            </div>

            <p className="mt-4 text-xs leading-6 text-white/40">
              Your card details are handled securely by Stripe.
            </p>
          </div>

          {error ? (
            <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <aside className="h-fit rounded-[2rem] border border-qorliqGold/30 bg-qorliqGold/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            Order Summary
          </p>

          <h2 className="mt-4 text-3xl font-black">{selectedPlan.name}</h2>

          <p className="mt-2 text-5xl font-black tracking-[-0.05em]">
            {selectedPlan.price}
          </p>

          <p className="mt-2 text-sm text-white/50">
            {selectedPlan.smallText}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              Billing
            </p>
            <p className="mt-1 text-sm font-bold text-white/80">
              {isSubscription ? "Recurring subscription" : "One-time payment"}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {selectedPlan.features?.map((feature) => (
              <div key={feature} className="flex gap-3 text-sm text-white/70">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-qorliqGold" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/pricing?cvId=${cvId}&template=${template}`)
            }
            className="mt-7 w-full rounded-full border border-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10"
          >
            Change Plan
          </button>
        </aside>
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
})  {
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

  try {
    setIsProcessing(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/cv-builder/success?cvId=${
          cvId || ""
        }&template=${template || ""}&plan=${planId || ""}`,
      },
    });

    if (error) {
      setMessage(error.message || "Payment failed. Please try again.");
      return;
    }

    if (
      paymentIntent?.status === "succeeded" ||
      paymentIntent?.status === "processing"
    ) {
      if (isSubscription) {
        try {
          const verifyRes = await fetch("/api/stripe/sync-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscriptionId,
              planId,
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
        } catch (verifyError) {
          console.error("Subscription verify request failed:", verifyError);
          setMessage("Payment completed, but subscription verification failed.");
          return;
        }
      }

      if (!isSubscription && paymentIntent?.status === "succeeded") {
        try {
          const oneTimeRes = await fetch("/api/stripe/verify-one-time", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              planId,
            }),
          });

          const oneTimeData = await oneTimeRes.json();

          console.log("One-time access response:", oneTimeData);

          if (!oneTimeRes.ok || !oneTimeData.success) {
            setMessage(
              oneTimeData.error ||
                "Payment completed, but one-time access could not be activated."
            );
            return;
          }
        } catch (oneTimeError) {
          console.error("One-time access verify failed:", oneTimeError);
          setMessage(
            "Payment completed, but one-time access could not be activated."
          );
          return;
        }
      }

      router.push(
        `/cv-builder/success?cvId=${cvId || ""}&template=${
          template || ""
        }&plan=${planId || ""}`
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
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <PaymentElement onReady={() => setIsReady(true)} />
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || !isReady || isProcessing}
        className="mt-6 w-full rounded-full bg-qorliqGold px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing
          ? "Processing Payment..."
          : isSubscription
          ? "Pay & Start Subscription"
          : "Pay Now"}
      </button>
    </form>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {title}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-white/80">
        {value}
      </p>
    </div>
  );
}