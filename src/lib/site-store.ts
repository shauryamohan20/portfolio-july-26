import type { SiteContent } from "./site-types";
import { persistList, readList, readListForAdmin, type PendingUpload } from "./json-store";
import { site as seedSite } from "@/data/seed-site";

/**
 * Site content: data/site.json, edited through /admin/site.
 *
 * The shared store works in lists, so the single content object is held as a
 * one-entry array — same read, write and GitHub-commit path as the rest.
 */

const REPO_DATA_PATH = "data/site.json";

export const ABOUT_REPO_DIR = "public/static/about";
export const ABOUT_PUBLIC_DIR = "/static/about";

function first(entries: SiteContent[]): SiteContent {
  const entry = entries[0] ?? seedSite;
  return {
    hero: { ...seedSite.hero, ...entry.hero },
    about: { ...seedSite.about, ...entry.about },
  };
}

export async function readSite(): Promise<SiteContent> {
  return first(await readList<SiteContent>(REPO_DATA_PATH, [seedSite]));
}

export async function readSiteForAdmin(): Promise<SiteContent> {
  return first(await readListForAdmin<SiteContent>(REPO_DATA_PATH, [seedSite]));
}

export function persistSite(
  content: SiteContent,
  options: { uploads?: PendingUpload[]; message: string }
) {
  return persistList(REPO_DATA_PATH, [content], options);
}
