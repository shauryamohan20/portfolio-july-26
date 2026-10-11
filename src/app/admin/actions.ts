"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { registerFailure, loginBlockedFor, clearFailures } from "@/lib/login-throttle";
import { passwordMatches } from "@/lib/admin-guard";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";
import type { Project, TechIcon } from "@/lib/project-types";
import { slugify } from "@/lib/project-types";
import {
  UPLOAD_PUBLIC_DIR,
  UPLOAD_REPO_DIR,
  newProjectId,
  persistProjects,
  readProjectsForAdmin,
  type PendingUpload,
} from "@/lib/projects-store";

export type FormState = { ok: boolean; message: string };

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/** Refresh every page that renders project data. */
function revalidateProjectPages() {
  revalidatePath("/");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/admin");
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function parseStack(formData: FormData): TechIcon[] {
  const stack: TechIcon[] = [];
  const seen = new Set<string>();

  // Preset checkboxes post as "stack" entries of "Name|iconUrl".
  for (const entry of formData.getAll("stack")) {
    if (typeof entry !== "string") continue;
    const [name, icon] = entry.split("|");
    if (name && icon && !seen.has(name)) {
      seen.add(name);
      stack.push({ name, icon });
    }
  }

  // Custom rows post as parallel customStackName / customStackIcon fields.
  const names = formData.getAll("customStackName");
  const icons = formData.getAll("customStackIcon");
  names.forEach((rawName, index) => {
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const icon = typeof icons[index] === "string" ? (icons[index] as string).trim() : "";
    if (name && icon && !seen.has(name)) {
      seen.add(name);
      stack.push({ name, icon });
    }
  });

  return stack;
}

/** Validate an uploaded thumbnail and work out where it will be stored. */
async function prepareUpload(file: File, slug: string): Promise<PendingUpload> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    throw new Error(`Unsupported image type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That image is larger than 6MB.");
  }

  const safeSlug = slugify(slug) || "project";
  const filename = `${safeSlug}-${Date.now()}.${extension}`;

  return {
    publicPath: `${UPLOAD_PUBLIC_DIR}/${filename}`,
    repoPath: `${UPLOAD_REPO_DIR}/${filename}`,
    bytes: Buffer.from(await file.arrayBuffer()),
  };
}

/**
 * Build a project from the form, reusing the existing thumbnail when no new
 * file or URL was supplied.
 */
async function projectFromForm(
  formData: FormData,
  existing: Project | undefined
): Promise<{ fields: Omit<Project, "id">; upload?: PendingUpload }> {
  const title = text(formData, "title");
  if (!title) throw new Error("Title is required.");

  const slug = slugify(text(formData, "slug") || title);
  if (!slug) throw new Error("Could not build a URL slug from that title.");

  const desc = text(formData, "desc");
  if (!desc) throw new Error("Short description is required.");

  const file = formData.get("imgFile");
  const imgUrl = text(formData, "img");
  let img = existing?.img ?? "";
  let upload: PendingUpload | undefined;

  if (file instanceof File && file.size > 0) {
    upload = await prepareUpload(file, slug);
    img = upload.publicPath;
  } else if (imgUrl) {
    img = imgUrl;
  }

  if (!img) throw new Error("A thumbnail is required — upload a file or paste a URL.");

  return {
    upload,
    fields: {
      slug,
      title,
      category: text(formData, "category") || "Web Development",
      desc,
      overview: text(formData, "overview") || desc,
      img,
      imgAlt: text(formData, "imgAlt") || `${title} website screenshot`,
      link: text(formData, "link") || undefined,
      github: text(formData, "github") || undefined,
      status: text(formData, "status") || undefined,
      tags: parseTags(text(formData, "tags")),
      stack: parseStack(formData),
    },
  };
}

export async function saveProject(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const id = text(formData, "id");
  let slug = "";

  try {
    const projects = await readProjectsForAdmin();
    const existing = id ? projects.find((project) => project.id === id) : undefined;

    if (id && !existing) {
      return { ok: false, message: "That project no longer exists." };
    }

    const { fields, upload } = await projectFromForm(formData, existing);
    slug = fields.slug;

    const slugTaken = projects.some(
      (project) => project.slug === fields.slug && project.id !== id
    );
    if (slugTaken) {
      return {
        ok: false,
        message: `The URL slug "${fields.slug}" is already used by another project.`,
      };
    }

    const next = existing
      ? projects.map((project) =>
          project.id === id ? { ...project, ...fields } : project
        )
      : [...projects, { id: newProjectId(), ...fields }];

    await persistProjects(next, {
      uploads: upload ? [upload] : [],
      message: `${existing ? "Update" : "Add"} project: ${fields.title}`,
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save that project.",
    };
  }

  revalidateProjectPages();
  revalidatePath(`/projects/${slug}`);
  redirect("/admin?saved=1");
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const projects = await readProjectsForAdmin();
  const target = projects.find((project) => project.id === id);
  if (!target) redirect("/admin");

  await persistProjects(
    projects.filter((project) => project.id !== id),
    { message: `Remove project: ${target.title}` }
  );

  revalidateProjectPages();
  redirect("/admin?deleted=1");
}

/** Move a project one slot earlier or later in the grid order. */
export async function moveProject(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const direction = text(formData, "direction") === "up" ? -1 : 1;
  const projects = await readProjectsForAdmin();
  const index = projects.findIndex((project) => project.id === id);
  const target = index + direction;

  if (index !== -1 && target >= 0 && target < projects.length) {
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    await persistProjects(next, { message: `Reorder projects` });
    revalidateProjectPages();
  }

  redirect("/admin");
}

export async function login(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const password = formData.get("password");
  const blockedFor = loginBlockedFor();

  if (blockedFor > 0) {
    return {
      ok: false,
      message: `Too many attempts. Try again in ${blockedFor} seconds.`,
    };
  }

  if (typeof password !== "string" || !passwordMatches(password)) {
    registerFailure();
    // Slow down guessing a little, on top of the lockout.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: false, message: "Wrong password." };
  }

  clearFailures();
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
