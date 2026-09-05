import { cn } from '@/lib/utils';
import type React from 'react';
import { GridPattern } from '@/components/ui/grid-pattern';
import { FeatureType } from '@/types/feature-type';

type FeatureProps = {
  features: FeatureType[];
};

export function FeatureSection({ features }: FeatureProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-medium text-balance md:text-4xl lg:text-5xl">
          Power. Speed. Control.
        </h2>
        <p className="text-muted-foreground mt-4 text-sm text-balance md:text-base">
          Everything you need to build fast, secure, scalable apps.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="bg-border grid grid-cols-1 gap-px sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard feature={feature} key={feature.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureCard({
  feature,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  feature: FeatureType;
}) {
  return (
    <div className={cn('bg-background relative overflow-hidden p-6', className)} {...props}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full mask-[radial-gradient(farthest-side_at_top,white,transparent)]">
        <GridPattern
          className="stroke-foreground/20 absolute inset-0 size-full"
          height={40}
          width={40}
          x={20}
        />
      </div>
      <div className="[&_svg]:text-primary [&_svg]:size-6">{feature.icon}</div>
      <h3 className="mt-10 text-sm md:text-base">{feature.title}</h3>
      <p className="text-muted-foreground relative z-20 mt-2 text-xs font-light">
        {feature.description}
      </p>
    </div>
  );
}
