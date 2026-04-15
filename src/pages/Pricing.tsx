import { Link } from "react-router-dom";
import { ArrowRight, Camera, Brain, Bell, Clock, Check } from "lucide-react";

const features = [
  { icon: Camera, text: "Unlimited screenshot uploads" },
  { icon: Brain, text: "AI-powered task extraction" },
  { icon: Clock, text: "Automatic deadline detection" },
  { icon: Bell, text: "Deadline notifications" },
  { icon: Check, text: "Categories, archiving & search" },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon.svg" alt="Unscreenshot" className="w-7 h-7 rounded-lg" />
          <span className="text-[17px] font-semibold tracking-tight">Unscreenshot</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/auth"
            className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Pricing content */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="max-w-md w-full mx-auto text-center">
          <h1 className="text-[32px] md:text-[48px] leading-[1.1] tracking-tight font-bold mb-4">
            Pricing
          </h1>
          <p className="text-[17px] text-muted-foreground leading-relaxed mb-10">
            One plan. Everything included.
          </p>

          {/* Plan card */}
          <div className="border border-border rounded-card bg-card p-6 md:p-8 text-left">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[36px] md:text-[48px] font-bold tracking-tight">$X</span>
              <span className="text-[15px] text-muted-foreground">/month</span>
            </div>
            <p className="text-[13px] text-muted-foreground mb-6">Pricing coming soon</p>

            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[14px] md:text-[15px]">{f.text}</span>
                </li>
              ))}
            </ul>

            {/* Discount code */}
            <div className="mb-6">
              <label className="text-[13px] font-medium text-muted-foreground mb-1.5 block">
                Have a discount code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 rounded-btn border border-border bg-background text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button className="px-4 py-2 rounded-btn border border-border bg-muted text-[13px] font-medium text-foreground hover:bg-muted/80 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-5 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 lg:px-20 py-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-[13px] text-muted-foreground">
            © {new Date().getFullYear()} Unscreenshot
          </span>
          <Link
            to="/auth"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
