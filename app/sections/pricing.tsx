"use client";

import { useState } from "react";
import { pricingTiers } from "@/data/pricing";
import { useWebSocket } from "@/components/websocket-provider";
import InfoPanel from "@/components/info-panel";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ShineBorder } from "@/components/ui/shine-border";
import Link from "next/link";
import { cn } from "cn";

export function Pricing() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { status, lastMessage, isProcessing } = useWebSocket();

  const handleSelect = (planId: string) => {
    setSelectedTier(planId);
  };

  const maxFeatureCount = Math.max(...pricingTiers.map((tier) => tier.features.length));

  const disabled = isProcessing || status !== "connected";

  const panel = lastMessage
    ? { type: lastMessage.type, message: lastMessage.message }
    : status === "connecting"
      ? { type: "inProgress" as const, message: "Connecting to plan service..." }
      : null;

  return (
    <section id="pricing" className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">Pricing</h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center">
          Choose the plan that works for you.
        </p>

        {panel && (
          <div className="mx-auto mt-6 flex max-w-md justify-center">
            <InfoPanel type={panel.type} message={panel.message} />
          </div>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={
                tier.isRecommended
                  ? "relative"
                  : selectedTier === tier.id
                    ? "ring-primary/50 ring-2"
                    : ""
              }
            >
              {tier.isRecommended && <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tier.name}</CardTitle>
                  {tier.isRecommended && <Badge>Recommended</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-3xl font-bold">{tier.price}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <Check className="text-primary h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                  {Array.from({ length: maxFeatureCount - tier.features.length }, (_, index) => (
                    <li
                      key={`empty-${index}`}
                      aria-hidden="true"
                      className="invisible flex items-center gap-2 text-sm"
                    >
                      <Check className="text-primary h-4 w-4" />
                      placeholder
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link
                  href={tier.paymentLink || "#"}
                  target="_blank"
                  aria-disabled={disabled} // Announces disabled state to screen readers
                  onNavigate={() => handleSelect(tier.id)}
                  className={cn(
                    buttonVariants({ variant: tier.isRecommended ? "default" : "outline" }),
                    "w-full",
                    disabled && "pointer-events-none cursor-not-allowed opacity-50", // Disables pointer events visually
                  )}
                >
                  {isProcessing && selectedTier === tier.id ? "Selecting..." : "Select Plan"}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
