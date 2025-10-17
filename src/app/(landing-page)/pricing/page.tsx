"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: "$10",
    period: "/month",
    features: ["Up to 5 projects", "Email support", "Basic analytics"],
    stripePriceId: "price_1SIt5p3P3m57LZDTFRa3N5zU",
  },
  {
    name: "Pro",
    price: "$25",
    period: "/month",
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "API access",
    ],
    stripePriceId: "price_1SIt8k3P3m57LZDTULn68WrL",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$50",
    period: "/month",
    features: [
      "All Pro features",
      "Team accounts",
      "Custom integrations",
      "Dedicated support",
    ],
    stripePriceId: "price_1SIt9S3P3m57LZDTY1Iporxc",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      console.log("Starting checkout with priceId:", priceId);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      console.log("Checkout response:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        }`
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600">
          Simple, transparent pricing for everyone
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col shadow-lg rounded-2xl transition-transform hover:scale-105${
              plan.popular ? "border-2 border-blue-500 relative" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}
            <CardHeader className="text-center pb-8 pt-6">
              <CardTitle className="text-3xl font-bold mb-2">
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start text-gray-700">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                disabled={loading !== null}
                onClick={() => handleCheckout(plan.stripePriceId)}
                className={`w-full py-6 text-lg font-semibold ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-800 hover:bg-gray-900"
                }`}
              >
                {loading === plan.stripePriceId ? "Loading..." : "Get Started"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
