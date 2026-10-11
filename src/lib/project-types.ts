/**
 * Shared project types and helpers.
 *
 * This module is pure (no filesystem access) so it can be imported from both
 * server and client components. Reading and writing lives in `projects-store`.
 */

export type TechIcon = { name: string; icon: string };

export type Project = {
  id: string;
  /** URL segment for the detail page: /projects/[slug] */
  slug: string;
  title: string;
  category: string;
  /** Short blurb shown on the project card. */
  desc: string;
  /** Long-form copy shown on the detail page. */
  overview: string;
  /** Screenshot used as the card thumbnail and the detail page hero. */
  img: string;
  imgAlt: string;
  /** Live site, when the project has one. */
  link?: string;
  github?: string;
  /** Shown in place of a live link while a project is unreleased. */
  status?: string;
  tags: string[];
  stack: TechIcon[];
};

/** Tech options offered as checkboxes in the admin form. */
export const TECH_PRESETS: TechIcon[] = [
  { name: "HTML5", icon: "https://cdn.simpleicons.org/html5/E34F26" },
  {
    name: "CSS3",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript/F7DF1E" },
  { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6" },
  { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB" },
  { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
  { name: "Tailwind CSS", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
  { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/5FA04E" },
  { name: "Python", icon: "https://cdn.simpleicons.org/python/3776AB" },
  { name: "Flask", icon: "https://cdn.simpleicons.org/flask/ffffff" },
  { name: "Webflow", icon: "https://cdn.simpleicons.org/webflow/4353FF" },
  { name: "Shopify", icon: "https://cdn.simpleicons.org/shopify/96BF48" },
  { name: "WordPress", icon: "https://cdn.simpleicons.org/wordpress/ffffff" },
  { name: "Figma", icon: "https://cdn.simpleicons.org/figma/F24E1E" },
  { name: "Git", icon: "https://cdn.simpleicons.org/git/F05032" },
];

/** Turn a title into a safe, lowercase URL segment. */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function emptyProject(): Project {
  return {
    id: "",
    slug: "",
    title: "",
    category: "Web Development",
    desc: "",
    overview: "",
    img: "",
    imgAlt: "",
    link: "",
    github: "",
    status: "",
    tags: [],
    stack: [],
  };
}
