import { testimonials } from '@/data/testimonials';
import { Marquee } from '@/components/ui/marquee';
import ReviewCard from '@/components/review-card';

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

export function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">Testimonials</h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center">
          See what our customers have to say.
        </p>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((review, idx) => (
              <ReviewCard
                key={`row-1-${review.name}-${new Date().getTime().toString()}-${idx}`}
                {...review}
              />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((review, idx) => (
              <ReviewCard
                key={`row-2-${review.name}-${new Date().getTime().toString()}-${idx}`}
                {...review}
              />
            ))}
          </Marquee>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
        </div>
      </div>
    </section>
  );
}
