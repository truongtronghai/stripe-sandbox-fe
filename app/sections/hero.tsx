'use client';

import { Button } from '@/components/ui/button';
import { DotPattern } from '@/components/ui/dot-pattern';
import { Globe3D } from '@/components/ui/3d-globe';
import type { GlobeMarker } from '@/components/ui/3d-globe';
import { cn } from '@/lib/utils';
import { sampleMarkers } from '@/data/globe3d-markers';

export interface HeroConfig {
  heading: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  showGlobe: boolean;
  alignment: 'left' | 'center';
  onMarkerClick: (marker: GlobeMarker) => void;
  onMarkerHover: (marker: GlobeMarker | null) => void;
}

export interface HeroProps {
  config?: Partial<HeroConfig>;
}

const heroDefaultConfig: HeroConfig = {
  heading: 'Build Something Amazing',
  subtitle:
    'The modern platform that helps global teams ship faster, scale easier, and collaborate better. Start JOINING today.',
  primaryCtaLabel: 'Get Started',
  secondaryCtaLabel: 'Learn More',
  showGlobe: true,
  alignment: 'left',
  onMarkerClick: () => undefined,
  onMarkerHover: () => undefined,
};

export function Hero({ config = {} }: HeroProps) {
  const {
    heading,
    subtitle,
    primaryCtaLabel,
    secondaryCtaLabel,
    showGlobe,
    alignment,
    onMarkerClick,
    onMarkerHover,
  } = { ...heroDefaultConfig, ...config } satisfies HeroConfig;

  const isCentered = alignment === 'center';

  const hasOverlap = alignment === 'left' && showGlobe;

  return (
    <section
      id="hero"
      className="flex min-h-[80vh] items-start justify-center px-4 pt-2 pb-1 md:items-center md:pt-18"
    >
      <div className="bg-card md:border-border/60 relative w-full max-w-6xl overflow-hidden rounded-3xl border-0 shadow-none md:border md:shadow-lg">
        <div
          aria-hidden
          className="from-primary/10 to-secondary/10 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent"
        />

        <div
          className={cn(
            'relative flex flex-col-reverse gap-8 px-8 py-12 sm:px-12',
            isCentered ? 'items-center text-center' : 'items-start lg:flex-row lg:items-center',
          )}
        >
          <div
            className={cn(
              'relative flex flex-1 flex-col',
              isCentered ? 'items-center' : hasOverlap && 'lg:-mr-[7.5rem]',
            )}
          >
            <DotPattern className="text-primary/15" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{heading}</h1>
              <p className="text-muted-foreground mt-6 max-w-2xl text-lg">{subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg">{primaryCtaLabel}</Button>
                <Button size="lg" variant="outline">
                  {secondaryCtaLabel}
                </Button>
              </div>
            </div>
          </div>

          {showGlobe && (
            <div
              className={cn(
                'flex w-full justify-center lg:w-auto',
                isCentered ? 'mt-4 w-full' : 'lg:shrink-0',
              )}
            >
              <div className={cn('size-56 sm:size-64', isCentered ? 'lg:size-96' : 'lg:size-120')}>
                <Globe3D
                  className="h-full w-full"
                  markers={sampleMarkers}
                  config={{
                    atmosphereColor: '#4da6ff',
                    atmosphereIntensity: 20,
                    bumpScale: 5,
                    autoRotateSpeed: 0.3,
                  }}
                  onMarkerClick={onMarkerClick}
                  onMarkerHover={onMarkerHover}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
