import { randomUUID } from "node:crypto";
import type { Testimonial } from "./testimonial-types";
import { persistList, readList, readListForAdmin, type PendingUpload } from "./json-store";
import { testimonials as seedTestimonials } from "@/data/seed-testimonials";

/** Testimonial content: data/testimonials.json, edited through /admin. */

const REPO_DATA_PATH = "data/testimonials.json";

/** Uploaded author photos. */
export const AVATAR_REPO_DIR = "public/static/testimonials";
export const AVATAR_PUBLIC_DIR = "/static/testimonials";

export function readTestimonials() {
  return readList<Testimonial>(REPO_DATA_PATH, seedTestimonials);
}

export function readTestimonialsForAdmin() {
  return readListForAdmin<Testimonial>(REPO_DATA_PATH, seedTestimonials);
}

export function persistTestimonials(
  testimonials: Testimonial[],
  options: { uploads?: PendingUpload[]; message: string }
) {
  return persistList(REPO_DATA_PATH, testimonials, options);
}

export async function getTestimonialById(id: string) {
  const testimonials = await readTestimonialsForAdmin();
  return testimonials.find((item) => item.id === id);
}

export function newTestimonialId() {
  return randomUUID();
}
