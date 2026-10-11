import Image from "next/image";
import Link from "next/link";
import { deleteProject, moveProject } from "./actions";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import { readProjectsForAdmin, storageMode } from "@/lib/projects-store";

// The list must always reflect what is on disk right now.
export const dynamic = "force-dynamic";

export default async function AdminHome(props: PageProps<"/admin">) {
  const projects = await readProjectsForAdmin();
  const mode = storageMode();
  const { saved, deleted } = await props.searchParams;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-fun-gray">
            {projects.length} {projects.length === 1 ? "project" : "projects"}, shown on the
            home page in this order.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-full bg-fun-pink px-5 py-2.5 text-sm font-bold text-bg transition-opacity hover:opacity-80"
        >
          + Add project
        </Link>
      </div>

      {(saved || deleted) && (
        <p className="mt-6 rounded-lg border border-fun-pink/40 bg-fun-pink-darker px-4 py-3 text-sm text-fun-pink">
          {saved ? "Project saved." : "Project deleted."}
          {mode === "github" &&
            " Committed to GitHub — the live site updates once the rebuild finishes."}
        </p>
      )}

      <ul className="mt-8 list-none space-y-4">
        {projects.map((project, index) => (
          <li
            key={project.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-fun-gray-darker p-4 transition-colors hover:border-fun-pink"
          >
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-fun-pink-dark">
              <Image
                src={project.img}
                alt=""
                fill
                sizes="112px"
                className="object-cover object-top"
              />
            </div>

            <div className="min-w-50 flex-1">
              <h2 className="font-bold">{project.title}</h2>
              <p className="font-mono text-xs text-fun-gray">/projects/{project.slug}</p>
              <p className="mt-1 line-clamp-1 text-sm text-fun-gray-light">{project.desc}</p>
            </div>

            <div className="flex items-center gap-1">
              <form action={moveProject}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label={`Move ${project.title} up`}
                  className="rounded-lg border border-fun-gray-darker px-2.5 py-1.5 text-xs text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30 disabled:hover:border-fun-gray-darker disabled:hover:text-fun-gray"
                >
                  ↑
                </button>
              </form>
              <form action={moveProject}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  disabled={index === projects.length - 1}
                  aria-label={`Move ${project.title} down`}
                  className="rounded-lg border border-fun-gray-darker px-2.5 py-1.5 text-xs text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30 disabled:hover:border-fun-gray-darker disabled:hover:text-fun-gray"
                >
                  ↓
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/${project.id}`}
                className="rounded-full border border-fun-pink px-4 py-1.5 text-xs font-bold text-fun-pink transition-colors hover:bg-fun-pink hover:text-bg"
              >
                Edit
              </Link>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={project.id} />
                <DeleteProjectButton title={project.title} />
              </form>
            </div>
          </li>
        ))}
      </ul>

      {projects.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-fun-gray-darker p-10 text-center text-fun-gray">
          No projects yet. Add your first one.
        </p>
      )}
    </div>
  );
}
