import SectionTitle from "./SectionTitle";
import ProjectsGrid from "./ProjectsGrid";
import { readProjects } from "@/lib/projects-store";

export default async function Projects() {
  const projects = await readProjects();

  return (
    <div id="projects" className="relative flex scroll-mt-24 flex-col justify-between pt-8 text-left">
      <SectionTitle title="Here are a few of my favorite projects." />
      <ProjectsGrid projects={projects} />
    </div>
  );
}
