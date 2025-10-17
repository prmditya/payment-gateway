"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CancelSubscriptionButtonProps = {
  subscriptionId: string;
  planName: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export function CancelSubscriptionButton({
  subscriptionId,
  planName,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: CancelSubscriptionButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      // Refresh the page to show updated status
      router.refresh();
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reactivate subscription");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // If already canceled, show reactivate button
  if (cancelAtPeriodEnd) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        <Button
          variant="outline"
          onClick={handleReactivate}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Reactivating..." : "Reactivate Subscription"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Your subscription is scheduled to end on{" "}
          {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : "N/A"}
        </p>
      </div>
    );
  }

  // Show cancel confirmation dialog
  if (showConfirm) {
    return (
      <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-yellow-900 mb-2">
            Cancel {planName} Plan?
          </h3>
          <p className="text-sm text-yellow-800 mb-1">
            Your subscription will remain active until{" "}
            <strong>
              {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : "the end of the billing period"}
            </strong>
            .
          </p>
          <p className="text-sm text-yellow-800">
            After that, you'll lose access to all premium features.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1"
          >
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Canceling..." : "Yes, Cancel"}
          </Button>
        </div>
      </div>
    );
  }

  // Show cancel button
  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      <Button
        variant="outline"
        onClick={() => setShowConfirm(true)}
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Cancel Subscription
      </Button>
    </div>
  );
}
