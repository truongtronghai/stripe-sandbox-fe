import { testimonials } from '@/data/testimonials';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">Testimonials</h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center">
          See what our customers have to say.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardHeader>
                <CardContent className="px-0">
                  <p className="text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                </CardContent>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{testimonial.name}</CardTitle>
                    <CardDescription>{testimonial.company}</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
