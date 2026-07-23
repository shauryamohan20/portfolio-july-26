import { profile, socials } from "@/data/content";
import { icons, MailIcon, ArrowUpRight } from "./Icons";

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-3xl px-5">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Interested in working together?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              I&apos;m currently available for freelance projects. Drop me a line and
              let&apos;s build something great.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              <MailIcon width={18} height={18} />
              {profile.email}
            </a>

            <div className="mt-8 flex items-center justify-center gap-3">
              {socials.map((s) => {
                const Icon = icons[s.icon];
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-muted transition-colors hover:text-accent"
                  >
                    {Icon && <Icon width={20} height={20} />}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
