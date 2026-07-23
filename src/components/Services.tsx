import Section from "./Section";
import { services, skills } from "@/data/content";
import { icons } from "./Icons";

export default function Services() {
  return (
    <Section
      id="services"
      eyebrow="What I Do"
      title="Services & toolbelt"
      description="I work across the full stack — here's how I can help and the tools I reach for."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => {
          const Icon = icons[s.icon];
          return (
            <div
              key={s.title}
              className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                {Icon && <Icon width={22} height={22} />}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-muted">Technologies I work with</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
