export const profile = {
  name: "Shaurya Mohan",
  firstName: "Shaurya",
  role: "Developer",
  location: "Gurugram, India",
  tagline: "I enjoy building and designing for the web.",
  email: "m.shaurya1120@gmail.com",
};

export const routes = [
  { title: "Home", path: "/" },
  { title: "About", path: "/#about" },
  { title: "Projects", path: "/#projects" },
  { title: "Skills", path: "/#skills" },
  { title: "Contact", path: "/#contact" },
];

export type { Project, TechIcon } from "@/lib/project-types";

export type Skill = { title: string; icon: string; style?: React.CSSProperties };

export const skills: Skill[] = [
  { title: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { title: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { title: "Javascript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { title: "Typescript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { title: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { title: "NextJS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original-wordmark.svg", style: { filter: "invert(1)" } },
  { title: "TailwindCSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  { title: "NodeJS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { title: "Shopify", icon: "/static/icons/shopify.svg" },
  { title: "WordPress", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg", style: { filter: "invert(1)" } },
  { title: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { title: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
];

export type { Testimonial } from "@/lib/testimonial-types";

export const socials = [
  { name: "GitHub", link: "https://github.com/shauryamohan20", icon: "/static/icons/github-f.svg" },
  { name: "LinkedIn", link: "https://www.linkedin.com/in/shauryamohan/", icon: "/static/icons/linkedin-f.svg" },
  { name: "Email", link: "mailto:m.shaurya1120@gmail.com", icon: "/static/icons/mail-f.svg" },
];

export const footerColumns = [
  {
    title: "Pages",
    links: [
      { name: "Home", link: "/" },
      { name: "About", link: "/#about" },
      { name: "Projects", link: "/#projects" },
      { name: "Skills", link: "/#skills" },
      { name: "Contact", link: "/#contact" },
    ],
  },
  {
    title: "Social",
    links: socials,
  },
];
