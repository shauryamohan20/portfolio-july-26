import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { commitFiles, githubConfigured, readRepoFile, type CommitFile } from "./github";

/**
 * Shared storage for the JSON content files (projects, testimonials).
 *
 * Locally the files are read and written on disk. On a deployed site the
 * filesystem is read-only, so saves are committed back to the repo and the
 * host rebuilds. Reads always come from the file shipped with the build,
 * except in the admin, which reads the repo so it edits the newest version.
 */

export type PendingUpload = {
  /** Path the file is served from once deployed, e.g. /static/projects/x.png */
  publicPath: string;
  repoPath: string;
  bytes: Buffer;
};

function absolute(repoPath: string) {
  return path.join(process.cwd(), repoPath);
}

function serialize(data: unknown) {
  return JSON.stringify(data, null, 2) + "\n";
}

function parseArray<T>(raw: string, repoPath: string): T[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${repoPath} must contain an array`);
  }
  return parsed as T[];
}

/** Describes where saves go, for messaging in the UI. */
export function storageMode(): "github" | "local" {
  return githubConfigured() ? "github" : "local";
}

/** Read the committed file for this build, seeding it when absent. */
export async function readList<T>(repoPath: string, seed: T[]): Promise<T[]> {
  const file = absolute(repoPath);
  try {
    return parseArray<T>(await readFile(file, "utf8"), repoPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seeded = seed.map((entry) => ({ ...entry }));
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, serialize(seeded), "utf8");
      return seeded;
    }
    throw error;
  }
}

/**
 * Read the newest list the admin should edit. In GitHub mode that is the repo
 * copy, so an edit made while a deploy is still building is not lost.
 */
export async function readListForAdmin<T>(repoPath: string, seed: T[]): Promise<T[]> {
  if (!githubConfigured()) return readList<T>(repoPath, seed);
  const raw = await readRepoFile(repoPath);
  return raw ? parseArray<T>(raw, repoPath) : readList<T>(repoPath, seed);
}

/** Persist a list, plus any newly uploaded images, as one change. */
export async function persistList<T>(
  repoPath: string,
  data: T[],
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
    const file = absolute(repoPath);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, serialize(data), "utf8");
    for (const upload of uploads) {
      const target = absolute(upload.repoPath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, upload.bytes);
    }
    return;
  }

  const files: CommitFile[] = [
    { path: repoPath, content: serialize(data), encoding: "utf-8" },
    ...uploads.map((upload) => ({
      path: upload.repoPath,
      content: upload.bytes.toString("base64"),
      encoding: "base64" as const,
    })),
  ];

  await commitFiles(files, options.message);
}
