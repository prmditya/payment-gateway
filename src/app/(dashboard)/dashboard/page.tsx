import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { CancelSubscriptionButton } from "@/features/subscription/cancel-subscription-button";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user's subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user?.id },
    orderBy: { createdAt: "desc" },
  });

  const activeSubscription = subscriptions.find((sub: { status: string }) => sub.status === "active");

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <SignOutButton />
      </div>

      {/* User Info Card */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <p className="text-lg">Welcome, {session.user?.name || session.user?.email}!</p>
        <p className="text-sm text-muted-foreground mt-2">
          Email: {session.user?.email}
        </p>
        {session.user?.provider && (
          <p className="text-sm text-muted-foreground">
            Logged in via: {session.user.provider}
          </p>
        )}
      </div>

      {/* Subscription Card */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>

        {activeSubscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-semibold text-green-900">{activeSubscription.planName} Plan</p>
                <p className="text-sm text-green-700">
                  ${(activeSubscription.amount / 100).toFixed(2)}/{activeSubscription.interval}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Next Billing Date</p>
                <p className="font-medium">
                  {activeSubscription.currentPeriodEnd
                    ? new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Started On</p>
                <p className="font-medium">
                  {new Date(activeSubscription.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {activeSubscription.cancelAtPeriodEnd && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                Your subscription will cancel at the end of the billing period.
              </div>
            )}

            {/* Cancel Subscription Section */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Manage Subscription</h3>
              <CancelSubscriptionButton
                subscriptionId={activeSubscription.id}
                planName={activeSubscription.planName}
                currentPeriodEnd={activeSubscription.currentPeriodEnd}
                cancelAtPeriodEnd={activeSubscription.cancelAtPeriodEnd}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription yet.
            </p>
            <Link href="/pricing">
              <Button className="bg-blue-600 hover:bg-blue-700">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        )}

        {/* Subscription History */}
        {subscriptions.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Subscription History</h3>
            <div className="space-y-2">
              {subscriptions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-muted rounded text-sm"
                >
                  <div>
                    <p className="font-medium">{sub.planName}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      sub.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
