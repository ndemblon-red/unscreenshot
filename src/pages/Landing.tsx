import { Camera, Brain, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Camera,
    title: "Upload screenshots",
    description: "Drag in the screenshots clogging your camera roll. Batch upload, no fuss.",
  },
  {
    icon: Brain,
    title: "AI reads them",
    description: "It figures out what the screenshot is about, sets a category and a deadline.",
  },
  {
    icon: Bell,
    title: "You get nudged",
    description: "A notification lands before the deadline. You act on it or you don't. Up to you.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-[17px] font-semibold tracking-tight">Unscreenshot</span>
        <Link
          to="/auth"
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="max-w-2xl w-full text-center mx-auto">
          <h1 className="text-[32px] md:text-[48px] leading-[1.1] tracking-tight font-bold mb-6">
            You screenshot everything.{" "}
            <span className="text-muted-foreground">You action nothing.</span>
          </h1>
          <p className="text-[17px] md:text-[19px] text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            Upload your screenshots. AI turns them into reminders with deadlines. You get nudged before they expire. That's it.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-btn text-[16px] font-medium hover:opacity-90 transition-opacity"
          >
            Turn my screenshots into reminders
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* App mockup */}
        <div className="mt-12 md:mt-16 w-full max-w-3xl mx-auto">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Fake title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-[12px] text-muted-foreground/50 bg-muted/60 rounded px-3 py-0.5">
                  unscreenshot.app
                </div>
              </div>
              <div className="w-[42px]" />
            </div>
            {/* Fake task list */}
            <div className="p-4 md:p-6 space-y-3">
              {[
                { title: "Book table at Dishoom", cat: "Restaurants", color: "bg-tag-restaurants", deadline: "Tomorrow · 9 AM" },
                { title: "Buy running shoes from screenshot", cat: "Shopping", color: "bg-tag-shopping", deadline: "Sat · 9 AM" },
                { title: "Register for React conference", cat: "Events", color: "bg-tag-events", deadline: "23 Apr · 9 AM" },
                { title: "Read article on system design", cat: "Reading", color: "bg-tag-reading", deadline: "Next Week" },
              ].map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${task.color} shrink-0`} />
                    <span className="text-[14px] md:text-[15px] font-medium truncate">{task.title}</span>
                  </div>
                  <span className="text-[12px] md:text-[13px] text-muted-foreground whitespace-nowrap ml-4">
                    {task.deadline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 px-6 md:px-12 lg:px-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[24px] md:text-[32px] font-bold tracking-tight text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="border border-border rounded-card bg-card p-6 flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-[17px] font-semibold">{step.title}</h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 px-6 md:px-12 lg:px-20 text-center">
        <h2 className="text-[24px] md:text-[32px] font-bold tracking-tight mb-4">
          Stop screenshotting into the void
        </h2>
        <p className="text-[17px] text-muted-foreground mb-8 max-w-md mx-auto">
          Turn your camera roll into a to-do list that actually follows up.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-btn text-[16px] font-medium hover:opacity-90 transition-opacity"
        >
          Turn my screenshots into reminders
          <ArrowRight className="w-4 h-4" />
        </Link>
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
