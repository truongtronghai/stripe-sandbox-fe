'use client';

import { useState } from 'react';
import { pricingTiers } from '@/data/pricing';
import { useSelectPlan } from '@/hooks/use-select-plan';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function Pricing() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { mutate, isPending, isSuccess, isError, data } = useSelectPlan();

  const handleSelect = (planId: string) => {
    setSelectedTier(planId);
    mutate({ planId });
  };

  return (
    <section id="pricing" className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">Pricing</h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center">
          Choose the plan that works for you.
        </p>

        {isSuccess && data && (
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            {data.message}
          </div>
        )}

        {isError && (
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            Something went wrong. Please try again.
          </div>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={
                tier.isRecommended
                  ? 'ring-primary ring-2'
                  : selectedTier === tier.id
                    ? 'ring-primary/50 ring-2'
                    : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tier.name}</CardTitle>
                  {tier.isRecommended && <Badge>Recommended</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tier.price}</p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <Check className="text-primary h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.isRecommended ? 'default' : 'outline'}
                  disabled={isPending && selectedTier === tier.id}
                  onClick={() => handleSelect(tier.id)}
                >
                  {isPending && selectedTier === tier.id ? 'Selecting...' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
