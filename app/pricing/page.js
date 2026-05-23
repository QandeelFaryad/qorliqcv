"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { pricingPlans } from "@/lib/pricingPlans";

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";

  const goToCheckout = (planId) => {
    if (status !== "authenticated") {
      router.push(
        `/login?callbackUrl=/pricing&cvId=${cvId}&template=${template}`
      );
      return;
    }

    router.push(`/checkout?plan=${planId}&cvId=${cvId}&template=${template}`);
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            CV Builder Pricing
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">
            Choose your download package.
          </h1>

          <p className="mt-5 text-sm leading-7 text-white/55">
            All packages include PDF and MS Word download. Select the package
            that matches your job search needs.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className="flex min-h-[430px] flex-col rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 transition hover:-translate-y-1 hover:border-qorliqGold/60"
            >
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-qorliqGold">
                  {plan.name}
                </p>

                <h2 className="mt-4 text-5xl font-black tracking-[-0.05em]">
                  {plan.price}
                </h2>

                <p className="mt-2 text-sm text-white/45">{plan.smallText}</p>
              </div>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-3 text-sm text-white/65">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-qorliqGold" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => goToCheckout(plan.id)}
                className="mt-auto rounded-full bg-qorliqGold px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white"
              >
                Select Package
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}