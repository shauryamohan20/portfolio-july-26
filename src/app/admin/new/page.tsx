import ProjectForm from "@/components/admin/ProjectForm";
import { emptyProject } from "@/lib/project-types";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Add a project</h1>
      <p className="mt-1 text-sm text-fun-gray">
        It appears at the end of the home page grid; reorder it from the project list.
      </p>
      <div className="mt-8">
        <ProjectForm project={emptyProject()} />
      </div>
    </div>
  );
}
