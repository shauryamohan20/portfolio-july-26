import { slugify } from "./project-types";
import type { PendingUpload } from "./json-store";

/** Image types the admin accepts for thumbnails and author photos. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

export const ACCEPT_ATTRIBUTE = Object.keys(ALLOWED_IMAGE_TYPES).join(",");

/** Validate an uploaded image and work out where it will be stored. */
export async function prepareUpload(
  file: File,
  options: { nameHint: string; repoDir: string; publicDir: string }
): Promise<PendingUpload> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    throw new Error(`Unsupported image type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That image is larger than 6MB.");
  }

  const safeName = slugify(options.nameHint) || "image";
  const filename = `${safeName}-${Date.now()}.${extension}`;

  return {
    publicPath: `${options.publicDir}/${filename}`,
    repoPath: `${options.repoDir}/${filename}`,
    bytes: Buffer.from(await file.arrayBuffer()),
  };
}
