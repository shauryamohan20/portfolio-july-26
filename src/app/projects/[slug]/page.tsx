import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { profile } from "@/data/content";
import { getProjectBySlug, readProjects } from "@/lib/projects-store";

export async function generateStaticParams() {
  const projects = await readProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: `Project not found — ${profile.name}` };
  }

  return {
    title: `${project.title} — ${profile.name}`,
    description: project.desc,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — ${profile.name}`,
      description: project.desc,
      type: "article",
      url: `/projects/${project.slug}`,
      images: [{ url: project.heroImg || project.img, alt: project.heroImgAlt || project.imgAlt }],
    },
  };
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const more = (await readProjects()).filter((item) => item.slug !== project.slug).slice(0, 3);

  return (
    <div
      className="m-auto flex min-h-screen w-full flex-col items-center justify-center text-white"
      style={{ maxWidth: "1200px" }}
    >
      <main className="w-full flex-1 p-5">
        <Navbar />

        <article className="pt-16">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-fun-gray transition-colors hover:text-fun-pink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="11 18 5 12 11 6" />
            </svg>
            All projects
          </Link>

          <p className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.2em] text-fun-pink">
            {project.category}
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-2xl text-fun-gray-light">{project.desc}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-fun-pink px-5 py-2.5 text-sm font-bold text-bg transition-opacity hover:opacity-80"
              >
                Visit Live Site
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            ) : (
              project.status && (
                <p className="rounded-full border border-fun-pink-dark bg-fun-pink-darker px-5 py-2.5 text-sm text-fun-gray-light">
                  {project.status}
                </p>
              )
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-fun-pink px-5 py-2.5 text-sm font-bold text-fun-pink transition-colors hover:bg-fun-pink hover:text-bg"
              >
                Source Code
              </a>
            )}
          </div>

          {/* Screenshots are 1920x911; keep that ratio so nothing is cropped. */}
          <div className="relative mt-12 aspect-[1920/911] w-full overflow-hidden rounded-xl border border-fun-gray-darker bg-fun-pink-dark">
            <Image
              src={project.heroImg || project.img}
              alt={project.heroImgAlt || project.imgAlt}
              fill
              sizes="(max-width: 1200px) 100vw, 1160px"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <div className="md:col-span-2">
              {/* No printed heading: the body carries its own title. */}
              {project.overviewHtml ? (
                <div
                  className="richText"
                  dangerouslySetInnerHTML={{ __html: project.overviewHtml }}
                />
              ) : (
                <p className="leading-relaxed text-fun-gray-light">{project.overview}</p>
              )}
            </div>

            <aside>
              <h2 className="text-2xl font-bold">Tech stack</h2>
              <ul className="mt-4 list-none space-y-3">
                {project.stack.map((item) => (
                  <li key={item.name} className="flex items-center gap-3 text-fun-gray-light">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.icon} width={22} height={22} alt="" />
                    {item.name}
                  </li>
                ))}
              </ul>

              <h2 className="mt-10 text-2xl font-bold">Focus</h2>
              <ul className="-ml-1 mt-4 flex list-none flex-wrap">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <div className="m-1 cursor-default rounded-lg bg-fun-pink-dark px-2 py-1 text-sm">
                      {tag}
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </article>

        <section className="mt-24 border-t border-fun-pink-dark pt-12">
          <h2 className="text-2xl font-bold">More projects</h2>
          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-5">
            {more.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
}
