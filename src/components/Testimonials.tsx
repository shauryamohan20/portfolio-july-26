import Section from "./Section";
import { testimonials } from "@/data/content";

export default function Testimonials() {
  return (
    <Section
      eyebrow="Kind Words"
      title="What clients say"
      description="Feedback from freelance clients I've worked with."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5"
          >
            <div aria-hidden className="text-3xl leading-none text-accent">&ldquo;</div>
            <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {t.quote}
            </blockquote>
            <figcaption className="mt-4 border-t border-border pt-4">
              <div className="text-sm font-semibold">{t.author}</div>
              <div className="text-xs text-muted">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
