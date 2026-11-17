"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { pricingPlans } from "@/lib/pricingPlans";
import CVBuilderFooter from "@/components/CVBuilderFooter";
import PricingHeader from "@/components/pricing/PricingHeader";
import CustomerReviews from "@/components/CustomerReviews";
import CustomerHiredAt from "@/components/pricing/CustomerHiredAt";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";


/*
 * This page deliberately consumes the existing pricingPlans configuration.
 * Do not duplicate plan IDs or Stripe price mappings here: checkout depends
 * on the existing IDs in @/lib/pricingPlans.
 */

const PLAN_ORDER = ["one-time", "3-months", "6-months", "annual"];

function getPlanPriority(plan) {
  const raw = `${plan.id || ""} ${plan.name || ""}`.toLowerCase();
  if (/one.time|single|3.day/.test(raw)) return 0;
  if (/3.month|three.month|quarter/.test(raw)) return 1;
  if (/6.month|six.month|half.year/.test(raw)) return 2;
  if (/annual|year|12.month/.test(raw)) return 3;
  const exact = PLAN_ORDER.indexOf(String(plan.id));
  return exact < 0 ? 10 : exact;
}

function getDurationText(plan) {
  const raw = `${plan.id || ""} ${plan.name || ""}`.toLowerCase();
  if (/one.time|single|3.day/.test(raw)) return "3-day access";
  if (/3.month|three.month|quarter/.test(raw)) return "3 months access";
  if (/6.month|six.month|half.year/.test(raw)) return "6 months access";
  if (/annual|year|12.month/.test(raw)) return "12 months access";
  return plan.renewal || "CV Builder access";
}

function PlanCard({ plan, onSelect, busy, index, reduceMotion }) {
  const featured = Boolean(plan.highlight);
  const benefits = Array.isArray(plan.features) ? plan.features : [];

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.09, 0.36), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      className={`group relative flex h-full min-w-0 flex-col rounded-[24px] border bg-surface p-5 shadow-[0_8px_34px_rgba(7,24,63,0.045)] transition-[border-color,box-shadow] duration-300 hover:shadow-[0_18px_48px_rgba(7,24,63,0.10)] sm:p-6 ${
        featured
          ? "border-accent shadow-[0_12px_42px_rgba(22,212,207,0.12)]"
          : "border-border hover:border-accent/50"
      }`}
    >
      {featured && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.18 + index * 0.08 }}
          className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-[#07183F]">
          <Sparkles size={13} aria-hidden="true" /> Most popular
        </motion.div>
      )}

      <div className={featured ? "" : "pt-1"}>
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-[19px] font-bold leading-tight tracking-[-0.035em] text-text-primary sm:text-[20px]">
            {plan.name}
          </p>
          {!featured && plan.discount && (
            <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-text-primary">
              {plan.discount}
            </span>
          )}
        </div>
        <p className="mt-2 min-h-[36px] text-[12px] leading-[1.65] text-text-secondary">
          {plan.smallText || getDurationText(plan)}
        </p>
      </div>

      <div className="mt-6 border-b border-border pb-6">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[clamp(2.25rem,3.5vw,3rem)] font-bold leading-none tracking-[-0.065em] text-text-primary">
            {plan.price}
          </span>
          {plan.oldPrice && (
            <span className="text-[13px] text-text-muted line-through">{plan.oldPrice}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-text-secondary">{getDurationText(plan)}</p>
        {plan.renewal && (
          <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{plan.renewal}</p>
        )}
      </div>

      <div className="flex-1 py-6">
        <p className="text-[12px] font-semibold text-text-primary">Included in your plan</p>
        <ul className="mt-4 space-y-3.5">
          {benefits.map((feature, index) => (
            <li key={`${index}-${feature}`} className="flex items-start gap-2.5 text-[12px] leading-[1.6] text-text-secondary sm:text-[13px]">
              <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-[#078C88] dark:text-accent">
                <Check size={12} strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
<motion.button
  type="button"
  whileHover={reduceMotion || busy ? undefined : { scale: 1.018 }}
  whileTap={reduceMotion || busy ? undefined : { scale: 0.985 }}
  transition={{ type: "spring", stiffness: 360, damping: 26 }}
  onClick={() => onSelect(plan)}
  disabled={busy}
  className={`mt-auto inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${
    featured
      ? "bg-accent text-[#07183F] hover:brightness-95"
      : "bg-[#07183F] text-white hover:bg-[#102B66] dark:border dark:border-border dark:bg-background-muted dark:text-text-primary dark:hover:border-accent"
  }`}
>
  {busy ? "Opening checkout..." : "Choose plan"}

  {!busy && (
    <ArrowRight
      size={16}
      strokeWidth={1.9}
      aria-hidden="true"
    />
  )}
</motion.button>
    </motion.article>
  );
}

export default function PricingContent() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  // Next.js requires this Client Component to be inside a Suspense boundary
  // when /pricing is statically prerendered. See app/pricing/page.js.
  const searchParams = useSearchParams();
  const { status } = useSession();
  const cvId = searchParams.get("cvId") || "";
  const template = searchParams.get("template") || "";
  const navigationLock = useRef(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const plans = useMemo(
    () =>
      pricingPlans
        .filter((plan) => (plan.serviceId || "cv-builder") === "cv-builder")
        .filter((plan) => !plan.contactOnly && plan.type !== "contact")
        .sort((a, b) => getPlanPriority(a) - getPlanPriority(b)),
    []
  );

  function goToCheckout(plan) {
    if (navigationLock.current || status === "loading") return;
    navigationLock.current = true;
    setSelectedPlanId(plan.id);

    // Preserve original checkout contract: plan, service, cvId and template.
    const params = new URLSearchParams();
    params.set("plan", plan.id);
    params.set("service", "cv-builder");
    if (cvId) params.set("cvId", cvId);
    if (template) params.set("template", template);
    const checkoutUrl = `/checkout?${params.toString()}`;

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(checkoutUrl)}`);
    } else {
      router.push(checkoutUrl);
    }
    // The navigation changes the route; keep locked until unmount to avoid
    // duplicate pushes from double-clicks.
  }

  return (
    <>
    <PricingHeader/>
    <main className="min-h-screen bg-background text-text-primary">
      <section className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pb-28 xl:px-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[780px] text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-2 text-[11px] font-semibold text-text-primary">
            <FileText size={14} className="text-[#078C88] dark:text-accent" aria-hidden="true" />
            QORLIQ CV · Simple pricing
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4.6rem)] font-semibold leading-[1.09] tracking-[-0.07em] text-text-primary">
            The right plan for your <span className="text-[#089D98] dark:text-accent">next opportunity.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[600px] text-[14px] leading-[1.85] text-text-secondary sm:text-[16px]">
            Create, update and download your professional CV. Choose the access period that works for you.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-medium text-text-secondary">
            {["PDF export", "Word export", "Professional templates"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#089D98] dark:text-accent" aria-hidden="true" />{item}
              </span>
            ))}
          </div>
        </motion.div>

        {plans.length === 0 ? (
          <div role="status" className="mx-auto mt-14 max-w-lg rounded-2xl border border-border bg-surface p-8 text-center text-sm text-text-secondary">
            CV Builder plans are currently unavailable. Please try again later.
          </div>
        ) : (
          <div className="mx-auto mt-12 grid max-w-[1280px] items-stretch gap-4 sm:mt-14 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={index}
                reduceMotion={reduceMotion}
                onSelect={goToCheckout}
                busy={selectedPlanId === plan.id || status === "loading" || selectedPlanId !== null}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mt-9 flex max-w-[950px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-5 py-5 text-center sm:flex-row sm:gap-4 sm:text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-[#078C88] dark:text-accent">
            <ShieldCheck size={20} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p className="text-[12px] leading-relaxed text-text-secondary sm:text-[13px]">
            Choose your plan with confidence. You’ll review the payment details at checkout before completing your purchase.
          </p>
        </motion.div>
      </section>
    </main>
    <CustomerHiredAt/>
    <CustomerReviews/>
    <CVBuilderFooter/>
    </>
  );
}
