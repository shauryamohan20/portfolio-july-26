"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/project-types";

const PER_PAGE = 6;

/**
 * The project grid, paginated once there are more than six projects.
 * Paging happens on the client so the page stays static and switching is
 * instant — no reload, no scroll jump.
 */
export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(projects.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PER_PAGE;
  const visible = projects.slice(start, start + PER_PAGE);

  return (
    <div>
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-3 md:gap-5">
        {visible.map((item) => (
          <ProjectCard key={item.id} project={item} />
        ))}
      </div>

      {pageCount > 1 && (
        <nav
          aria-label="Project pages"
          className="mt-14 flex flex-wrap items-center justify-center gap-2 md:justify-start"
        >
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current === 1}
            aria-label="Previous page"
            className="rounded-lg border border-fun-gray-darker px-3 py-2 text-sm text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30 disabled:hover:border-fun-gray-darker disabled:hover:text-fun-gray"
          >
            ←
          </button>

          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => {
            const active = number === current;
            return (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                aria-label={`Page ${number}`}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "min-w-10 rounded-lg bg-fun-pink px-3 py-2 text-sm font-bold text-bg"
                    : "min-w-10 rounded-lg border border-fun-gray-darker px-3 py-2 text-sm text-fun-gray-light transition-colors hover:border-fun-pink hover:text-fun-pink"
                }
              >
                {number}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current === pageCount}
            aria-label="Next page"
            className="rounded-lg border border-fun-gray-darker px-3 py-2 text-sm text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30 disabled:hover:border-fun-gray-darker disabled:hover:text-fun-gray"
          >
            →
          </button>
        </nav>
      )}
    </div>
  );
}
