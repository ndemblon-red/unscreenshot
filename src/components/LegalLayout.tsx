import { Link } from "react-router-dom";

interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, effectiveDate, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="w-full px-6 md:px-12 lg:px-20 py-5">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="Unscreenshot" className="w-7 h-7 rounded-md" />
            <span className="text-[15px] font-medium">Unscreenshot</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-10">Effective {effectiveDate}</p>
          <article className="max-w-none text-[15px] leading-relaxed space-y-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-foreground [&_strong]:font-medium">
            {children}
          </article>
        </div>
      </main>

      <footer className="px-6 md:px-12 lg:px-20 py-6 border-t border-border mt-12">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-[13px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Unscreenshot</span>
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
