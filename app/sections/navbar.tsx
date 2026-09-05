'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Layers, CreditCard, MessageSquare, Sun, Moon } from 'lucide-react';

const sections = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.5 },
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop: fixed top */}
      <nav className="bg-background/80 fixed top-0 z-50 hidden w-full border-b backdrop-blur-sm md:block">
        <div className="mx-auto grid h-14 max-w-6xl grid-cols-3 items-center px-4">
          <span className="text-lg font-bold">Acme</span>
          <div className="flex justify-center gap-1">
            {sections.map(({ id, label }) => (
              <Button
                key={id}
                variant={activeSection === id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => scrollTo(id)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile: fixed bottom */}
      <nav className="bg-background/80 fixed bottom-0 z-50 w-full border-t backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          {sections.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? 'secondary' : 'ghost'}
              className="flex h-auto flex-col gap-1 rounded-lg px-3 py-2"
              onClick={() => scrollTo(id)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            className="flex h-auto flex-col gap-1 rounded-lg px-3 py-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-xs">Theme</span>
          </Button>
        </div>
      </nav>
    </>
  );
}
