import type { MetadataRoute } from "next";
import { readProjects } from "@/lib/projects-store";
import { siteUrl } from "@/lib/site-url";

/**
 * Lists the home page and every project case study. The admin is left out on
 * purpose — it is not public, and robots.txt disallows it as well.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await readProjects();
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
