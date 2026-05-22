"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import SectionTitle from "@/components/SectionTitle";
import { brandIdentityPackages } from "@/lib/data";

const initialForm = {
  name: "",
  email: "",
  businessName: "",
  phone: "",
  industry: "",
  designStyle: "Luxury / Premium",
  notes: "",
  cardName: "",
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/30",
  cvc: "123",
};

export default function BrandIdentityPage() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [form, setForm] = useState(initialForm);

  const activeTotal = useMemo(() => {
    return selectedPackage?.price || "£0";
  }, [selectedPackage]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCheckout = (pkg) => {
    setSelectedPackage(pkg);
    setCheckoutComplete(false);
  };

  const closeCheckout = () => {
    setSelectedPackage(null);
    setCheckoutComplete(false);
  };

  const requiredReady =
    form.name.trim() &&
    form.email.trim() &&
    form.businessName.trim() &&
    form.phone.trim();

  return (
    <div className="min-h-screen bg-qorliqCream text-black selection:bg-qorliqGold selection:text-black">
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#050505] px-5 py-24 text-white md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,163,93,.22),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,.08),transparent_30%),linear-gradient(135deg,rgba(198,163,93,.08),transparent_42%)]" />
          <div className="hero-grid absolute inset-0 opacity-[0.12]" />
          <div className="absolute left-[-180px] top-[-160px] h-[540px] w-[540px] rounded-full bg-qorliqGold/25 blur-3xl" />
          <div className="absolute bottom-[-260px] right-[-180px] h-[620px] w-[620px] rounded-full bg-[#4A3A20]/35 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-qorliqCream to-transparent" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-7 inline-flex rounded-full border border-qorliqGold/35 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#F3D88B]">
                Brand Identity Packages
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
                Premium logo and brand-kit packages for businesses that need a
                sharper identity.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Choose a simple logo-only package or a complete starter brand
                kit. This demo checkout can later be connected with Stripe,
                PayPal, Apple Pay or Google Pay.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#packages"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-7 py-4 text-sm font-black text-black shadow-xl shadow-qorliqGold/20 transition hover:scale-[1.02]"
                >
                  View Packages
                </a>

                <a
                  href="/#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-black text-white transition hover:border-qorliqGold hover:text-qorliqGold"
                >
                  Back to Services
                </a>
              </div>
            </div>

            <div className="rounded-[2.4rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.8rem] bg-white p-6 text-black">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8A6A35]">
                  Brand Preview
                </p>

                <h3 className="mt-3 text-4xl font-black tracking-[-0.06em]">
                  QORLIQ
                </h3>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="h-24 rounded-2xl bg-black" />
                  <div className="h-24 rounded-2xl bg-qorliqGold" />
                  <div className="h-24 rounded-2xl bg-qorliqCream ring-1 ring-black/10" />
                </div>

                <div className="mt-6 rounded-2xl bg-qorliqCream p-5">
                  <p className="text-sm font-black">Logo + Brand Kit</p>
                  <p className="mt-2 text-sm leading-6 text-black/55">
                    Logo suite, colours, typography, mini guidelines and social
                    identity direction.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-black/40">
                      Starter
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#8A6A35]">
                      £60
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-black/40">
                      Brand Kit
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#8A6A35]">
                      £299
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PACKAGES */}
        <section id="packages" className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              label="Packages"
              title="Choose your brand identity package."
              desc="Logo Only is kept affordable at £60 with unlimited revisions. Logo + Brand Kit is priced as an accessible international-style starter package for small businesses."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {brandIdentityPackages.map((pkg) => {
                const isFeatured = pkg.id === "logo-brand-kit";

                return (
                  <article
                    key={pkg.id}
                    className={`rounded-[2.4rem] border p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 ${
                      isFeatured
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                            isFeatured
                              ? "bg-qorliqGold text-black"
                              : "bg-qorliqCream text-[#8A6A35]"
                          }`}
                        >
                          {pkg.badge}
                        </span>

                        <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">
                          {pkg.name}
                        </h2>

                        <p
                          className={`mt-3 text-sm leading-7 ${
                            isFeatured ? "text-white/60" : "text-black/60"
                          }`}
                        >
                          {pkg.description}
                        </p>
                      </div>

                      <p className="shrink-0 text-5xl font-black text-qorliqGold">
                        {pkg.price}
                      </p>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {pkg.features.map((feature) => (
                        <div
                          key={feature}
                          className={`flex items-start gap-3 rounded-2xl p-4 ${
                            isFeatured ? "bg-white/[0.06]" : "bg-qorliqCream"
                          }`}
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-qorliqGold text-xs font-black text-black">
                            ✓
                          </span>

                          <p
                            className={`text-sm font-semibold leading-6 ${
                              isFeatured ? "text-white/70" : "text-black/70"
                            }`}
                          >
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => openCheckout(pkg)}
                      className={`mt-8 w-full rounded-full px-6 py-4 text-sm font-black transition ${
                        isFeatured
                          ? "bg-qorliqGold text-black hover:bg-white"
                          : "bg-black text-white hover:bg-qorliqGold hover:text-black"
                      }`}
                    >
                      Start Checkout
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="bg-black px-5 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            {[
              [
                "Unlimited revisions",
                "Logo-only customers can request revisions until the selected direction is approved.",
              ],
              [
                "Clear delivery",
                "The final files are prepared for website, social media and basic print use.",
              ],
              [
                "Brand-ready system",
                "The brand kit package gives colours, fonts and visual usage direction for consistent presentation.",
              ],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7"
              >
                <h3 className="text-2xl font-black text-qorliqGold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CHECKOUT MODAL */}
      {selectedPackage ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-qorliqGold/30 bg-white text-black shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/10 bg-white/95 p-6 backdrop-blur-xl">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#A87C2A]">
                  Brand Identity Checkout
                </p>

                <h3 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                  {checkoutComplete ? "Order Submitted" : selectedPackage.name}
                </h3>

                <p className="mt-1 text-sm text-black/55">
                  {checkoutComplete
                    ? "Your demo order is complete. Connect this flow to payment and order storage before going live."
                    : "Complete the details below to start the brand identity order."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-black text-black hover:bg-black hover:text-white"
              >
                Close
              </button>
            </div>

            {!checkoutComplete ? (
              <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
                <aside className="space-y-5">
                  <div className="rounded-[1.5rem] bg-qorliqCream p-6">
                    <h4 className="text-xl font-black">Order Summary</h4>

                    <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black">
                            {selectedPackage.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-black/50">
                            {selectedPackage.description}
                          </p>
                        </div>

                        <p className="text-3xl font-black text-[#A87C2A]">
                          {activeTotal}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm text-black/65">
                        {selectedPackage.features.slice(0, 5).map((feature) => (
                          <div
                            key={feature}
                            className="flex justify-between gap-4"
                          >
                            <span>{feature}</span>
                            <span className="font-bold text-[#8A6A35]">
                              Included
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-black/10 bg-white p-6">
                    <h4 className="text-xl font-black">Payment Method</h4>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ["card", "Card", "💳"],
                        ["paypal", "PayPal", "P"],
                        ["apple", "Apple Pay", "A"],
                        ["google", "Google Pay", "G"],
                      ].map(([method, label, icon]) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            paymentMethod === method
                              ? "border-qorliqGold bg-qorliqCream"
                              : "border-black/10 bg-white"
                          }`}
                        >
                          <span className="text-2xl font-black">{icon}</span>
                          <p className="mt-2 text-sm font-black">{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                <section className="rounded-[1.5rem] border border-black/10 bg-white p-6">
                  <h4 className="text-2xl font-black">Project Details</h4>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateForm("name", event.target.value)
                      }
                      placeholder="Full name *"
                      className="rounded-2xl border border-black/10 bg-qorliqCream px-4 py-3 outline-none focus:border-qorliqGold"
                    />

                    <input
                      value={form.email}
                      onChange={(event) =>
                        updateForm("email", event.target.value)
                      }
                      placeholder="Email address *"
                      className="rounded-2xl border border-black/10 bg-qorliqCream px-4 py-3 outline-none focus:border-qorliqGold"
                    />

                    <input
                      value={form.businessName}
                      onChange={(event) =>
                        updateForm("businessName", event.target.value)
                      }
                      placeholder="Business / brand name *"
                      className="rounded-2xl border border-black/10 bg-qorliqCream px-4 py-3 outline-none focus:border-qorliqGold"
                    />

                    <input
                      value={form.phone}
                      onChange={(event) =>
                        updateForm("phone", event.target.value)
                      }
                      placeholder="Phone number *"
                      className="rounded-2xl border border-black/10 bg-qorliqCream px-4 py-3 outline-none focus:border-qorliqGold"
                    />

                    <input
                      value={form.industry}
                      onChange={(event) =>
                        updateForm("industry", event.target.value)
                      }
                      placeholder="Industry"
                      className="rounded-2xl border border-black/10 bg-qorliqCream px-4 py-3 outline-none focus:border-qorliqGold"
                    />

                    <select
                      value={form.designStyle}
                      onChange={(event) =>
                        updateForm("designStyle", event.target.value)
                      }
                      className="rounded-2xl border border-black/10 bg-qorliqCream px-4 py-3 outline-none focus:border-qorliqGold"
                    >
                      <option>Luxury / Premium</option>
                      <option>Minimal / Modern</option>
                      <option>Corporate / Professional</option>
                      <option>Creative / Bold</option>
                      <option>Tech / Futuristic</option>
                    </select>
                  </div>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    placeholder="Tell us your preferred colours, competitors, examples, slogan, or any special instruction"
                    className="mt-3 min-h-[120px] w-full rounded-2xl border border-black/10 bg-qorliqCream px-4 py-3 outline-none focus:border-qorliqGold"
                  />

                  {paymentMethod === "card" ? (
                    <div className="mt-5 rounded-[1.5rem] bg-qorliqCream p-5">
                      <h5 className="font-black">Card Details</h5>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input
                          value={form.cardName}
                          onChange={(event) =>
                            updateForm("cardName", event.target.value)
                          }
                          placeholder="Name on card"
                          className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-qorliqGold"
                        />

                        <input
                          value={form.cardNumber}
                          onChange={(event) =>
                            updateForm("cardNumber", event.target.value)
                          }
                          placeholder="Card number"
                          className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-qorliqGold"
                        />

                        <input
                          value={form.expiry}
                          onChange={(event) =>
                            updateForm("expiry", event.target.value)
                          }
                          placeholder="MM/YY"
                          className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-qorliqGold"
                        />

                        <input
                          value={form.cvc}
                          onChange={(event) =>
                            updateForm("cvc", event.target.value)
                          }
                          placeholder="CVC"
                          className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-qorliqGold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] bg-qorliqCream p-5 text-center">
                      <p className="text-xl font-black">
                        {paymentMethod === "paypal"
                          ? "PayPal"
                          : paymentMethod === "apple"
                          ? "Apple Pay"
                          : "Google Pay"}{" "}
                        Demo Payment
                      </p>

                      <p className="mt-2 text-sm text-black/55">
                        Connect this wallet securely before going live.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-black/10 bg-qorliqCream p-4 text-sm text-black/60">
                    <strong>Total today:</strong> {activeTotal} · Demo checkout
                    only.
                  </div>

                  <button
                    type="button"
                    disabled={!requiredReady}
                    onClick={() => setCheckoutComplete(true)}
                    className={`mt-5 w-full rounded-full px-5 py-4 text-sm font-black transition ${
                      requiredReady
                        ? "bg-black text-white hover:bg-qorliqGold hover:text-black"
                        : "cursor-not-allowed bg-black/20 text-black/35"
                    }`}
                  >
                    Complete Demo Checkout
                  </button>

                  {!requiredReady ? (
                    <p className="mt-3 text-center text-xs font-semibold text-black/45">
                      Please fill name, email, business name and phone number.
                    </p>
                  ) : null}
                </section>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-qorliqGold text-4xl font-black text-black">
                  ✓
                </div>

                <h4 className="mt-6 text-4xl font-black tracking-[-0.04em]">
                  Brand order received
                </h4>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-black/55">
                  Package: {selectedPackage.name} · Total:{" "}
                  {selectedPackage.price}. A production version should save this
                  order to the database and trigger confirmation email/admin
                  notification.
                </p>

                <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-qorliqCream p-5 text-left text-sm leading-7 text-black/65">
                  <p>
                    <strong>Business:</strong>{" "}
                    {form.businessName || "Not provided"}
                  </p>
                  <p>
                    <strong>Style:</strong> {form.designStyle}
                  </p>
                  <p>
                    <strong>Email:</strong> {form.email || "Not provided"}
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    {paymentMethod === "card"
                      ? "Card"
                      : paymentMethod === "paypal"
                      ? "PayPal"
                      : paymentMethod === "apple"
                      ? "Apple Pay"
                      : "Google Pay"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="mt-8 rounded-full bg-black px-8 py-4 text-sm font-black text-white hover:bg-qorliqGold hover:text-black"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}