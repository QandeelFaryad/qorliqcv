import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      limit: 50,
      expand: ["data.product"],
    });

    return NextResponse.json({
      success: true,
      secretKeyMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test")
        ? "TEST"
        : "LIVE",
      prices: prices.data.map((price) => ({
        priceId: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        product:
          typeof price.product === "object"
            ? price.product.name
            : price.product,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}