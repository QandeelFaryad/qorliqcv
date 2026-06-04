export const pricingPlans = [
  // =========================
  // CV BUILDER PLANS
  // =========================
  {
    id: "one-time",
    serviceId: "cv-builder",
    serviceName: "CV Builder",
    name: "One-Time",
    category: "Real Value",
    oldPrice: "£4.99",
    price: "£1.99",
    discount: "60% OFF",
    smallText: "One CV download, no subscription",
    type: "payment",
   stripePriceEnv: "STRIPE_PRICE_ONE_TIME_STANDARD",
stripeStandardPriceEnv: "STRIPE_PRICE_ONE_TIME_STANDARD",
stripeOfferPriceEnv: "STRIPE_PRICE_ONE_TIME_OFFER",
offerDurationMinutes: 10,
    highlight: false,
    renewal: "No auto-renewal",
    recommendation: "Best for a single CV download",
    recommendationTone:
      "Choose this if you only need one professional CV file without a monthly plan.",
    features: [
      "One professional CV download",
      "PDF file for online applications",
      "MS Word file for future editing",
      "Print-ready format included",
      "Valid for 3 days",
      "No long-term commitment required",
    ],
    why:
      "We offer this low-cost one-time option because not every customer needs a long subscription. This package is built for users who simply need one professional CV download at an affordable price.",
  },
  {
    id: "3-months",
    serviceId: "cv-builder",
    serviceName: "CV Builder",
    name: "3 Months",
    category: "Best Fit",
    oldPrice: "£14.97",
    price: "£13.99",
    discount: "7% OFF",
    smallText: "Valid for 3 months",
    type: "subscription",
    stripePriceEnv: "STRIPE_PRICE_3_MONTHS_STANDARD",
stripeStandardPriceEnv: "STRIPE_PRICE_3_MONTHS_STANDARD",
stripeOfferPriceEnv: "STRIPE_PRICE_3_MONTHS_OFFER",
offerDurationMinutes: 10,
    highlight: false,
    renewal: "Auto-renews every 3 months",
    recommendation: "Good for short job search",
    recommendationTone:
      "Choose this if you are applying for jobs over the next few weeks.",
    features: [
      "3 months of CV editing access",
      "Download updated CV versions anytime",
      "PDF and MS Word files included",
      "Adjust your CV for different job roles",
      "Useful for short-term job applications",
      "Auto-renews every 3 months",
    ],
    why:
      "Choose this if you are actively applying over the next few months and want enough time to edit, improve, and download your CV whenever needed.",
  },
  {
    id: "6-months",
    serviceId: "cv-builder",
    serviceName: "CV Builder",
    name: "6 Months",
    category: "Recommended Plan",
    oldPrice: "£29.94",
    price: "£23.99",
    discount: "20% OFF",
    smallText: "Valid for 6 months",
    type: "subscription",
   stripePriceEnv: "STRIPE_PRICE_6_MONTHS_STANDARD",
stripeStandardPriceEnv: "STRIPE_PRICE_6_MONTHS_STANDARD",
stripeOfferPriceEnv: "STRIPE_PRICE_6_MONTHS_OFFER",
offerDurationMinutes: 10,
    highlight: true,
    renewal: "Auto-renews every 6 months",
    recommendation: "Recommended for most customers",
    recommendationTone:
      "This is the best balance of price, time, and flexibility for active job seekers.",
    features: [
      "6 months of full CV access",
      "Edit and download whenever needed",
      "PDF and MS Word files included",
      "Create role-specific CV versions",
      "Best for active job searching",
      "Auto-renews every 6 months",
    ],
    why:
      "Choose this if you are serious about your job search and want longer access to update your CV for different roles, industries, and opportunities.",
  },
  {
    id: "annual",
    serviceId: "cv-builder",
    serviceName: "CV Builder",
    name: "Annual",
    category: "Best Value",
    oldPrice: "£59.88",
    price: "£41.99",
    discount: "30% OFF",
    smallText: "Valid for 1 year",
    type: "subscription",
  stripePriceEnv: "STRIPE_PRICE_ANNUAL_STANDARD",
stripeStandardPriceEnv: "STRIPE_PRICE_ANNUAL_STANDARD",
stripeOfferPriceEnv: "STRIPE_PRICE_ANNUAL_OFFER",
offerDurationMinutes: 10,
    highlight: false,
    renewal: "Auto-renews yearly",
    recommendation: "Best for long-term career use",
    recommendationTone:
      "Choose this if you want your CV ready for future opportunities all year.",
    features: [
      "12 months of long-term CV access",
      "Keep your CV updated all year",
      "PDF and MS Word files included",
      "Ideal for promotions and career changes",
      "Prepare CVs for future opportunities",
      "Auto-renews yearly",
    ],
    why:
      "Choose this if you want long-term CV access for future job applications, promotions, career changes, or keeping your profile updated all year.",
  },

  // =========================
  // LOGO DESIGN PLANS
  // =========================
  {
    id: "logo-basic",
    serviceId: "logo-design",
    serviceName: "Logo Design",
    name: "Basic Logo",
    category: "Quick Start",
    oldPrice: "£45.00",
    price: "£30",
    discount: "33% OFF",
    smallText: "Simple logo concept",
    type: "payment",
    stripePriceEnv: "STRIPE_PRODUCT_LOGO_BASIC",
    highlight: false,
    renewal:
      "One-time payment • Cancel within 14 days if project has not started",
    recommendation: "Good for a simple launch",
    recommendationTone:
      "Choose this if you need a clean logo quickly for a small business or personal brand.",
    features: [
      "1 logo concept",
      "3 revision rounds included",
      "Basic colour version",
      "PNG file included",
      "Suitable for website use",
      "Simple text or icon style",
      "One-time payment",
      "Cancel within 14 days if project has not started",
    ],
    why:
      "Best if you want a simple, affordable logo without a full branding package.",
  },
  {
    id: "logo-standard",
    serviceId: "logo-design",
    serviceName: "Logo Design",
    name: "Brand Starter",
    category: "Recommended Plan",
    oldPrice: "£75.00",
    price: "£60",
    discount: "20% OFF",
    smallText: "Best for new businesses",
    type: "payment",
    stripePriceEnv: "STRIPE_PRODUCT_LOGO_STARTER",
    highlight: true,
    renewal:
      "One-time payment • Cancel within 14 days if project has not started",
    recommendation: "Recommended for most businesses",
    recommendationTone:
      "This gives a stronger logo direction with files you can use across digital and print channels.",
    features: [
      "3 logo concepts",
      "10 revision rounds included",
      "Colour and black version",
      "PNG and JPG files included",
      "Transparent background file",
      "Suitable for website and social media",
      "Commercial-use ready files",
      "One-time payment",
      "Cancel within 14 days if project has not started",
    ],
    why:
      "Choose this if you want a professional business logo with enough flexibility for your website, social media, and marketing materials.",
  },
  {
    id: "logo-premium",
    serviceId: "logo-design",
    serviceName: "Logo Design",
    name: "Premium Brand Kit",
    category: "Best Value",
    oldPrice: "£199.00",
    price: "£150",
    discount: "25% OFF",
    smallText: "Fuller brand identity package",
    type: "payment",
    stripePriceEnv: "STRIPE_PRODUCT_LOGO_BRAND_KIT",
    highlight: false,
    renewal:
      "One-time payment • Cancel within 14 days if project has not started",
    recommendation: "Best for serious branding",
    recommendationTone:
      "Choose this if you need a polished identity, not just a basic logo file.",
    features: [
      "Premium logo and brand kit",
      "Unlimited revision rounds included",
      "Primary and secondary logo version",
      "PNG, JPG, and source-ready files",
      "Brand colour suggestion",
      "Social media profile version",
      "Priority design delivery",
      "One-time payment",
      "Cancel within 14 days if project has not started",
    ],
    why:
      "Ideal if you are building a business brand and want a more complete visual identity for long-term use.",
  },

  // =========================
  // ADS SERVICE PLANS
  // =========================
  {
    id: "ads-basic",
    serviceId: "ads",
    serviceName: "Ads Service",
    name: "Ad Copy Basic",
    category: "Quick Start",
    oldPrice: "",
    price: "£30",
    discount: "Fixed Price",
    smallText: "Basic ad copy support",
    type: "payment",
    stripePriceEnv: "STRIPE_PRODUCT_AD_BASIC",
    highlight: false,
    renewal: "One-time service",
    recommendation: "Good for one simple promotion",
    recommendationTone:
      "Choose this if you only need basic ad wording and a simple campaign direction.",
    features: [
      "1 campaign idea",
      "3 ad copy variations",
      "Basic headline suggestions",
      "Simple call-to-action ideas",
      "Suitable for social ads",
      "Ad spend not included",
    ],
    why:
      "Best if you want a quick starting point for promoting your service or offer without a full campaign setup.",
  },
  {
    id: "ads-standard",
    serviceId: "ads",
    serviceName: "Ads Service",
    name: "Campaign Setup",
    category: "Recommended Plan",
    oldPrice: "",
    price: "£100",
    discount: "Fixed Price",
    smallText: "Best for launching ads",
    type: "payment",
    stripePriceEnv: "STRIPE_PRODUCT_CAMPAIGN_SETUP",
    highlight: true,
    renewal: "One-time service",
    recommendation: "Recommended for campaign launch",
    recommendationTone:
      "This gives you a stronger structure before spending money on ads.",
    features: [
      "Campaign structure guidance and setup for 2 platforms only",
      "Audience targeting suggestions",
      "5 ad copy variations",
      "Creative direction for visuals",
      "Landing page message suggestions",
      "Ad spend not included",
    ],
    why:
      "Choose this if you want a more complete ad launch plan before running paid campaigns on social media or search platforms.",
  },
  {
    id: "ads-premium",
    serviceId: "ads",
    serviceName: "Ads Service",
    name: "Growth Campaign",
    category: "Best Value",
    oldPrice: "",
    price: "£500",
    discount: "Fixed Price",
    smallText: "Advanced campaign support",
    type: "payment",
    stripePriceEnv: "STRIPE_PRODUCT_AD_GROWTH",
    highlight: false,
    renewal: "One-time service",
    recommendation: "Best for serious promotion",
    recommendationTone:
      "Choose this if you want a stronger campaign plan with testing angles and conversion-focused messaging.",
    features: [
      "Full campaign planning and launch setup",
      "Multi-platform setup across Google, Facebook, Snapchat, TikTok, and other major ad platforms",
      "Multiple audience angles and targeting directions",
      "10 conversion-focused ad copy variations",
      "A/B testing message ideas for performance improvement",
      "Creative direction and offer positioning",
      "Campaign budget is paid separately by the client",
      "One month support included for ad budgets below £3,000",
      "For ad budgets above £3,000, management fee is 20% of the total ad budget",
      "If we pay the ad platform on your behalf, the ad budget must be paid in advance",
    ],
    why:
      "Ideal for businesses that want a complete campaign setup across major platforms such as Google, Facebook, Snapchat, TikTok, and other suitable social channels. Advertising spend is separate and paid by the client.",
  },

  // =========================
  // CUSTOM CONTACT PACKAGE
  // =========================
  {
    id: "product-capture",
    serviceId: "ads",
    serviceName: "Ads Service",
    name: "Product Model & Live Capture",
    category: "Custom Enquiry",
    oldPrice: "",
    price: "Custom Quote",
    discount: "Contact Us",
    smallText: "Model shoot and live product content",
    type: "contact",
    stripePriceEnv: "",
    highlight: false,
    contactOnly: true,
    renewal: "Custom quotation required",
    recommendation: "Best for product visuals",
    recommendationTone:
      "Choose this if you need model-based product photos, live product capture, or custom creative production.",
    features: [
      "Product modelling enquiry",
      "Live product capturing enquiry",
      "Creative direction discussion",
      "Content requirements review",
      "Custom quotation based on project scope",
      "Contact us by email or through the Contact Us page",
    ],
    why:
      "Product modelling and live capture depend on the product type, location, model requirements, content style, and project scope. Contact us so we can review your requirements and provide a suitable quotation.",
  },
];

export const cvBuilderPlans = pricingPlans.filter(
  (plan) => plan.serviceId === "cv-builder"
);

export const logoDesignPlans = pricingPlans.filter(
  (plan) => plan.serviceId === "logo-design"
);

export const adsPlans = pricingPlans.filter((plan) => plan.serviceId === "ads");

export function getPlanById(planId) {
  return pricingPlans.find((plan) => plan.id === planId);
}