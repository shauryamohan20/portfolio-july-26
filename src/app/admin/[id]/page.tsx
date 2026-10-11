import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProjectById } from "@/lib/projects-store";

export const dynamic = "force-dynamic";

export default async function EditProjectPage(props: PageProps<"/admin/[id]">) {
  const { id } = await props.params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit {project.title}</h1>
      <p className="mt-1 font-mono text-xs text-fun-gray">/projects/{project.slug}</p>
      <div className="mt-8">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
