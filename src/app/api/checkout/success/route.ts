import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "line_items.data.price.product"],
    });

    if (!checkoutSession.subscription || typeof checkoutSession.subscription === "string") {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    const subscription = checkoutSession.subscription;
    const userId = checkoutSession.metadata?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session metadata" },
        { status: 400 }
      );
    }

    // Get plan details
    const lineItem = checkoutSession.line_items?.data[0];
    const price = lineItem?.price;
    const product = price?.product;

    const planName = typeof product === "object" ? product?.name || "Unknown" : "Unknown";
    const amount = price?.unit_amount || 0;
    const interval = price?.recurring?.interval || "month";

    // Check if subscription already exists in database
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (existingSubscription) {
      console.log("Subscription already exists:", subscription.id);
      return NextResponse.json({
        subscription: existingSubscription,
        message: "Subscription already recorded",
      });
    }

    // Save subscription to database
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId: checkoutSession.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: price?.id || "",
        stripeProductId: typeof product === "string" ? product : product?.id,
        status: subscription.status,
        planName,
        amount,
        currency: price?.currency || "usd",
        interval,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    console.log("✅ Subscription saved to database:", newSubscription.id);

    return NextResponse.json({
      subscription: newSubscription,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Error processing checkout success:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
