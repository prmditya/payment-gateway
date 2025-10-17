import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe" },
        { status: 401 }
      );
    }

    const { priceId } = await request.json();

    console.log("Received checkout request for priceId:", priceId);
    console.log("User:", session.user.email);

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId: string | undefined;

    // Check database first for existing customer ID
    const existingDbSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (existingDbSubscription) {
      customerId = existingDbSubscription.stripeCustomerId;
    } else {
      // Search Stripe for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: session.user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: session.user.email,
          name: session.user.name || undefined,
          metadata: {
            userId: session.user.id,
          },
        });
        customerId = customer.id;
      }
    }

    // Create checkout session with customer and metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/pricing`,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
    });

    console.log("Stripe session created successfully:", checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

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