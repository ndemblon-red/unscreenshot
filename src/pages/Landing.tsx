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

            {/* Fake app header */}
            <div className="px-4 md:px-6 pt-4 md:pt-5 flex items-center justify-between">
              <span className="text-[17px] md:text-[20px] font-bold tracking-tight">Unscreenshot</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-btn bg-primary text-primary-foreground text-[12px] md:text-[13px] font-medium">
                  Upload Screenshots
                </div>
              </div>
            </div>

            {/* Fake tabs */}
            <div className="px-4 md:px-6 mt-3 flex gap-0 border-b border-border">
              <div className="px-4 py-2 text-[13px] md:text-[14px] font-medium text-foreground border-b-2 border-primary">
                Next
              </div>
              <div className="px-4 py-2 text-[13px] md:text-[14px] font-medium text-muted-foreground">
                Done
              </div>
              <div className="px-4 py-2 text-[13px] md:text-[14px] font-medium text-muted-foreground">
                Archive
              </div>
            </div>

            {/* Fake category pills */}
            <div className="px-4 md:px-6 pt-3 flex gap-2 overflow-hidden">
              {["Everything", "Restaurants", "Shopping", "Events", "Reading"].map((cat, i) => (
                <span
                  key={cat}
                  className={`px-2.5 py-1 rounded-full text-[11px] md:text-[12px] font-medium whitespace-nowrap ${
                    i === 0
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Fake task cards */}
            <div className="p-4 md:px-6 md:pb-6 md:pt-3 space-y-2.5">
              {[
                {
                  title: "Book table at Dishoom",
                  cat: "Restaurants",
                  catClass: "bg-tag-restaurants text-white",
                  deadline: "Today · 9 AM",
                  urgency: "today" as const,
                  img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&h=120&fit=crop",
                },
                {
                  title: "Buy running shoes",
                  cat: "Shopping",
                  catClass: "bg-tag-shopping text-white",
                  deadline: "Tomorrow · 9 AM",
                  urgency: "tomorrow" as const,
                  img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop",
                },
                {
                  title: "Register for React conf",
                  cat: "Events",
                  catClass: "bg-tag-events text-white",
                  deadline: "23 Apr · 9 AM",
                  urgency: null,
                  img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop",
                },
                {
                  title: "Read system design article",
                  cat: "Reading",
                  catClass: "bg-tag-reading text-white",
                  deadline: "Next Week",
                  urgency: null,
                  img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&h=120&fit=crop",
                },
              ].map((task, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-card border p-3 ${
                    task.urgency === "today"
                      ? "border-destructive/50 bg-destructive/5"
                      : task.urgency === "tomorrow"
                      ? "border-orange-400/50 bg-orange-50/50"
                      : "border-border bg-background"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-11 h-11 md:w-14 md:h-14 rounded-btn overflow-hidden flex-shrink-0 bg-muted">
                    <img src={task.img} alt={task.title} className="w-full h-full object-cover" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] md:text-[14px] font-medium truncate">{task.title}</span>
                      {task.urgency === "today" && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide bg-destructive text-destructive-foreground whitespace-nowrap">
                          Due today
                        </span>
                      )}
                      {task.urgency === "tomorrow" && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide bg-orange-500 text-white whitespace-nowrap">
                          Due tomorrow
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] uppercase font-semibold ${task.catClass}`}>
                        {task.cat}
                      </span>
                      <span className="text-[11px] md:text-[12px] text-muted-foreground">{task.deadline}</span>
                    </div>
                  </div>
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
