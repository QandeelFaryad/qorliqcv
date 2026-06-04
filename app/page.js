"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import SectionTitle from "@/components/SectionTitle";
import TemplatePreview from "@/components/TemplatePreview";
import { cvTemplates, partners, services } from "@/lib/data";

const serviceCategories = ["All", "Build", "Grow", "Creative", "Automate", "Product"];

const defaultOffers = [
  "Professional consultation and planning",
  "Premium quality digital delivery",
  "Business-focused setup and support",
];

function getServiceCategory(service) {
  if (service.category) return service.category;

  if (service.id === "website-development") return "Build";
  if (service.id === "application-development") return "Build";
  if (service.id === "cv-builder") return "Product";
  if (service.id === "lead-generation") return "Grow";

  if (service.id === "brand-identity") return "Creative";
  if (service.id === "logo-design") return "Creative";

  if (service.id === "ads") return "Grow";
  if (service.id === "paid-advertisement") return "Grow";

  if (service.id === "microsoft-reseller") return "Automate";

  return "Build";
}
function getServicePrice(service) {
  if (service.price) return service.price;

  if (service.id === "website-development") return "From £250";
  if (service.id === "application-development") return "Custom";
  if (service.id === "cv-builder") return "From £1.99";
  if (service.id === "lead-generation") return "From £199";

  if (service.id === "brand-identity") return "From £30";
  if (service.id === "logo-design") return "From £30";

  if (service.id === "ads") return "From £30";
  if (service.id === "paid-advertisement") return "From £30";

  if (service.id === "microsoft-reseller") return "Quote";

  return "Quote";
}

function getServiceOffers(service) {
  return Array.isArray(service.offers) && service.offers.length > 0
    ? service.offers
    : defaultOffers;
}

export default function HomePage() {
  const [selected, setSelected] = useState(null);
  const [openService, setOpenService] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const servicesWithMeta = useMemo(() => {
    return services.map((service) => ({
      ...service,
      category: getServiceCategory(service),
      price: getServicePrice(service),
      offers: getServiceOffers(service),
    }));
  }, []);

  const filteredServices = useMemo(() => {
    if (activeCategory === "All") return servicesWithMeta;
    return servicesWithMeta.filter((item) => item.category === activeCategory);
  }, [activeCategory, servicesWithMeta]);

  const chosen = useMemo(() => {
    return servicesWithMeta.find((item) => item.id === selected) || null;
  }, [selected, servicesWithMeta]);

  const activeService = useMemo(() => {
    return servicesWithMeta.find((item) => item.id === openService) || null;
  }, [openService, servicesWithMeta]);

  const handleChooseService = (serviceId) => {
    setSelected(serviceId);
    setOpenService(serviceId);
  };

  const handleRequestService = () => {
    setOpenService(null);

    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-qorliqCream text-black selection:bg-qorliqGold selection:text-black">
      <main>
        {/* HERO */}
        <section
          id="home"
          className="relative overflow-hidden bg-[#050505] px-5 py-24 text-white md:py-32"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,163,93,.22),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,.08),transparent_30%),linear-gradient(135deg,rgba(198,163,93,.08),transparent_42%)]" />
          <div className="hero-grid absolute inset-0 opacity-[0.12]" />
          <div className="absolute left-[-180px] top-[-160px] h-[540px] w-[540px] rounded-full bg-qorliqGold/25 blur-3xl" />
          <div className="absolute bottom-[-260px] right-[-180px] h-[620px] w-[620px] rounded-full bg-[#4A3A20]/35 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-qorliqCream to-transparent" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <div className="mb-7 inline-flex rounded-full border border-qorliqGold/35 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#F3D88B]">
                Premium Web · Branding · Growth Agency
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
                We build premium digital systems that help brands look serious,
                generate leads and grow faster.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Qorliq Digital creates websites, e-commerce stores, custom
                platforms, brand identities, lead-generation systems and digital
                products for modern businesses.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-7 py-4 text-sm font-black text-black shadow-xl shadow-qorliqGold/20 transition hover:scale-[1.02]"
                >
                  Request a Quote
                </a>

                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-black text-white transition hover:border-qorliqGold hover:text-qorliqGold"
                >
                  View Services
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  ["6+", "Core Services"],
                  ["10", "CV Templates"],
                  ["Full", "Digital Systems"],
                ].map(([num, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <p className="text-2xl font-black text-qorliqGold">{num}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-qorliqGold/30" />

              <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[1.8rem] bg-[#111] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-qorliqGold" />
                      <span className="h-3 w-3 rounded-full bg-white/30" />
                      <span className="h-3 w-3 rounded-full bg-white/20" />
                    </div>
                    <div className="h-2 w-28 rounded-full bg-white/15" />
                  </div>

                  <div className="mt-6 rounded-3xl bg-white p-6 text-black">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8A6A35]">
                      Growth Dashboard
                    </p>

                    <h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                      Brand Performance Suite
                    </h3>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Web", "+64%"],
                        ["Leads", "+42%"],
                        ["SEO", "+38%"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-qorliqCream p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-black/45">
                            {label}
                          </p>
                          <p className="mt-4 text-2xl font-black text-[#8A6A35]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="h-3 w-full rounded-full bg-black/10" />
                      <div className="h-3 w-10/12 rounded-full bg-black/10" />
                      <div className="h-3 w-7/12 rounded-full bg-black/10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 left-8 rounded-2xl border border-qorliqGold/30 bg-black px-6 py-4 text-white shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-qorliqGold">
                  Strategy · UX · Development · Growth
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PARTNERS */}
        <section id="partners" className="border-y border-black/10 bg-qorliqCream px-5 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-5 text-center text-xs font-black uppercase tracking-[0.3em] text-black/40">
              Platforms and ecosystems we build around
            </p>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-4 text-center shadow-sm"
                >
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-black/70">
                    {partner.name}
                  </p>

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A6A35]">
                    {partner.type}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-black/50">
                    {partner.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <SectionTitle
                label="Services"
                title="Digital solutions built to drive trust, enquiries and sales."
                desc="Our team handles strategy, design, development, launch and ongoing optimisation for brands that want a premium online presence."
              />

              <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
                <p className="text-sm leading-7 text-black/60">
                  From first impression to conversion, Qorliq Digital designs
                  every layer of your customer journey: brand, website,
                  application, campaign, automation and reporting.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {serviceCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                    activeCategory === category
                      ? "border-black bg-black text-qorliqGold"
                      : "border-black/10 bg-white text-black/50 hover:border-qorliqGold hover:text-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="group rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-qorliqGold/60 hover:shadow-2xl hover:shadow-black/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-qorliqCream px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#8A6A35]">
                      {service.category}
                    </span>

                    <span className="rounded-full bg-black px-4 py-2 text-xs font-black text-qorliqGold">
                      {service.price}
                    </span>
                  </div>

                  <h3 className="mt-7 text-2xl font-black tracking-[-0.04em]">
                    {service.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-black/60">
                    {service.desc}
                  </p>

                  <div className="mt-5 space-y-2">
                    {service.offers.slice(0, 3).map((offer, index) => (
                      <div
                        key={`${service.id}-offer-${index}`}
                        className="flex items-start gap-2 text-sm text-black/55"
                      >
                        <span className="mt-1 text-[#8A6A35]">✓</span>
                        <span>{offer}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChooseService(service.id)}
                    className="mt-7 w-full rounded-full bg-black px-5 py-4 text-sm font-black text-white transition group-hover:bg-qorliqGold group-hover:text-black"
                  >
                    Choose This Service
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="bg-black px-5 py-20 text-white">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              label="Featured Work Style"
              title="Project experiences designed for clarity, trust and conversion."
              desc="These concept examples show the type of digital outcomes Qorliq can create for different business models."
              dark
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {[
                [
                  "Luxury Retail Experience",
                  "Premium e-commerce interface focused on visual storytelling, simplified browsing and high-trust checkout.",
                ],
                [
                  "B2B Lead Platform",
                  "Conversion-focused website and lead capture system designed for service businesses and sales teams.",
                ],
                [
                  "Custom Admin Portal",
                  "Secure internal dashboard for customer records, workflow tracking and operational reporting.",
                ],
              ].map(([title, desc], index) => (
                <article
                  key={title}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06]"
                >
                  <div className="h-52 bg-gradient-to-br from-qorliqGold/35 via-white/10 to-black p-5">
                    <div className="flex h-full items-end">
                      <span className="rounded-full bg-black px-4 py-2 text-xs font-black text-qorliqGold">
                        0{index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-black tracking-[-0.04em]">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/60">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="px-5 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionTitle
                label="About Qorliq"
                title="Premium digital execution for businesses that need to look serious online."
                desc="Qorliq Digital combines strategy, creative design, development and marketing systems to help brands move from basic online presence to a professional digital platform."
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["Strategy", "Planning before design"],
                  ["UX", "Clear customer journey"],
                  ["Growth", "Built for enquiries"],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-black/10 bg-white p-5"
                  >
                    <p className="text-lg font-black text-[#8A6A35]">{title}</p>
                    <p className="mt-2 text-xs font-semibold text-black/45">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              {[
                [
                  "Premium First",
                  "Refined visuals, strong typography and carefully structured sections to build trust.",
                ],
                [
                  "Conversion Led",
                  "Calls-to-action, service flow and enquiry paths are designed to create action.",
                ],
                [
                  "Scalable Delivery",
                  "From websites to dashboards, we create systems that can expand as the business grows.",
                ],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-black text-[#8A6A35]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-black/60">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CV BUILDER */}
        <section className="bg-black px-5 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionTitle
                label="Digital Product"
                title="Qorliq CV Builder with 10 ready demo previews."
                desc="A premium digital product inside Qorliq Digital where users select a CV template, build or upload their CV, login, checkout and download PDF/MS Word."
                dark
              />

              <Link
                href="/cv-builder"
                className="mt-9 inline-flex rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-7 py-4 text-sm font-black text-black"
              >
                Open CV Builder
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {cvTemplates.slice(0, 4).map((template) => (
                <TemplatePreview
                  key={template.id}
                  template={template}
                  selected={template.id === "executive-premium"}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="px-5 py-20">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-black p-8 text-white md:p-12">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-qorliqGold">
                Contact Us
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">
                Tell us what you want to build.
              </h2>

              <p className="mt-5 leading-8 text-white/60">
                Select a service and submit your details. Qorliq Digital can
                prepare a proposal, quotation or project direction based on your
                requirement.
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-6">
                <p className="text-sm font-black text-qorliqGold">
                  Selected Option
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  {chosen?.title || "No option selected"}
                </h3>

                <p className="mt-2 text-sm leading-7 text-white/55">
                  {chosen?.desc || "Choose a service above before submitting."}
                </p>
              </div>
            </div>

            <form
              className="grid gap-4 p-8 md:p-12"
              onSubmit={(event) => {
                event.preventDefault();
                alert("Demo enquiry submitted. Connect this form with email/API later.");
              }}
            >
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="rounded-2xl border border-black/10 bg-qorliqCream px-5 py-4 outline-none focus:border-qorliqGold"
                placeholder="Full Name"
              />

              <input
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="rounded-2xl border border-black/10 bg-qorliqCream px-5 py-4 outline-none focus:border-qorliqGold"
                placeholder="Email Address"
              />

              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="rounded-2xl border border-black/10 bg-qorliqCream px-5 py-4 outline-none focus:border-qorliqGold"
                placeholder="Phone Number"
              />

              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                className="min-h-[150px] rounded-2xl border border-black/10 bg-qorliqCream px-5 py-4 outline-none focus:border-qorliqGold"
                placeholder="Tell us what you need"
              />

              <button
                type="submit"
                className="rounded-full bg-black px-6 py-4 text-sm font-black text-white transition hover:bg-qorliqGold hover:text-black"
              >
                Submit Enquiry
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* SERVICE MODAL */}
      {activeService ? (
     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-qorliqGold/30 bg-white text-black shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/10 bg-white/95 p-6 backdrop-blur-xl">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#A87C2A]">
                  Selected Service
                </p>

                <h3 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                  {activeService.title}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-black/55">
                  {activeService.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenService(null)}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-black text-black hover:bg-black hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
              <aside className="rounded-[1.5rem] bg-qorliqCream p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8A6A35]">
                  What we offer
                </p>

                <h4 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                  Included service items
                </h4>

                <p className="mt-3 text-sm leading-7 text-black/55">
                  This list explains what the customer can expect. Final scope
                  can be adjusted after consultation.
                </p>

                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-black">Starting Price</span>
                    <span className="rounded-full bg-black px-4 py-2 text-xs font-black text-qorliqGold">
                      {activeService.price}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-black">Category</span>
                    <span className="rounded-full bg-qorliqGold px-4 py-2 text-xs font-black text-black">
                      {activeService.category}
                    </span>
                  </div>
                </div>
              </aside>

              <section className="rounded-[1.5rem] border border-black/10 bg-white p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeService.offers.map((offer, index) => (
                    <div
                      key={`${activeService.id}-modal-offer-${index}`}
                      className="flex items-start gap-3 rounded-2xl border border-black/10 bg-qorliqCream p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-qorliqGold text-xs font-black text-black">
                        ✓
                      </span>
                      <p className="text-sm font-semibold leading-6 text-black/70">
                        {offer}
                      </p>
                    </div>
                  ))}
                </div>
<div className="mt-6 grid gap-3 sm:grid-cols-2">
  {activeService.id === "cv-builder" ? (
    <Link
      href="/cv-builder"
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      Open CV Builder
    </Link>
  ) : activeService.id === "brand-identity" ||
    activeService.id === "logo-design" ? (
    <Link
      href="/pricing?service=logo-design"
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      View Logo Packages
    </Link>
  ) : activeService.id === "ads" ||
    activeService.id === "paid-advertisement" ? (
    <Link
      href="/pricing?service=ads"
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      View Ads Packages
    </Link>
  ) : activeService.id === "website-development" ? (
    <Link
      href="/pricing?service=website-development"
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      View Website Packages
    </Link>
  ) : activeService.id === "application-development" ? (
    <button
      type="button"
      onClick={handleRequestService}
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      Request App Development
    </button>
  ) : activeService.id === "lead-generation" ? (
    <button
      type="button"
      onClick={handleRequestService}
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      Request Lead Generation
    </button>
  ) : activeService.id === "microsoft-reseller" ? (
    <button
      type="button"
      onClick={handleRequestService}
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      Request Microsoft Support
    </button>
  ) : (
    <button
      type="button"
      onClick={handleRequestService}
      className="rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
    >
      Request This Service
    </button>
  )}

  <button
    type="button"
    onClick={() => setOpenService(null)}
    className="rounded-full border border-black/10 px-5 py-4 text-sm font-black text-black hover:border-qorliqGold"
  >
    Continue Browsing
  </button>
</div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}