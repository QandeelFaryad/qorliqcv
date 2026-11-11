import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

import { pricingPlans } from "@/lib/pricingPlans";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceOrder from "@/models/ServiceOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   GENERAL HELPERS
========================================================= */

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...extra,
    },
    { status }
  );
}

function makePhone(countryCode, number) {
  const code = cleanText(countryCode);
  const mobile = cleanText(number);

  if (!code && !mobile) {
    return "";
  }

  return `${code}${mobile}`.replace(/\s+/g, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));
}

function getAmountInPence(plan) {
  if (typeof plan.amount === "number") {
    return Math.round(plan.amount);
  }

  if (typeof plan.amountPence === "number") {
    return Math.round(plan.amountPence);
  }

  if (typeof plan.priceInPence === "number") {
    return Math.round(plan.priceInPence);
  }

  const priceText = cleanText(plan.price);

  if (!priceText) {
    return 0;
  }

  const numericPrice = Number(
    priceText.replace(/[^\d.]/g, "")
  );

  if (!numericPrice || Number.isNaN(numericPrice)) {
    return 0;
  }

  return Math.round(numericPrice * 100);
}

/*
  This function permanently reads the Stripe price from:

  stripePriceEnv: "STRIPE_PRICE_6_MONTHS_OFFER"

  No countdown, standard price, or offer-state logic is used.
*/
function getStripePriceId(plan) {
  const directPriceId =
    cleanText(plan.stripePriceId) ||
    cleanText(plan.priceId) ||
    cleanText(plan.stripe_price_id);

  if (directPriceId) {
    return directPriceId;
  }

  const envKey =
    cleanText(plan.stripePriceEnv) ||
    cleanText(plan.stripeOfferPriceEnv);

  if (!envKey) {
    return "";
  }

  return cleanText(process.env[envKey]);
}

function buildAddress(customerDetails) {
  return {
    line1: customerDetails.addressLine1,
    line2: customerDetails.addressLine2 || undefined,
    city: customerDetails.city,
    postal_code: customerDetails.postalCode,
    country: customerDetails.country,
  };
}

function buildCustomerDetails(customerForm = {}) {
  return {
    firstName: cleanText(customerForm.firstName),
    lastName: cleanText(customerForm.lastName),

    email: cleanText(customerForm.email).toLowerCase(),

    mobileCountryCode: cleanText(
      customerForm.mobileCountryCode
    ),

    mobileCountryFlag: cleanText(
      customerForm.mobileCountryFlag
    ),

    mobileNumber: cleanText(customerForm.mobileNumber),

    country: cleanText(customerForm.country).toUpperCase(),
    countryName: cleanText(customerForm.countryName),
    countryFlag: cleanText(customerForm.countryFlag),

    postalCode: cleanText(customerForm.postalCode),
    addressLine1: cleanText(customerForm.addressLine1),
    addressLine2: cleanText(customerForm.addressLine2),
    city: cleanText(customerForm.city),
  };
}

function hasMissingBillingDetails(customerDetails) {
  return (
    !customerDetails.firstName ||
    !customerDetails.lastName ||
    !customerDetails.email ||
    !customerDetails.mobileNumber ||
    !customerDetails.country ||
    !customerDetails.postalCode ||
    !customerDetails.addressLine1 ||
    !customerDetails.city
  );
}

/* =========================================================
   STRIPE HELPERS
========================================================= */

function getStripeClient() {
  const secretKey = cleanText(
    process.env.STRIPE_SECRET_KEY
  );

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

async function validateSubscriptionPrice({
  stripe,
  selectedPlan,
  stripePriceId,
}) {
  let stripePrice;

  try {
    stripePrice = await stripe.prices.retrieve(
      stripePriceId,
      {
        expand: ["product"],
      }
    );
  } catch (error) {
    console.error("Unable to retrieve Stripe price:", {
      priceId: stripePriceId,
      message: error?.message,
      rawMessage: error?.raw?.message,
      requestId: error?.requestId,
    });

    const message =
      error?.raw?.message ||
      error?.message ||
      `Unable to retrieve Stripe price ${stripePriceId}.`;

    const stripeError = new Error(message);
    stripeError.statusCode =
      error?.statusCode === 404 ? 400 : 500;

    throw stripeError;
  }

  if (!stripePrice.active) {
    const error = new Error(
      `Stripe price ${stripePrice.id} is inactive. Please activate it or replace the price ID in your environment variables.`
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    stripePrice.type !== "recurring" ||
    !stripePrice.recurring
  ) {
    const error = new Error(
      `Stripe price ${stripePrice.id} is not a recurring subscription price.`
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    stripePrice.currency &&
    stripePrice.currency.toLowerCase() !== "gbp"
  ) {
    const error = new Error(
      `Stripe price ${stripePrice.id} uses ${stripePrice.currency.toUpperCase()}, but this checkout requires GBP.`
    );

    error.statusCode = 400;
    throw error;
  }

  /*
    The expanded product should normally be an object.
    If Stripe returns only the ID, retrieve the full product.
  */
  let stripeProduct = stripePrice.product;

  if (typeof stripeProduct === "string") {
    stripeProduct = await stripe.products.retrieve(
      stripeProduct
    );
  }

  if (!stripeProduct) {
    const error = new Error(
      `The product linked to Stripe price ${stripePrice.id} could not be found.`
    );

    error.statusCode = 400;
    throw error;
  }

  if (stripeProduct.deleted === true) {
    const error = new Error(
      `Stripe product ${stripeProduct.id} has been deleted. Create a new active product and recurring price.`
    );

    error.statusCode = 400;
    throw error;
  }

  if (stripeProduct.active !== true) {
    const error = new Error(
      `Stripe product ${stripeProduct.id} is inactive. Reactivate the product in Stripe or replace the price ID in .env.local.`
    );

    error.statusCode = 400;
    throw error;
  }

  /*
    Protect against showing one amount on the website
    but charging a different amount in Stripe.
  */
  const expectedAmount = getAmountInPence(selectedPlan);

  if (
    expectedAmount > 0 &&
    typeof stripePrice.unit_amount === "number" &&
    stripePrice.unit_amount !== expectedAmount
  ) {
    const websiteAmount = (
      expectedAmount / 100
    ).toFixed(2);

    const stripeAmount = (
      stripePrice.unit_amount / 100
    ).toFixed(2);

    const error = new Error(
      `Price mismatch: the website shows £${websiteAmount}, but Stripe price ${stripePrice.id} charges £${stripeAmount}.`
    );

    error.statusCode = 400;
    throw error;
  }

  console.log("Validated Stripe subscription price:", {
    planId: selectedPlan.id,
    envKey:
      selectedPlan.stripePriceEnv ||
      selectedPlan.stripeOfferPriceEnv ||
      "",
    priceId: stripePrice.id,
    priceActive: stripePrice.active,
    amount: stripePrice.unit_amount,
    currency: stripePrice.currency,
    recurring: stripePrice.recurring,
    productId: stripeProduct.id,
    productName: stripeProduct.name,
    productActive: stripeProduct.active,
  });

  return {
    stripePrice,
    stripeProduct,
  };
}

async function getSubscriptionSecrets({
  stripe,
  subscription,
}) {
  let latestInvoice = subscription.latest_invoice;

  /*
    Normally latest_invoice is already expanded.
    This fallback handles cases where Stripe returns only its ID.
  */
  if (typeof latestInvoice === "string") {
    latestInvoice = await stripe.invoices.retrieve(
      latestInvoice,
      {
        expand: [
          "confirmation_secret",
          "payment_intent",
        ],
      }
    );
  }

  const confirmationSecret =
    latestInvoice &&
    typeof latestInvoice !== "string"
      ? latestInvoice.confirmation_secret
      : null;

  const paymentIntent =
    latestInvoice &&
    typeof latestInvoice !== "string"
      ? latestInvoice.payment_intent
      : null;

  const pendingSetupIntent =
    subscription.pending_setup_intent;

  const clientSecret =
    confirmationSecret &&
    typeof confirmationSecret !== "string"
      ? confirmationSecret.client_secret || ""
      : paymentIntent &&
          typeof paymentIntent !== "string"
        ? paymentIntent.client_secret || ""
        : pendingSetupIntent &&
            typeof pendingSetupIntent !== "string"
          ? pendingSetupIntent.client_secret || ""
          : "";

  const secretType =
    confirmationSecret &&
    typeof confirmationSecret !== "string" &&
    confirmationSecret.client_secret
      ? "confirmation_secret"
      : paymentIntent &&
          typeof paymentIntent !== "string" &&
          paymentIntent.client_secret
        ? "payment_intent"
        : pendingSetupIntent &&
            typeof pendingSetupIntent !== "string" &&
            pendingSetupIntent.client_secret
          ? "setup_intent"
          : "";

  const paymentIntentId =
    paymentIntent &&
    typeof paymentIntent !== "string"
      ? paymentIntent.id || ""
      : "";

  return {
    latestInvoice,
    confirmationSecret,
    paymentIntent,
    pendingSetupIntent,
    clientSecret,
    secretType,
    paymentIntentId,
  };
}

/* =========================================================
   POST ROUTE
========================================================= */

export async function POST(req) {
  let serviceOrderId = "";

  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return jsonError(
        "Stripe secret key is missing.",
        500
      );
    }

    await connectDB();

    const body = await req.json();

    const planId = cleanText(body.planId);
    const cvId = cleanText(body.cvId);
    const template = cleanText(body.template);

    if (!planId) {
      return jsonError(
        "Package is required.",
        400
      );
    }

    const selectedPlan = pricingPlans.find(
      (plan) => plan.id === planId
    );

    if (!selectedPlan) {
      return jsonError(
        "Invalid package selected.",
        400
      );
    }

    const serviceId =
      cleanText(selectedPlan.serviceId) ||
      "cv-builder";

    const isCvBuilderPlan =
      serviceId === "cv-builder";

    const isLogoPlan =
      serviceId === "logo-design";

    const isAdsPlan =
      serviceId === "ads";

    const isGuestServicePlan =
      isLogoPlan || isAdsPlan;

    const isSubscription =
      selectedPlan.type === "subscription";

    const customerDetails =
      buildCustomerDetails(
        body.customerForm || {}
      );

    if (
      hasMissingBillingDetails(customerDetails)
    ) {
      return jsonError(
        "Please complete all required billing details.",
        400
      );
    }

    if (
      !isValidEmail(customerDetails.email)
    ) {
      return jsonError(
        "Please enter a valid email address.",
        400
      );
    }

    const session =
      await getServerSession(authOptions);

    if (
      isCvBuilderPlan &&
      !session?.user?.email
    ) {
      return jsonError(
        "Login required for CV Builder.",
        401
      );
    }

    const customerEmail = isCvBuilderPlan
      ? cleanText(
          session.user.email
        ).toLowerCase()
      : customerDetails.email;

    if (
      !customerEmail ||
      !isValidEmail(customerEmail)
    ) {
      return jsonError(
        "Customer email is required.",
        400
      );
    }

    let user = null;
    let stripeCustomerId = "";

    if (isCvBuilderPlan) {
      user = await User.findOne({
        email: customerEmail,
      });

      if (!user) {
        return jsonError(
          "User not found.",
          404
        );
      }

      stripeCustomerId = cleanText(
        user.stripeCustomerId
      );
    }

    const fullName =
      `${customerDetails.firstName} ${customerDetails.lastName}`.trim();

    const phone = makePhone(
      customerDetails.mobileCountryCode,
      customerDetails.mobileNumber
    );

    /*
      Create or update Stripe customer.
    */
    if (!stripeCustomerId) {
      const customer =
        await stripe.customers.create({
          email: customerEmail,
          name: fullName,
          phone,
          address:
            buildAddress(customerDetails),

          metadata: {
            serviceId,
            planId,
            cvId,
            template,

            checkoutType:
              isGuestServicePlan
                ? "guest"
                : "logged-in",
          },
        });

      stripeCustomerId = customer.id;

      if (isCvBuilderPlan && user) {
        user.stripeCustomerId =
          stripeCustomerId;

        await user.save();
      }
    } else {
      try {
        await stripe.customers.update(
          stripeCustomerId,
          {
            email: customerEmail,
            name: fullName,
            phone,

            address:
              buildAddress(
                customerDetails
              ),
          }
        );
      } catch (customerError) {
        /*
          This commonly happens when a test customer ID
          is stored while the application is using live mode,
          or the reverse.

          Create a fresh Stripe customer and update the database.
        */
        const isMissingCustomer =
          customerError?.code ===
            "resource_missing" ||
          customerError?.raw?.code ===
            "resource_missing";

        if (!isMissingCustomer) {
          throw customerError;
        }

        console.warn(
          "Stored Stripe customer was not found. Creating a new customer:",
          {
            oldCustomerId:
              stripeCustomerId,
            customerEmail,
          }
        );

        const newCustomer =
          await stripe.customers.create({
            email: customerEmail,
            name: fullName,
            phone,

            address:
              buildAddress(
                customerDetails
              ),

            metadata: {
              serviceId,
              planId,
              cvId,
              template,

              checkoutType:
                isGuestServicePlan
                  ? "guest"
                  : "logged-in",
            },
          });

        stripeCustomerId =
          newCustomer.id;

        if (isCvBuilderPlan && user) {
          user.stripeCustomerId =
            stripeCustomerId;

          await user.save();
        }
      }
    }

    /*
      Save billing details for logged-in CV Builder customers.
    */
    if (isCvBuilderPlan && user) {
      user.billingDetails = {
        firstName:
          customerDetails.firstName,

        lastName:
          customerDetails.lastName,

        email:
          customerDetails.email,

        mobileCountryCode:
          customerDetails.mobileCountryCode,

        mobileCountryFlag:
          customerDetails.mobileCountryFlag,

        mobileNumber:
          customerDetails.mobileNumber,

        phone,

        country:
          customerDetails.country,

        countryName:
          customerDetails.countryName,

        countryFlag:
          customerDetails.countryFlag,

        postalCode:
          customerDetails.postalCode,

        addressLine1:
          customerDetails.addressLine1,

        addressLine2:
          customerDetails.addressLine2,

        city:
          customerDetails.city,
      };

      await user.save();
    }

    const metadata = {
      userId:
        user?._id?.toString() || "",

      email: customerEmail,

      serviceId,
      planId,
      plan: planId,

      planName:
        cleanText(selectedPlan.name),

      planType:
        cleanText(selectedPlan.type),

      cvId,
      template,

      billingFirstName:
        customerDetails.firstName,

      billingLastName:
        customerDetails.lastName,

      billingEmail:
        customerDetails.email,

      billingMobileCountryCode:
        customerDetails.mobileCountryCode,

      billingMobileNumber:
        customerDetails.mobileNumber,

      billingCountry:
        customerDetails.country,

      billingCountryName:
        customerDetails.countryName,

      billingPostalCode:
        customerDetails.postalCode,

      billingAddressLine1:
        customerDetails.addressLine1,

      billingAddressLine2:
        customerDetails.addressLine2,

      billingCity:
        customerDetails.city,

      checkoutType:
        isGuestServicePlan
          ? "guest"
          : "logged-in",
    };

    /* =====================================================
       SUBSCRIPTION PAYMENT
    ===================================================== */

    if (isSubscription) {
      if (!isCvBuilderPlan) {
        return jsonError(
          "Subscriptions are only allowed for CV Builder.",
          400
        );
      }

      const stripePriceId =
        getStripePriceId(selectedPlan);

      if (!stripePriceId) {
        return jsonError(
          `Stripe subscription price is missing for ${selectedPlan.name}. Check ${selectedPlan.stripePriceEnv || "stripePriceEnv"} in .env.local.`,
          500
        );
      }

      const { stripePrice } =
        await validateSubscriptionPrice({
          stripe,
          selectedPlan,
          stripePriceId,
        });

      const subscription =
        await stripe.subscriptions.create({
          customer: stripeCustomerId,

          collection_method:
            "charge_automatically",

          items: [
            {
              price: stripePrice.id,
              quantity: 1,
            },
          ],

          automatic_tax: {
            enabled: true,
          },

          payment_behavior:
            "default_incomplete",

          payment_settings: {
            save_default_payment_method:
              "on_subscription",
          },

          metadata,

          expand: [
            "latest_invoice.confirmation_secret",
            "latest_invoice.payment_intent",
            "pending_setup_intent",
          ],
        });

      const secrets =
        await getSubscriptionSecrets({
          stripe,
          subscription,
        });

      /*
        A paid subscription should normally return a secret.
        If Stripe immediately marks a zero-cost subscription active,
        it may not need client confirmation.
      */
      if (
        !secrets.clientSecret &&
        subscription.status === "active"
      ) {
        return NextResponse.json({
          success: true,

          type: "subscription",

          requiresPayment: false,

          clientSecret: "",
          secretType: "",

          subscriptionId:
            subscription.id,

          paymentIntentId:
            secrets.paymentIntentId,

          serviceId,
          planId,
        });
      }

      if (!secrets.clientSecret) {
        console.error(
          "Subscription created but no client secret was returned:",
          {
            subscriptionId:
              subscription.id,

            subscriptionStatus:
              subscription.status,

            latestInvoice:
              secrets.latestInvoice,

            confirmationSecret:
              secrets.confirmationSecret,

            paymentIntent:
              secrets.paymentIntent,

            pendingSetupIntent:
              secrets.pendingSetupIntent,
          }
        );

        /*
          Prevent an unusable incomplete subscription
          from remaining on the customer.
        */
        if (
          subscription.status ===
            "incomplete" ||
          subscription.status ===
            "incomplete_expired"
        ) {
          try {
            await stripe.subscriptions.cancel(
              subscription.id
            );
          } catch (cancelError) {
            console.error(
              "Unable to cancel incomplete subscription:",
              cancelError
            );
          }
        }

        return jsonError(
          "Stripe created the subscription but did not return a payment confirmation secret.",
          500
        );
      }

      return NextResponse.json({
        success: true,

        type: "subscription",

        requiresPayment: true,

        clientSecret:
          secrets.clientSecret,

        secretType:
          secrets.secretType,

        subscriptionId:
          subscription.id,

        paymentIntentId:
          secrets.paymentIntentId,

        serviceId,
        planId,
      });
    }

    /* =====================================================
       ONE-TIME PAYMENT
    ===================================================== */

    const amount =
      getAmountInPence(selectedPlan);

    if (!amount || amount < 50) {
      return jsonError(
        "Invalid payment amount.",
        400
      );
    }

    if (isGuestServicePlan) {
      const serviceOrder =
        await ServiceOrder.create({
          serviceId,

          serviceName:
            cleanText(
              selectedPlan.serviceName
            ) ||
            cleanText(
              selectedPlan.name
            ) ||
            serviceId,

          planId,

          planName:
            cleanText(selectedPlan.name),

          planType:
            cleanText(
              selectedPlan.type
            ) || "payment",

          baseAmount: amount,
          taxAmount: 0,
          totalAmount: amount,
          currency: "gbp",

          orderStatus: "new",
          paymentStatus: "pending",

          stripeCustomerId,
          stripePaymentIntentId: "",

          customer: {
            ...customerDetails,
            fullName,
            phone,
          },

          metadata: {
            cvId,
            template,
            checkoutType: "guest",
          },
        });

      serviceOrderId =
        serviceOrder._id.toString();
    }

    const paymentIntent =
      await stripe.paymentIntents.create({
        amount,
        currency: "gbp",

        customer:
          stripeCustomerId,

        receipt_email:
          customerEmail,

        automatic_payment_methods: {
          enabled: true,
        },

        metadata: {
          ...metadata,
          serviceOrderId,
        },

        description:
          `${cleanText(selectedPlan.name) || "Service"} - ${serviceId}`,

        shipping: {
          name: fullName,
          phone,

          address:
            buildAddress(
              customerDetails
            ),
        },
      });

    if (!paymentIntent.client_secret) {
      if (serviceOrderId) {
        await ServiceOrder.findByIdAndUpdate(
          serviceOrderId,
          {
            paymentStatus: "failed",
          }
        );
      }

      return jsonError(
        "Unable to create payment intent.",
        500
      );
    }

    if (serviceOrderId) {
      await ServiceOrder.findByIdAndUpdate(
        serviceOrderId,
        {
          stripePaymentIntentId:
            paymentIntent.id,
        }
      );
    }

    return NextResponse.json({
      success: true,

      type: "one-time",

      requiresPayment: true,

      clientSecret:
        paymentIntent.client_secret,

      secretType: "payment_intent",

      paymentIntentId:
        paymentIntent.id,

      serviceOrderId,
      serviceId,
      planId,
    });
  } catch (error) {
    const stripeMessage =
      error?.raw?.message ||
      error?.message ||
      "Unable to load payment form.";

    const stripeCode =
      error?.raw?.code ||
      error?.code ||
      null;

    const stripeParam =
      error?.raw?.param ||
      error?.param ||
      null;

    const requestId =
      error?.requestId ||
      error?.raw?.requestId ||
      null;

    const statusCode =
      Number.isInteger(
        error?.statusCode
      ) &&
      error.statusCode >= 400 &&
      error.statusCode < 600
        ? error.statusCode
        : 500;

    console.error(
      "Create checkout intent error:",
      {
        name: error?.name,
        type: error?.type,
        message: error?.message,

        rawMessage:
          error?.raw?.message,

        code: stripeCode,
        param: stripeParam,

        requestId,
        statusCode,

        stack: error?.stack,
      }
    );

    if (serviceOrderId) {
      try {
        await ServiceOrder.findByIdAndUpdate(
          serviceOrderId,
          {
            paymentStatus: "failed",
          }
        );
      } catch (orderError) {
        console.error(
          "Unable to mark service order as failed:",
          orderError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: stripeMessage,
        stripeCode,
        stripeParam,
        requestId,
      },
      { status: statusCode }
    );
  }
}