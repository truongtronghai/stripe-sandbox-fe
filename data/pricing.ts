export interface PricingTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  isRecommended: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$9/mo',
    features: ['5 projects', '10GB storage', 'Basic analytics', 'Email support'],
    isRecommended: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$29/mo',
    features: [
      'Unlimited projects',
      '100GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
    ],
    isRecommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99/mo',
    features: [
      'Unlimited everything',
      '1TB storage',
      'Custom analytics',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
    ],
    isRecommended: false,
  },
];
