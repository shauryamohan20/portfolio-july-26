"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import type { PendingUpload } from "@/lib/json-store";
import { prepareUpload } from "@/lib/uploads";
import { ABOUT_PUBLIC_DIR, ABOUT_REPO_DIR, persistSite, readSiteForAdmin } from "@/lib/site-store";

export type FormState = { ok: boolean; message: string };

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveSite(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  try {
    const current = await readSiteForAdmin();

    const heading = text(formData, "heroHeading");
    if (!heading) return { ok: false, message: "The hero headline is required." };

    const file = formData.get("aboutImageFile");
    const imageUrl = text(formData, "aboutImage");
    let image = current.about.image ?? "";
    let upload: PendingUpload | undefined;

    if (file instanceof File && file.size > 0) {
      upload = await prepareUpload(file, {
        nameHint: "about",
        repoDir: ABOUT_REPO_DIR,
        publicDir: ABOUT_PUBLIC_DIR,
      });
      image = upload.publicPath;
    } else if (imageUrl) {
      image = imageUrl;
    } else if (text(formData, "removeAboutImage") === "1") {
      image = "";
    }

    await persistSite(
      {
        hero: {
          greeting: text(formData, "heroGreeting"),
          heading,
          subtext: text(formData, "heroSubtext"),
          ctaLabel: text(formData, "heroCtaLabel") || "Tell me more",
          ctaHref: text(formData, "heroCtaHref") || "#projects",
        },
        about: {
          heading: text(formData, "aboutHeading") || "A little about me",
          body: (formData.get("aboutBody") as string | null)?.trim() ?? "",
          image,
          imageAlt: text(formData, "aboutImageAlt"),
        },
      },
      { uploads: upload ? [upload] : [], message: "Update hero and about content" }
    );
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save that content.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/site");
  redirect("/admin/site?saved=1");
}
