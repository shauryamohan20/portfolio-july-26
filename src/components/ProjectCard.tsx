import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/project-types";

export default function ProjectCard({ project }: { project: Project }) {
  const detail = `/projects/${project.slug}`;

  return (
    <div className="mx-auto flex h-full w-full max-w-sm flex-col">
      <Link
        href={detail}
        aria-label={`${project.title} — case study`}
        className="relative block w-full overflow-hidden rounded-xl border border-fun-gray p-2 transition duration-200 hover:-translate-y-1 hover:border-fun-pink"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-fun-pink-dark">
          <Image
            src={project.img}
            alt={project.imgAlt}
            fill
            sizes="(max-width: 768px) 90vw, 33vw"
            className="object-cover object-top"
          />
        </div>
      </Link>
      <div className="mt-5 flex w-full flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold">
            <Link href={detail} className="transition-colors hover:text-fun-pink">
              {project.title}
            </Link>
          </h3>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open the ${project.title} website`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <Link
            href={detail}
            className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-fun-pink px-3 py-1.5 text-xs font-bold text-bg transition-opacity hover:opacity-80"
          >
            Case Study
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </Link>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-fun-pink px-3 py-1.5 text-xs font-bold text-fun-pink transition-colors hover:bg-fun-pink hover:text-bg"
            >
              Visit Website
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
