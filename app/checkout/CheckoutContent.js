"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { pricingPlans } from "@/lib/pricingPlans";

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planId = searchParams.get("plan") || "";
  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";

  const selectedPlan = pricingPlans.find((plan) => plan.id === planId);

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = `/checkout?plan=${planId}&cvId=${cvId}&template=${template}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [status, router, planId, cvId, template]);

  const startCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      if (!selectedPlan) {
        setError("Please select a valid package.");
        return;
      }

      const res = await fetch("/api/checkout/create-session", {
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
        setError(data.error || "Unable to start checkout.");
        return;
      }

      if (!data.url) {
        setError("Stripe checkout URL missing.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  };

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

  const isSubscription = selectedPlan.type === "subscription";

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:py-12">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            Checkout
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] md:text-5xl">
            Complete your CV order.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            Review your selected package. After clicking the button, you will be
            redirected to Stripe secure checkout to complete payment.
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
              value={isSubscription ? "Recurring subscription" : "One-time payment"}
            />
            <InfoCard title="Access" value="PDF and MS Word download included" />
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
              Secure Payment
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PaymentMethod label="Debit / Credit Card" />
              <PaymentMethod label="Apple Pay" />
              <PaymentMethod label="Google Pay" />
              <PaymentMethod label="Link by Stripe" />
            </div>

            <p className="mt-4 text-xs leading-6 text-white/40">
              Available payment methods depend on your Stripe account settings
              and customer device/browser.
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
            onClick={startCheckout}
            disabled={loading || status === "loading"}
            className="mt-7 w-full rounded-full bg-qorliqGold px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Redirecting..."
              : isSubscription
              ? "Start Subscription"
              : "Pay Now"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(`/pricing?cvId=${cvId}&template=${template}`)
            }
            className="mt-3 w-full rounded-full border border-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10"
          >
            Change Plan
          </button>
        </aside>
      </section>
    </main>
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

function PaymentMethod({ label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70">
      {label}
    </div>
  );
}