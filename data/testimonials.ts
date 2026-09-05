export interface Testimonial {
  name: string;
  quote: string;
  company: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    quote: 'This platform transformed how our team works. We shipped 3x faster in the first month.',
    company: 'TechCorp Inc.',
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    quote: 'The best investment we made this year. ROI was visible within weeks.',
    company: 'StartupXYZ',
    avatar: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    quote: 'Finally, a tool that does what it promises. Clean, fast, and reliable.',
    company: 'DesignStudio',
    avatar: 'ER',
  },
];
