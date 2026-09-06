export interface PricingTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  isRecommended: boolean;
  paymentLink?: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "trial",
    name: "Trial",
    price: "$0/mo",
    features: ["5 projects", "10GB storage", "Basic analytics", "Email support"],
    isRecommended: false,
    paymentLink: "https://buy.stripe.com/test_dRm8wO8mx1yP1CX7cH4ZG00",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$29/mo",
    features: [
      "Unlimited projects",
      "100GB storage",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
    ],
    isRecommended: true,
    paymentLink: "https://buy.stripe.com/test_00w9ASbyJ2CTepJ9kP4ZG01",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99/mo",
    features: [
      "Unlimited everything",
      "1TB storage",
      "Custom analytics",
      "Dedicated support",
      "SLA guarantee",
      "On-premise option",
    ],
    isRecommended: false,
    paymentLink: "https://buy.stripe.com/test_6oU4gygT3b9p2H154z4ZG02",
  },
];
