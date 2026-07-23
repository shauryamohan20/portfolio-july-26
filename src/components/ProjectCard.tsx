import type { Project } from "@/data/content";

/* eslint-disable @next/next/no-img-element */

export default function ProjectCard({ project }: { project: Project }) {
  const href = project.link || project.github;
  const Wrapper = href ? "a" : "div";
  const wrapperProps = href
    ? { href, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center">
      <Wrapper
        {...wrapperProps}
        className="relative w-full rounded-xl border border-fun-gray p-2 transition hover:-translate-y-2 hover:border-fun-pink hover:opacity-75"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-full rounded-md" src={project.img} alt={project.title} />
      </Wrapper>
      <div className="mt-5 w-full">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{project.title}</h3>
          {href && (
            <a href={href} target="_blank" rel="noreferrer" aria-label="Open project">
              <img src="/static/icons/external-link.svg" width={16} height={16} alt="" />
            </a>
          )}
        </div>
        <p className="text-left text-sm text-fun-gray">{project.desc}</p>
        <ul className="-ml-2 mt-2 flex list-none flex-wrap items-center">
          {project.tags.map((tag) => (
            <li key={tag}>
              <div className="m-1 cursor-default rounded-lg bg-fun-pink-dark px-2 py-1 text-sm">
                {tag}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
