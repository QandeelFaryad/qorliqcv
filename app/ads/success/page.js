"use client";

import { useState } from "react";
import {

  CheckCircle,
  Megaphone,
  Target,
  Globe2,
  Wallet,
  Phone,
  X,
  CalendarDays,
} from "lucide-react";

const COUNTRY_CODES = [
  { flag: "🇬🇧", name: "United Kingdom", code: "+44" },
  { flag: "🇺🇸", name: "United States", code: "+1" },
  { flag: "🇦🇪", name: "United Arab Emirates", code: "+971" },
  { flag: "🇸🇦", name: "Saudi Arabia", code: "+966" },
  { flag: "🇵🇰", name: "Pakistan", code: "+92" },
  { flag: "🇮🇳", name: "India", code: "+91" },
  { flag: "🇨🇦", name: "Canada", code: "+1" },
  { flag: "🇦🇺", name: "Australia", code: "+61" },
  { flag: "🇩🇪", name: "Germany", code: "+49" },
  { flag: "🇫🇷", name: "France", code: "+33" },
  { flag: "🇮🇹", name: "Italy", code: "+39" },
  { flag: "🇪🇸", name: "Spain", code: "+34" },
];

export default function AdsServiceSuccessPage() {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);

  function handleSubmit(e) {
    e.preventDefault();

    // Later:
    // 1. Upload files/assets to Cloudinary
    // 2. Submit ads brief data to your API
    // 3. Save Cloudinary URLs + campaign brief in MongoDB

    setShowSuccessPopup(true);
  }

  return (
    <section className="min-h-screen bg-[#070707] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Success Header */}
        <div className="mb-8 rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-6 shadow-2xl shadow-emerald-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <CheckCircle className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                Payment Successful
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Complete Your Paid Ads Brief
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Please share your business, audience, budget and campaign goals
                so our team can prepare your paid advertising strategy.
              </p>
            </div>
          </div>
        </div>

        {/* Package Summary */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Selected Package"
            value="Campaign Setup"
            valueClass="text-white"
          />

          <SummaryCard
            label="Payment Status"
            value="Paid"
            valueClass="text-emerald-300"
          />

          <SummaryCard
            label="Order Status"
            value="Awaiting Brief"
            valueClass="text-[#d7b56d]"
          />
        </div>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-white/10 bg-[#101010] p-5 shadow-2xl shadow-black/40 sm:p-8"
        >
          {/* Section 1 */}
          <FormSection
            icon={<Megaphone className="h-5 w-5" />}
            title="Business Information"
            description="Tell us about your company and what you want to advertise."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Full Name" placeholder="Enter your full name" />

              <Input label="Email Address" placeholder="your@email.com" />

              <PhoneInput
                label="Phone / WhatsApp"
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
              />

              <Input
                label="Company / Brand Name"
                placeholder="Your business name"
              />

              <Input
                label="Website / Landing Page"
                placeholder="https://example.com"
              />

              <Input
                label="Business Industry"
                placeholder="Ecommerce, real estate, beauty, agency..."
              />

              <Textarea
                label="What product or service do you want to promote?"
                placeholder="Briefly explain your product, service, offer or campaign..."
                className="md:col-span-2"
              />
            </div>
          </FormSection>

          {/* Section 2 */}
          <FormSection
            icon={<Target className="h-5 w-5" />}
            title="Campaign Goals"
            description="Choose what you want this campaign to achieve."
          >
            <div>
              <Label title="Main Campaign Objective" />

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Get More Leads",
                  "Increase Sales",
                  "Website Traffic",
                  "Brand Awareness",
                  "App Installs",
                  "Messages / WhatsApp",
                  "Bookings",
                  "Store Visits",
                  "Not Sure",
                ].map((item) => (
                  <OptionCard key={item} label={item} />
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Primary Offer"
                placeholder="20% off, free consultation, limited deal..."
              />

              <Input
                label="Expected Result"
                placeholder="Example: 100 leads, more calls, more sales..."
              />

              <Input
                label="Preferred Start Date"
                placeholder="Example: 15 July 2026"
              />

              <Input
                label="Campaign Duration"
                placeholder="Example: 7 days, 30 days, 3 months..."
              />
            </div>
          </FormSection>

          {/* Section 3 */}
          <FormSection
            icon={<Globe2 className="h-5 w-5" />}
            title="Platforms & Audience"
            description="Select platforms and describe your target customers."
          >
            <div>
              <Label title="Advertising Platforms" />

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Google Ads",
                  "Facebook Ads",
                  "Instagram Ads",
                  "TikTok Ads",
                  "Snapchat Ads",
                  "YouTube Ads",
                  "LinkedIn Ads",
                  "Designer Suggestion",
                ].map((item) => (
                  <OptionCard key={item} label={item} />
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Target Country / City"
                placeholder="UK, London, Dubai, Riyadh..."
              />

              <Input
                label="Target Audience Age"
                placeholder="Example: 18-35, 25-45..."
              />

              <Input
                label="Target Gender"
                placeholder="Male, female, all..."
              />

              <Input
                label="Customer Type"
                placeholder="Consumers, businesses, students, families..."
              />

              <Textarea
                label="Describe Your Ideal Customer"
                placeholder="Who should see your ads? Mention interests, needs, problems, buying behavior..."
                className="md:col-span-2"
              />
            </div>
          </FormSection>

          {/* Section 4 */}
          <FormSection
            icon={<Wallet className="h-5 w-5" />}
            title="Budget & Tracking"
            description="Tell us your ad spend budget and existing tracking setup."
          >
            <div className="rounded-3xl border border-amber-400/15 bg-amber-400/10 p-5">
              <p className="text-sm leading-6 text-amber-100/80">
                Note: Your package fee is for our service only. Advertising
                budget is paid separately to platforms like Google, Meta,
                TikTok, Snapchat or LinkedIn.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Daily Ad Budget"
                placeholder="Example: £10/day, £50/day..."
              />

              <Input
                label="Monthly Ad Budget"
                placeholder="Example: £300/month, £1000/month..."
              />

              <Input
                label="Do You Have Ad Accounts?"
                placeholder="Yes / No / Need setup"
              />

              <Input
                label="Tracking Installed?"
                placeholder="Pixel, Google Analytics, Tag Manager..."
              />

              <Textarea
                label="Previous Advertising Experience"
                placeholder="Have you run ads before? What worked or did not work?"
                className="md:col-span-2"
              />
            </div>
          </FormSection>

          {/* Section 5 */}
          <FormSection
            icon={<CalendarDays className="h-5 w-5" />}
            title="Competitors, Creatives & Notes"
            description="Share references, assets and extra instructions for the campaign."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Textarea
                label="Competitor Links"
                placeholder="Paste competitor websites, ads, social pages or brands you like..."
              />

              <Textarea
                label="Creative Direction"
                placeholder="What style should the ads have? Premium, bold, luxury, simple, urgent..."
              />

              <Textarea
                label="Ad Copy Ideas"
                placeholder="Any headline, offer, slogan or message you want to include?"
              />

              <Textarea
                label="Additional Instructions"
                placeholder="Any special requirements, deadline or important campaign details..."
              />
            </div>

           
          </FormSection>

          {/* Submit */}
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-white/50">
              After submission, your ads order will move to campaign review.
            </p>

            <button
              type="submit"
              className="rounded-2xl bg-[#d7b56d] px-7 py-4 text-sm font-black text-black shadow-lg shadow-[#d7b56d]/20 transition hover:bg-[#f0cd82]"
            >
              Submit Ads Campaign Brief
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[30px] border border-emerald-400/20 bg-[#101010] p-7 text-center shadow-2xl shadow-black/60">
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <CheckCircle className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">
              Form Submitted Successfully
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Thank you for submitting your ads campaign brief. Our team will
              review your details and contact you soon.
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 w-full rounded-2xl bg-[#d7b56d] px-5 py-3.5 text-sm font-black text-black transition hover:bg-[#f0cd82]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SummaryCard({ label, value, valueClass = "" }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>

      <h3 className={`mt-2 text-lg font-extrabold ${valueClass}`}>{value}</h3>
    </div>
  );
}

function FormSection({ icon, title, description, children }) {
  return (
    <div className="border-b border-white/10 py-8 last:border-b-0">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d7b56d]/10 text-[#d7b56d]">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">{title}</h2>

          <p className="mt-1 text-sm text-white/50">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

function Label({ title }) {
  return <label className="text-sm font-bold text-white/80">{title}</label>;
}

function Input({ label, placeholder, className = "" }) {
  return (
    <div className={className}>
      <Label title={label} />

      <input
        type="text"
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#d7b56d]/70 focus:bg-black/50"
      />
    </div>
  );
}

function PhoneInput({ label, selectedCountry, setSelectedCountry }) {
  return (
    <div>
      <Label title={label} />

      <div className="mt-2 flex overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition focus-within:border-[#d7b56d]/70 focus-within:bg-black/50">
        <div className="relative shrink-0 border-r border-white/10">
          <select
            value={selectedCountry.code}
            onChange={(e) => {
              const country = COUNTRY_CODES.find(
                (item) => item.code === e.target.value
              );

              if (country) {
                setSelectedCountry(country);
              }
            }}
            className="h-full min-h-[50px] w-[118px] cursor-pointer appearance-none bg-black/20 px-3 text-sm font-bold text-white outline-none"
          >
            {COUNTRY_CODES.map((country, index) => (
              <option
                key={`${country.code}-${country.name}-${index}`}
                value={country.code}
                className="bg-[#101010] text-white"
              >
                {country.flag} {country.code}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 items-center gap-2 px-4">
          <Phone className="h-4 w-4 text-white/30" />

          <input
            type="tel"
            placeholder="7000 000000"
            className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/25"
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-white/35">
        Default country code is United Kingdom {selectedCountry.flag}{" "}
        {selectedCountry.code}
      </p>
    </div>
  );
}

function Textarea({ label, placeholder, className = "" }) {
  return (
    <div className={className}>
      <Label title={label} />

      <textarea
        rows={5}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#d7b56d]/70 focus:bg-black/50"
      />
    </div>
  );
}

function OptionCard({ label }) {
  return (
    <label className="group cursor-pointer">
      <input type="checkbox" className="peer hidden" />

      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-[#d7b56d]/50 hover:bg-[#d7b56d]/10 peer-checked:border-[#d7b56d] peer-checked:bg-[#d7b56d]/15 peer-checked:text-[#d7b56d]">
        {label}
      </div>
    </label>
  );
}