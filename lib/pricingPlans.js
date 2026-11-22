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
    stripePriceEnv: "STRIPE_PRICE_ONE_TIME_OFFER",


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
    oldPrice: "£15.97",
    price: "£14.97",
    discount: "7% OFF",
    smallText: "Valid for 3 months",
    type: "subscription",
       stripePriceEnv: "STRIPE_PRICE_3_MONTHS_OFFER",


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
    oldPrice: "£39.94",
    price: "£29.94",
    discount: "20% OFF",
    smallText: "Valid for 6 months",
    type: "subscription",
    stripePriceEnv: "STRIPE_PRICE_6_MONTHS_OFFER",


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
    oldPrice: "£69.88",
    price: "£59.88",
    discount: "30% OFF",
    smallText: "Valid for 1 year",
    type: "subscription",
    stripePriceEnv: "STRIPE_PRICE_ANNUAL_OFFER",


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

 ];

// CV Builder is the only supported product.
export const cvBuilderPlans = pricingPlans;

export function getPlanById(planId) {
  return pricingPlans.find((plan) => plan.id === planId);
}
