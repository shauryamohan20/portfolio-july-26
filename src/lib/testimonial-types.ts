/** Shared testimonial types. Pure, so client components can import them. */

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  /** Job title / company, shown under the name. */
  job: string;
  /** Optional author photo; initials are shown when empty. */
  avatar?: string;
};

export function emptyTestimonial(): Testimonial {
  return { id: "", quote: "", name: "", job: "", avatar: "" };
}

/** Up to two letters for the fallback avatar. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
