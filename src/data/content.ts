export const profile = {
  name: "Shaurya Mohan",
  firstName: "Shaurya",
  role: "Developer",
  location: "Gurugram, India",
  tagline: "I enjoy building and designing for the web.",
  email: "m.shaurya1120@gmail.com",
};

export const routes = [
  { title: "Home", path: "#top" },
  { title: "Projects", path: "#projects" },
  { title: "Skills", path: "#skills" },
  { title: "Contact", path: "#contact" },
];

export type Project = {
  id: number;
  title: string;
  desc: string;
  img: string;
  link?: string;
  github?: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    id: 1,
    title: "Tesoro",
    desc: "A gaming economy rewards platform where players earn and redeem in-game value, built for speed with a game-first interface.",
    img: "/static/projects/tesoro.svg",
    tags: ["Next.js", "React", "Tailwind"],
  },
  {
    id: 2,
    title: "Firselo",
    desc: "A marketplace for buying and selling used electronics, focused on trust, clear listings, and a smooth checkout flow.",
    img: "/static/projects/firselo.svg",
    tags: ["Web Design", "UI/UX", "React"],
  },
  {
    id: 3,
    title: "Cord Studio",
    desc: "An e-commerce storefront for premium clothing and leather goods with a refined, conversion-focused product experience.",
    img: "/static/projects/cord-studio.svg",
    tags: ["Shopify", "E-commerce", "Liquid"],
  },
  {
    id: 4,
    title: "Black Fridye",
    desc: "A brand site for a sustainable clothing label, pairing storytelling with a smooth shopping experience.",
    img: "/static/projects/black-fridye.svg",
    tags: ["Shopify", "Branding"],
  },
  {
    id: 5,
    title: "Avantgarde Artist Agency",
    desc: "A portfolio and booking site for an artist agency, showcasing talent with bold, editorial layouts.",
    img: "/static/projects/avantgarde.svg",
    tags: ["WordPress", "Web Design"],
  },
  {
    id: 6,
    title: "Innovative Dental Springfield",
    desc: "A modern, accessible website for a dental practice, built to drive appointment bookings and patient confidence.",
    img: "/static/projects/innovative-dental.svg",
    tags: ["WordPress", "SEO"],
  },
];

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

export type Testimonial = { quote: string; name: string; job: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "The communication throughout the project was spot on, and everything was delivered on time and exactly as we imagined.",
    name: "Shopify Client",
    job: "E-commerce Store Owner",
  },
  {
    quote:
      "The code was clean, easy to understand, and exactly what I was looking for. A pleasure to work with.",
    name: "Agency Client",
    job: "Founder",
  },
  {
    quote:
      "My vision was executed perfectly. The quality and speed of the work were excellent — highly recommended.",
    name: "WordPress Client",
    job: "Small Business Owner",
  },
];

export const socials = [
  { name: "GitHub", link: "https://github.com/shauryamohan20", icon: "/static/icons/github-f.svg" },
  { name: "LinkedIn", link: "https://www.linkedin.com/in/shauryamohan/", icon: "/static/icons/linkedin-f.svg" },
  { name: "Email", link: "mailto:m.shaurya1120@gmail.com", icon: "/static/icons/mail-f.svg" },
];

export const footerColumns = [
  {
    title: "Pages",
    links: [
      { name: "Home", link: "#top" },
      { name: "Projects", link: "#projects" },
      { name: "Skills", link: "#skills" },
      { name: "Contact", link: "#contact" },
    ],
  },
  {
    title: "Social",
    links: socials,
  },
];
