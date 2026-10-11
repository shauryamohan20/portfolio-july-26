"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import type { Testimonial } from "@/lib/testimonial-types";
import type { PendingUpload } from "@/lib/json-store";
import { prepareUpload } from "@/lib/uploads";
import {
  AVATAR_PUBLIC_DIR,
  AVATAR_REPO_DIR,
  newTestimonialId,
  persistTestimonials,
  readTestimonialsForAdmin,
} from "@/lib/testimonials-store";

export type FormState = { ok: boolean; message: string };

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateTestimonialPages() {
  revalidatePath("/");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/admin/testimonials");
}

export async function saveTestimonial(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const id = text(formData, "id");

  try {
    const testimonials = await readTestimonialsForAdmin();
    const existing = id ? testimonials.find((item) => item.id === id) : undefined;

    if (id && !existing) {
      return { ok: false, message: "That testimonial no longer exists." };
    }

    const quote = text(formData, "quote");
    const name = text(formData, "name");
    if (!quote) return { ok: false, message: "The quote is required." };
    if (!name) return { ok: false, message: "The author's name is required." };

    const file = formData.get("avatarFile");
    const avatarUrl = text(formData, "avatar");
    let avatar = existing?.avatar ?? "";
    let upload: PendingUpload | undefined;

    if (file instanceof File && file.size > 0) {
      upload = await prepareUpload(file, {
        nameHint: name,
        repoDir: AVATAR_REPO_DIR,
        publicDir: AVATAR_PUBLIC_DIR,
      });
      avatar = upload.publicPath;
    } else if (avatarUrl) {
      avatar = avatarUrl;
    } else if (text(formData, "removeAvatar") === "1") {
      avatar = "";
    }

    const fields: Omit<Testimonial, "id"> = {
      quote,
      name,
      job: text(formData, "job"),
      avatar: avatar || undefined,
    };

    const next = existing
      ? testimonials.map((item) => (item.id === id ? { ...item, ...fields } : item))
      : [...testimonials, { id: newTestimonialId(), ...fields }];

    await persistTestimonials(next, {
      uploads: upload ? [upload] : [],
      message: `${existing ? "Update" : "Add"} testimonial: ${name}`,
    });
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not save that testimonial.",
    };
  }

  revalidateTestimonialPages();
  redirect("/admin/testimonials?saved=1");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const testimonials = await readTestimonialsForAdmin();
  const target = testimonials.find((item) => item.id === id);
  if (!target) redirect("/admin/testimonials");

  await persistTestimonials(
    testimonials.filter((item) => item.id !== id),
    { message: `Remove testimonial: ${target.name}` }
  );

  revalidateTestimonialPages();
  redirect("/admin/testimonials?deleted=1");
}

/** Move a testimonial one slot earlier or later in the carousel order. */
export async function moveTestimonial(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const direction = text(formData, "direction") === "up" ? -1 : 1;
  const testimonials = await readTestimonialsForAdmin();
  const index = testimonials.findIndex((item) => item.id === id);
  const target = index + direction;

  if (index !== -1 && target >= 0 && target < testimonials.length) {
    const next = [...testimonials];
    [next[index], next[target]] = [next[target], next[index]];
    await persistTestimonials(next, { message: "Reorder testimonials" });
    revalidateTestimonialPages();
  }

  redirect("/admin/testimonials");
}
