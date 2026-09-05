import { Navbar } from './sections/navbar';
import { Hero } from './sections/hero';
import { Features } from './sections/features';
import { Pricing } from './sections/pricing';
import { Testimonials } from './sections/testimonials';
import { Footer } from './sections/footer';

export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
