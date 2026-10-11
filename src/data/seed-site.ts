import type { SiteContent } from "@/lib/site-types";

/**
 * Starting page content. Only used to create data/site.json when that file is
 * missing; after that the admin panel owns it.
 */
export const site: SiteContent = {
  hero: {
    greeting: "Hey, I'm Shaurya. 👋",
    heading: "I enjoy *building* and *designing* for the web.",
    subtext: "",
    ctaLabel: "Tell me more",
    ctaHref: "#projects",
  },
  about: {
    heading: "A little about me",
    body: "",
    image: "",
    imageAlt: "",
  },
};
