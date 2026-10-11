import SectionTitle from "./SectionTitle";
import ProjectCard from "./ProjectCard";
import { readProjects } from "@/lib/projects-store";

export default async function Projects() {
  const projects = await readProjects();

  return (
    <div id="projects" className="relative flex scroll-mt-24 flex-col justify-between pt-8 text-left">
      <SectionTitle title="Here are a few of my favorite projects." />
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-3 md:gap-5">
        {projects.map((item) => (
          <ProjectCard key={item.id} project={item} />
        ))}
      </div>
    </div>
  );
}
