import { randomUUID } from "node:crypto";
import type { Project } from "./project-types";
import { persistList, readList, readListForAdmin, type PendingUpload } from "./json-store";
import { projects as seedProjects } from "@/data/seed-projects";

/** Project content: data/projects.json, edited through /admin. */

const REPO_DATA_PATH = "data/projects.json";

/** Uploaded thumbnails, as a repo path and the public URL that serves it. */
export const UPLOAD_REPO_DIR = "public/static/projects";
export const UPLOAD_PUBLIC_DIR = "/static/projects";

export { storageMode } from "./json-store";
export type { PendingUpload } from "./json-store";

/** Reads the committed file shipped with this build. Used by the public pages. */
export function readProjects() {
  return readList<Project>(REPO_DATA_PATH, seedProjects);
}

/** Reads the newest list, for the admin. */
export function readProjectsForAdmin() {
  return readListForAdmin<Project>(REPO_DATA_PATH, seedProjects);
}

export function persistProjects(
  projects: Project[],
  options: { uploads?: PendingUpload[]; message: string }
) {
  return persistList(REPO_DATA_PATH, projects, options);
}

export async function getProjectBySlug(slug: string) {
  const projects = await readProjects();
  return projects.find((project) => project.slug === slug);
}

export async function getProjectById(id: string) {
  const projects = await readProjectsForAdmin();
  return projects.find((project) => project.id === id);
}

export function newProjectId() {
  return randomUUID();
}
