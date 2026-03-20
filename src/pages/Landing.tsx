import { Camera, Brain, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import heroMockup from "@/assets/hero-mockup.png";

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
    icon: Mail,
    title: "You get nudged",
    description: "An email lands before the deadline. You act on it or you don't. Up to you.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="min-h-[90vh] flex items-center justify-center px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text */}
          <div>
            <h1 className="text-[32px] md:text-[48px] leading-[1.1] tracking-tight font-bold mb-6">
              You screenshot everything.{" "}
              <span className="text-muted-foreground">You action nothing.</span>{" "}
              Let's fix that.
            </h1>
            <p className="text-[17px] md:text-[19px] text-muted-foreground leading-relaxed mb-8 max-w-md">
              Upload your screenshots. AI turns them into reminders. You get an email before the deadline. That's it.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-btn text-[16px] font-medium hover:opacity-90 transition-opacity"
            >
              Turn my screenshots into reminders
            </Link>
          </div>

          {/* Hero mockup */}
          <div className="flex items-center justify-center">
            <img
              src={heroMockup}
              alt="App screenshot showing reminders organized by category with deadlines"
              className="w-full max-w-xs md:max-w-sm drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Pain statement */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[20px] md:text-[24px] leading-relaxed text-muted-foreground">
            Your camera roll is full of good intentions. Concert dates, booking confirmations,
            product recommendations, things you swore you'd get back to. You won't. Not without a nudge.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-muted/30">
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
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20 text-center">
        <h2 className="text-[24px] md:text-[32px] font-bold tracking-tight mb-4">
          Stop screenshotting into the void
        </h2>
        <p className="text-[17px] text-muted-foreground mb-8 max-w-md mx-auto">
          Turn your camera roll into a to-do list that actually follows up.
        </p>
        <a
          href={PAYMENT_LINK}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-btn text-[16px] font-medium hover:opacity-90 transition-opacity"
        >
          Turn my screenshots into reminders
        </a>
      </section>
    </div>
  );
}
