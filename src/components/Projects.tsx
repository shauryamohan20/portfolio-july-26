import SectionTitle from "./SectionTitle";
import ProjectCard from "./ProjectCard";
import { projects } from "@/data/content";

export default function Projects() {
  return (
    <div id="projects" className="relative flex scroll-mt-24 flex-col justify-between pt-8 text-left">
      <SectionTitle title="Here are a few of my favorite projects." />
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-3 md:gap-5">
        {projects.slice(0, 6).map((item) => (
          <ProjectCard key={item.id} project={item} />
        ))}
      </div>
    </div>
  );
}
