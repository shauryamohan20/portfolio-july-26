import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Project } from "./project-types";
import { commitFiles, githubConfigured, readRepoFile, type CommitFile } from "./github";
import { projects as seedProjects } from "@/data/seed-projects";

/**
 * Where project content lives.
 *
 * The list is a JSON file in the repo (data/projects.json), read by the public
 * pages at build time. Saving writes it back:
 *
 * - Locally (`next dev`): straight to disk.
 * - Deployed with GitHub credentials: committed to the repo, which triggers a
 *   redeploy. A deployed filesystem is read-only, so this is the only way for
 *   an online edit to survive.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "projects.json");
const REPO_DATA_PATH = "data/projects.json";

/** Uploaded thumbnails, as a repo path and the public URL that serves it. */
export const UPLOAD_REPO_DIR = "public/static/projects";
export const UPLOAD_PUBLIC_DIR = "/static/projects";

export type PendingUpload = {
  /** Path the file is served from once deployed, e.g. /static/projects/x.png */
  publicPath: string;
  repoPath: string;
  bytes: Buffer;
};

function serialize(projects: Project[]) {
  return JSON.stringify(projects, null, 2) + "\n";
}

function parse(raw: string): Project[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("data/projects.json must contain an array");
  }
  return parsed as Project[];
}

/** Reads the committed file shipped with this build. Used by the public pages. */
export async function readProjects(): Promise<Project[]> {
  try {
    return parse(await readFile(DATA_FILE, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seeded = seedProjects.map((project) => ({ ...project }));
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(DATA_FILE, serialize(seeded), "utf8");
      return seeded;
    }
    throw error;
  }
}

/**
 * Reads the newest list the admin should edit.
 *
 * In GitHub mode this comes from the repo rather than the bundled file, so an
 * edit made while a previous deploy is still building is not lost.
 */
export async function readProjectsForAdmin(): Promise<Project[]> {
  if (!githubConfigured()) return readProjects();
  const raw = await readRepoFile(REPO_DATA_PATH);
  return raw ? parse(raw) : readProjects();
}

/** Describes where saves go, for messaging in the UI. */
export function storageMode(): "github" | "local" {
  return githubConfigured() ? "github" : "local";
}

/** Persist the list, plus any newly uploaded images, as one change. */
export async function persistProjects(
  projects: Project[],
  options: { uploads?: PendingUpload[]; message: string }
): Promise<void> {
  const uploads = options.uploads ?? [];

  if (!githubConfigured()) {
    if (process.env.NODE_ENV === "production") {
      // A deployed filesystem is read-only, so there is nowhere to save.
      throw new Error(
        "Saving from the deployed site needs GITHUB_TOKEN and GITHUB_REPO to be set in your hosting environment. Without them, edits can only be made locally."
      );
    }
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, serialize(projects), "utf8");
    for (const upload of uploads) {
      const target = path.join(process.cwd(), upload.repoPath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, upload.bytes);
    }
    return;
  }

  const files: CommitFile[] = [
    { path: REPO_DATA_PATH, content: serialize(projects), encoding: "utf-8" },
    ...uploads.map((upload) => ({
      path: upload.repoPath,
      content: upload.bytes.toString("base64"),
      encoding: "base64" as const,
    })),
  ];

  await commitFiles(files, options.message);
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
