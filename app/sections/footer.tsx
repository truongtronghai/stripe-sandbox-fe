export function Footer() {
  return (
    <footer id="footer" className="border-t px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Acme Inc. All rights reserved.
          </p>
          <div className="text-muted-foreground flex gap-4 text-sm">
            <a href="mailto:hello@acme.com" className="hover:text-foreground">
              hello@acme.com
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
