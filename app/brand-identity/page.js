"use client";

import { useRouter } from "next/navigation";

export default function BrandIdentityPage() {
  const router = useRouter();

  const goToPricing = () => {
    router.push("/pricing?service=logo-design");
  };

  const processSteps = [
    {
      number: "01",
      title: "Tell us your brand direction",
      desc: "Share your business name, industry, preferred style, colours and any examples you like.",
    },
    {
      number: "02",
      title: "Choose your logo plan",
      desc: "Continue to the pricing page and select the logo package that fits your project.",
    },
    {
      number: "03",
      title: "Design work begins",
      desc: "After checkout, your order details are prepared for the design process and delivery.",
    },
  ];

  const deliverables = [
    "Premium logo direction",
    "Clean brand colour system",
    "Transparent PNG files",
    "Web and social-ready files",
    "Revision support",
    "Professional final delivery",
  ];

  return (
    <div className="min-h-screen bg-[#f7f1e4] text-black selection:bg-qorliqGold selection:text-black">
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#050505] px-5 py-24 text-white md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(198,163,93,.26),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,.09),transparent_30%),linear-gradient(135deg,rgba(198,163,93,.10),transparent_45%)]" />
          <div className="absolute left-[-220px] top-[-180px] h-[560px] w-[560px] rounded-full bg-qorliqGold/25 blur-3xl" />
          <div className="absolute bottom-[-260px] right-[-200px] h-[650px] w-[650px] rounded-full bg-[#4A3A20]/40 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f7f1e4] to-transparent" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-7 inline-flex rounded-full border border-qorliqGold/35 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#F3D88B]">
                Logo Design Service
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
                Build a sharper brand identity with a premium logo design.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
                Professional logo design for startups, small businesses and
                growing brands. Choose your logo plan on the pricing page and
                continue with a clean checkout flow.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={goToPricing}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-8 py-4 text-sm font-black text-black shadow-xl shadow-qorliqGold/20 transition hover:scale-[1.02] hover:shadow-qorliqGold/30"
                >
                  View Logo Plans
                </button>

                <a
                  href="/#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-black text-white transition hover:border-qorliqGold hover:text-qorliqGold"
                >
                  Back to Services
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {["Premium Look", "Fast Start", "Brand Ready"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-xl"
                  >
                    <p className="text-sm font-black text-qorliqGold">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* PREVIEW CARD */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[3rem] bg-qorliqGold/20 blur-2xl" />

              <div className="relative rounded-[2.6rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[2rem] bg-white p-6 text-black shadow-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8A6A35]">
                        Brand Preview
                      </p>
                      <h3 className="mt-3 text-4xl font-black tracking-[-0.06em]">
                        QORLIQ
                      </h3>
                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-black text-qorliqGold">
                      Q
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <div className="h-24 rounded-2xl bg-black shadow-inner" />
                    <div className="h-24 rounded-2xl bg-qorliqGold shadow-inner" />
                    <div className="h-24 rounded-2xl bg-[#f7f1e4] ring-1 ring-black/10" />
                  </div>

                  <div className="mt-7 rounded-[1.5rem] bg-[#f7f1e4] p-5">
                    <p className="text-sm font-black">
                      Modern identity system
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/55">
                      Logo concept, colours, file preparation and visual
                      direction for online brand presentation.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-black/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-black/40">
                        Style
                      </p>
                      <p className="mt-2 text-lg font-black text-[#8A6A35]">
                        Premium
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-black/40">
                        Output
                      </p>
                      <p className="mt-2 text-lg font-black text-[#8A6A35]">
                        Digital Ready
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goToPricing}
                    className="mt-6 w-full rounded-full bg-black px-6 py-4 text-sm font-black text-white transition hover:bg-qorliqGold hover:text-black"
                  >
                    Continue to Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8A6A35]">
                  How it works
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
                  A simple design flow before checkout.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">
                  This page explains the logo service. Package selection and
                  payment are handled on the pricing page, so the flow stays
                  clean and professional.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {processSteps.map((step) => (
                  <div
                    key={step.number}
                    className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
                  >
                    <p className="text-sm font-black text-[#8A6A35]">
                      {step.number}
                    </p>

                    <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-black/55">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section className="px-5 pb-20">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.6rem] bg-black p-6 text-white shadow-2xl md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-qorliqGold">
                What you receive
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                Professional assets prepared for your brand launch.
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/60">
                The exact package details and prices are available on the
                pricing page. This section keeps the service page focused on
                quality, process and delivery.
              </p>

              <button
                type="button"
                onClick={goToPricing}
                className="mt-7 rounded-full bg-qorliqGold px-7 py-4 text-sm font-black text-black transition hover:bg-white"
              >
                Open Logo Pricing
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {deliverables.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-qorliqGold text-sm font-black text-black">
                    ✓
                  </span>

                  <p className="text-sm font-bold leading-6 text-white/75">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-7xl rounded-[2.6rem] border border-black/10 bg-white p-8 text-center shadow-sm md:p-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8A6A35]">
              Ready to start?
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
              Continue to the pricing page and choose the right logo plan.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/55">
              Select your logo package, complete checkout and start your brand
              identity order with a clean step-by-step flow.
            </p>

            <button
              type="button"
              onClick={goToPricing}
              className="mt-8 rounded-full bg-black px-9 py-4 text-sm font-black text-white transition hover:bg-qorliqGold hover:text-black"
            >
              Go to Pricing
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}