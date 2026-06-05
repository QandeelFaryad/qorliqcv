"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { pricingPlans } from "@/lib/pricingPlans";
import {
  getOfferStartedAt,
  getOfferState,
} from "@/lib/cvOfferCountdown";

const SERVICE_TABS = [
  {
    id: "cv-builder",
    label: "CV Builder",
    title: "Choose the right CV access plan.",
    subtitle:
      "Download your professional CV in PDF and MS Word, edit it when your job search changes, and keep your application ready.",
    startText: "Start today from only",
    startPrice: "£1.99",
    standardStartPrice: "£4.99",
    recommendation:
      "Most customers choose the 6 Months plan because it gives enough time to edit, improve, and download CV versions for different job applications.",
    tags: ["PDF Download", "MS Word Download", "Print-Ready CV", "Edit Anytime"],
    footer:
      "Subscription plan savings are calculated against the standard monthly value of £4.99. The longer your plan, the more value you get while continuing to edit, improve, and download your CV.",
  },
  {
    id: "logo-design",
    label: "Logo Design",
    title: "Choose your professional logo package.",
    subtitle:
      "Get a clean, memorable brand logo suitable for websites, social media, print, and business use.",
    startText: "Logo packages from",
    startPrice: "£30",
    recommendation:
      "Most customers choose the Brand Starter plan because it includes multiple logo assets and final files ready for online and print use.",
    tags: [
      "One-Time Payment",
      "Revision Rounds",
      "High-Resolution Files",
      "Commercial Use",
    ],
    footer:
      "All logo packages are one-time payments. You may cancel within 14 days if the project has not started. Once design work has started, cancellation eligibility may no longer apply.",
  },
  {
    id: "ads",
    label: "Ads Service",
    title: "Choose your paid advertising support package.",
    subtitle:
      "Get help preparing paid ad campaigns, creatives, copy, and launch strategy for your business or service.",
    startText: "Ad support from",
    startPrice: "£30",
    recommendation:
      "Most customers choose Campaign Setup because it gives a complete starting point with ad copy, audience direction, and campaign structure.",
    tags: ["Ad Copy", "Audience Targeting", "Campaign Setup", "Creative Direction"],
    footer:
      "Paid advertisement packages cover strategy, setup, campaign structure, copy, and marketing support. Advertising budget is separate from our service fee and should normally be paid directly by the client to the advertising platform. If we are asked to pay the ad budget on the client’s behalf, the required campaign budget must be paid in advance.",
  },
];

function CheckIcon() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-qorliqGold text-black">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42 0L3.29 9.124a1 1 0 1 1 1.42-1.408l4.09 4.12 6.49-6.54a1 1 0 0 1 1.414-.006Z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.802-2.035a1 1 0 0 0-1.176 0l-2.802 2.035c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.971 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 0 0 .95-.69l1.078-3.292Z" />
    </svg>
  );
}

function ThumbIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M2 10.5A1.5 1.5 0 0 1 3.5 9H5v8H3.5A1.5 1.5 0 0 1 2 15.5v-5ZM6.5 17V8.743a3 3 0 0 0 .879-2.121V5.5A2.5 2.5 0 0 1 9.879 3h.536a1 1 0 0 1 .99 1.141l-.316 2.214A2 2 0 0 0 13.07 8.64h2.931a2 2 0 0 1 1.957 2.408l-1.083 5.2A2 2 0 0 1 14.918 18H8a1.5 1.5 0 0 1-1.5-1Z" />
    </svg>
  );
}

function getInitialService(requestedService) {
  if (SERVICE_TABS.some((item) => item.id === requestedService)) {
    return requestedService;
  }

  if (typeof window !== "undefined") {
    const savedService = window.localStorage.getItem("selectedPricingService");

    if (SERVICE_TABS.some((item) => item.id === savedService)) {
      return savedService;
    }
  }

  return "cv-builder";
}

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";
  const requestedService = searchParams.get("service") || "cv-builder";

  const [offerState, setOfferState] = useState(null);

  const [activeService, setActiveService] = useState(() =>
    getInitialService(requestedService)
  );

  useEffect(() => {
    window.localStorage.setItem("selectedPricingService", activeService);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "cv-builder") {
      setOfferState(null);
      return;
    }

    const startedAt = getOfferStartedAt();

    const updateOfferState = () => {
      const nextState = getOfferState(startedAt);
      setOfferState(nextState);
    };

    updateOfferState();

    const interval = setInterval(updateOfferState, 1000);

    return () => clearInterval(interval);
  }, [activeService]);

  const activeTab =
    SERVICE_TABS.find((item) => item.id === activeService) || SERVICE_TABS[0];

  const filteredPlans = useMemo(() => {
    return pricingPlans.filter((plan) => {
      const serviceId = plan.serviceId || "cv-builder";
      return serviceId === activeService;
    });
  }, [activeService]);

  const isCvOfferActive =
    activeService === "cv-builder" && offerState?.isActive === true;

  const isCvOfferExpired =
    activeService === "cv-builder" && offerState?.isExpired === true;

  const isCvBuilderPlan = (plan) =>
    (plan.serviceId || "cv-builder") === "cv-builder";

  const hasOldPrice = (plan) =>
    Boolean(plan.oldPrice) && !plan.contactOnly && plan.type !== "contact";

  const shouldShowOldPrice = (plan) => {
    if (!hasOldPrice(plan)) return false;

    if (isCvBuilderPlan(plan)) {
      return isCvOfferActive;
    }

    return true;
  };

  const shouldShowOfferBadges = (plan) => {
    if (!isCvBuilderPlan(plan)) {
      return Boolean(plan.discount);
    }

    return isCvOfferActive;
  };

  const getDisplayPrice = (plan) => {
    if (!isCvBuilderPlan(plan)) {
      return plan.price;
    }

    return isCvOfferActive ? plan.price : plan.oldPrice || plan.price;
  };

  const getPriceLabel = (plan) => {
    if (!isCvBuilderPlan(plan)) {
      return hasOldPrice(plan) ? "Discounted price" : "Service price";
    }

    return isCvOfferActive ? "Limited-time offer price" : "Standard price";
  };

  const getStartPrice = () => {
    if (activeService !== "cv-builder") {
      return activeTab.startPrice;
    }

    return isCvOfferActive
      ? activeTab.startPrice
      : activeTab.standardStartPrice || "£4.99";
  };

  const getPriceBadgeText = (plan) => {
    if (plan.contactOnly) return "Contact for pricing";

    if (plan.discount) return plan.discount;

    if (isCvBuilderPlan(plan) && isCvOfferActive) {
      return "Limited Offer";
    }

    if (!isCvBuilderPlan(plan) && hasOldPrice(plan)) {
      return "Special Price";
    }

    return "";
  };

  const goToCheckout = (plan) => {
    if (plan.contactOnly || plan.type === "contact") {
      router.push("/#contact");
      return;
    }

    if (status === "loading") return;

    const params = new URLSearchParams();

    params.set("plan", plan.id);
    params.set("service", activeService);

    if (cvId) params.set("cvId", cvId);
    if (template) params.set("template", template);

    const checkoutUrl = `/checkout?${params.toString()}`;

    const serviceId = plan.serviceId || activeService || "cv-builder";

    if (serviceId === "cv-builder" && status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(checkoutUrl)}`);
      return;
    }

    router.push(checkoutUrl);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_28%),linear-gradient(135deg,#070707_0%,#111111_42%,#18130a_100%)] px-4 py-12 text-white">
      <section className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-qorliqGold/20 blur-[110px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-yellow-300/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 left-0 h-80 w-80 rounded-full bg-white/[0.04] blur-[130px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 grid max-w-3xl gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-2 md:grid-cols-3">
            {SERVICE_TABS.map((service) => {
              const isActive = activeService === service.id;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setActiveService(service.id)}
                  className={`rounded-[1.1rem] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                    isActive
                      ? "bg-qorliqGold text-black shadow-lg shadow-qorliqGold/20"
                      : "text-white/55 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {service.label}
                </button>
              );
            })}
          </div>

          <div className="mx-auto mt-5 max-w-2xl rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-qorliqGold text-black">
                <ThumbIcon />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-qorliqGold">
                  Recommended choice
                </p>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  {activeTab.recommendation}
                </p>
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-6xl">
            {activeTab.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
            {activeTab.subtitle} {activeTab.startText}{" "}
            <span className="font-bold text-qorliqGold">
              {getStartPrice()}
            </span>
            .
          </p>

          <div className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-3 text-xs font-bold text-white/70">
            {activeTab.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`relative mt-12 grid gap-5 ${
            filteredPlans.length === 4
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-2 xl:grid-cols-3"
          }`}
        >
          {filteredPlans.map((plan) => {
            const isPopular = Boolean(plan.highlight);
            const buttonLabel = plan.contactOnly
              ? "Contact Us"
              : "Select Package";
            const showOfferBadges = shouldShowOfferBadges(plan);
            const oldPriceVisible = shouldShowOldPrice(plan);
            const badgeText = getPriceBadgeText(plan);

            return (
              <article
                key={plan.id}
                className={`group relative flex min-h-[650px] flex-col overflow-hidden rounded-[2rem] border p-6 shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.015] ${
                  isPopular
                    ? "border-qorliqGold bg-gradient-to-b from-qorliqGold/20 via-white/[0.08] to-white/[0.04] shadow-qorliqGold/10"
                    : "border-white/10 bg-white/[0.05] hover:border-qorliqGold/60"
                }`}
              >
                <div className="pointer-events-none absolute inset-x-6 top-0 h-24 rounded-b-full bg-gradient-to-b from-white/12 to-transparent opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-qorliqGold/10 blur-2xl transition duration-500 group-hover:bg-qorliqGold/20" />
                <div className="pointer-events-none absolute -left-10 bottom-24 h-28 w-28 rounded-full bg-white/5 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />

                {isPopular ? (
                  <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-qorliqGold px-5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black shadow-lg shadow-qorliqGold/20">
                    Most Popular
                  </div>
                ) : null}

                <div className="relative flex items-start justify-between gap-4 pt-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-qorliqGold/20 bg-qorliqGold/10 text-qorliqGold">
                    {isPopular ? <StarIcon /> : <ThumbIcon />}
                  </div>

                  {showOfferBadges ? (
                    <span className="rounded-full border border-qorliqGold/25 bg-qorliqGold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-qorliqGold">
                      {plan.discount || "Package"}
                    </span>
                  ) : null}
                </div>

                <div className="relative mt-4">
                  <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isPopular
                            ? "bg-qorliqGold text-black"
                            : "bg-white/10 text-qorliqGold"
                        }`}
                      >
                        {isPopular ? <StarIcon /> : <ThumbIcon />}
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                          Suggested choice
                        </p>

                        <p className="mt-1 text-xs font-bold leading-5 text-white">
                          {plan.recommendation || plan.name}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/50">
                          {plan.recommendationTone || plan.smallText}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-black uppercase tracking-[0.22em] text-qorliqGold">
                    {plan.category || plan.serviceName}
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    {plan.name}
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-white/55">
                    {plan.smallText}
                  </p>
                </div>

                <div className="relative mt-3 rounded-3xl border border-white/10 bg-black/25 p-5 transition duration-500 group-hover:border-qorliqGold/25 group-hover:bg-black/35">
                  <div className="flex flex-wrap items-end gap-3">
                    {oldPriceVisible ? (
                      <span className="text-sm font-bold text-white/35 line-through">
                        {plan.oldPrice}
                      </span>
                    ) : null}

                    <span
                      className={
                        plan.contactOnly
                          ? "text-3xl font-black tracking-[-0.04em] text-white"
                          : "text-5xl font-black tracking-[-0.06em] text-white"
                      }
                    >
                      {getDisplayPrice(plan)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-white/45">
                    {plan.contactOnly
                      ? "Pricing depends on your project requirements"
                      : getPriceLabel(plan)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {badgeText ? (
                      <span className="rounded-full bg-qorliqGold px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                        {badgeText}
                      </span>
                    ) : null}

                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                      {oldPriceVisible ? "Discounted price" : "Standard price"}
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-white/50">
                    {plan.renewal}
                  </p>
                </div>

                <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-500 group-hover:border-white/20 group-hover:bg-white/[0.06]">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white">
                    What you get
                  </p>

                  <div className="mt-4 space-y-3">
                    {(plan.features || []).map((feature) => (
                      <div
                        key={feature}
                        className="flex gap-3 text-sm leading-6 text-white/70"
                      >
                        <CheckIcon />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mb-8 mt-4 rounded-2xl border border-qorliqGold/15 bg-qorliqGold/[0.06] p-4 transition duration-500 group-hover:border-qorliqGold/30 group-hover:bg-qorliqGold/[0.09]">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-qorliqGold">
                    Why choose this
                  </p>

                  <p className="mt-3 text-xs leading-6 text-white/60">
                    {plan.why || "Choose this package based on your project needs."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => goToCheckout(plan)}
                  disabled={status === "loading" && !plan.contactOnly}
                  className={`relative mt-auto rounded-full px-6 py-4 text-xs font-black uppercase tracking-[0.16em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isPopular
                      ? "bg-qorliqGold text-black hover:bg-white"
                      : "bg-white text-black hover:bg-qorliqGold"
                  }`}
                >
                  {status === "loading" && !plan.contactOnly
                    ? "Checking..."
                    : buttonLabel}
                </button>
              </article>
            );
          })}
        </div>

        <div className="relative mx-auto mt-10 max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-sm leading-7 text-white/60">{activeTab.footer}</p>
        </div>
      </section>
    </main>
  );
}