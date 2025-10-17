import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        console.log("Customer:", session.customer);
        console.log("Subscription:", session.subscription);
        console.log("User metadata:", session.metadata);

        // TODO: Save subscription to your database
        // Example:
        // await db.subscription.create({
        //   userId: session.metadata.userId,
        //   stripeCustomerId: session.customer as string,
        //   stripeSubscriptionId: session.subscription as string,
        //   status: 'active',
        // });

        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription created:", subscription.id);
        console.log("Customer:", subscription.customer);
        console.log("Status:", subscription.status);
        console.log("User metadata:", subscription.metadata);

        // TODO: Update subscription in your database
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);
        console.log("Status:", subscription.status);

        // TODO: Update subscription status in your database
        // Example:
        // await db.subscription.update({
        //   where: { stripeSubscriptionId: subscription.id },
        //   data: { status: subscription.status },
        // });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);

        // TODO: Mark subscription as cancelled in your database
        // Example:
        // await db.subscription.update({
        //   where: { stripeSubscriptionId: subscription.id },
        //   data: { status: 'cancelled' },
        // });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment succeeded:", invoice.id);
        console.log("Subscription:", invoice.subscription);

        // TODO: Record successful payment in your database
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment failed:", invoice.id);
        console.log("Customer:", invoice.customer);

        // TODO: Handle failed payment (send email, update status, etc.)
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
