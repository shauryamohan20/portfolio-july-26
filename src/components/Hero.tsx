import { profile } from "@/data/content";
import { ArrowUpRight, MailIcon } from "./Icons";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-16 pb-20 sm:pt-24">
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }}
      />
      <div className="mx-auto max-w-3xl px-5">
        <div className="animate-fadeUp">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Available for freelance work
          </span>
        </div>

        <h1 className="animate-fadeUp mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Hey, I&apos;m {profile.firstName}.
          <span className="ml-2 inline-block animate-floaty">👋</span>
        </h1>

        <p className="animate-fadeUp mt-4 max-w-xl text-lg text-muted">
          {profile.tagline}
        </p>

        <p className="animate-fadeUp mt-4 max-w-xl leading-relaxed text-muted">
          {profile.intro}
        </p>

        <div className="animate-fadeUp mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            <MailIcon width={18} height={18} />
            Get in touch
          </a>
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium transition-colors hover:text-accent"
          >
            View my work
            <ArrowUpRight width={16} height={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
