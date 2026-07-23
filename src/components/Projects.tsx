import Section from "./Section";
import { projects } from "@/data/content";
import { ArrowUpRight } from "./Icons";

export default function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Featured Work"
      title="Projects I've built"
      description="A selection of client and personal projects — from e-commerce storefronts to custom web platforms."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((p) => {
          const card = (
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
              <div
                className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${p.gradient}`}
              >
                <span className="text-3xl font-bold text-white/90 drop-shadow-sm">
                  {p.title}
                </span>
                {p.href && (
                  <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <ArrowUpRight width={16} height={16} />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {p.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );

          return p.href ? (
            <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer">
              {card}
            </a>
          ) : (
            <div key={p.title}>{card}</div>
          );
        })}
      </div>
    </Section>
  );
}
