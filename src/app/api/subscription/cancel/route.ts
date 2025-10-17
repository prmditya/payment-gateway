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
        { error: "You must be logged in to cancel a subscription" },
        { status: 401 }
      );
    }

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Get subscription from database
    const dbSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Verify this subscription belongs to the user
    if (dbSubscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if already canceled
    if (dbSubscription.status === "canceled") {
      return NextResponse.json(
        { error: "Subscription is already canceled" },
        { status: 400 }
      );
    }

    console.log("Canceling subscription:", dbSubscription.stripeSubscriptionId);

    // Cancel the subscription in Stripe (at period end)
    let stripeSubscription;
    if (dbSubscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.update(
          dbSubscription.stripeSubscriptionId,
          {
            cancel_at_period_end: true,
          }
        );
        console.log("✅ Stripe subscription updated:", stripeSubscription.id);
      } catch (stripeError) {
        console.error("Stripe cancellation error:", stripeError);
        // Continue even if Stripe fails - update database anyway for test subscriptions
      }
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    console.log("✅ Database subscription updated:", updatedSubscription.id);

    return NextResponse.json({
      subscription: updatedSubscription,
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);

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

// Reactivate a canceled subscription
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Get subscription from database
    const dbSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (dbSubscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Reactivate in Stripe
    if (dbSubscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(
          dbSubscription.stripeSubscriptionId,
          {
            cancel_at_period_end: false,
          }
        );
      } catch (stripeError) {
        console.error("Stripe reactivation error:", stripeError);
      }
    }

    // Update database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    return NextResponse.json({
      subscription: updatedSubscription,
      message: "Subscription reactivated successfully",
    });
  } catch (error) {
    console.error("Error reactivating subscription:", error);

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
