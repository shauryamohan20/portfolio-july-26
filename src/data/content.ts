export const profile = {
  name: "Shaurya Mohan",
  firstName: "Shaurya",
  role: "Developer",
  location: "Gurugram, India",
  tagline: "I enjoy building and designing for the web.",
  email: "m.shaurya1120@gmail.com",
};

export const routes = [
  { title: "Home", path: "/#top" },
  { title: "Projects", path: "/#projects" },
  { title: "Skills", path: "/#skills" },
  { title: "Contact", path: "/#contact" },
];

export type TechIcon = { name: string; icon: string };

export type Project = {
  id: number;
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

const tech = {
  webflow: { name: "Webflow", icon: "https://cdn.simpleicons.org/webflow/4353FF" },
  shopify: { name: "Shopify", icon: "https://cdn.simpleicons.org/shopify/96BF48" },
  figma: { name: "Figma", icon: "https://cdn.simpleicons.org/figma/F24E1E" },
  html: { name: "HTML5", icon: "https://cdn.simpleicons.org/html5/E34F26" },
  css: {
    name: "CSS3",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  js: { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript/F7DF1E" },
  python: { name: "Python", icon: "https://cdn.simpleicons.org/python/3776AB" },
  flask: { name: "Flask", icon: "https://cdn.simpleicons.org/flask/ffffff" },
} satisfies Record<string, TechIcon>;

const SHOTS = "https://res.cloudinary.com/dmtirqg8e/image/upload";

export const projects: Project[] = [
  {
    id: 1,
    slug: "tesoro",
    title: "Tesoro",
    category: "Web Development",
    desc: "A card-linked rewards platform for the gaming economy, built for speed with a game-first interface.",
    overview:
      "Tesoro is a rewards platform built for the $125 billion gaming economy, connecting gamers, merchants, and game studios through a seamless card-linked loyalty system. The platform allows players to earn real rewards simply by spending on their everyday purchases, while merchants gain access to a highly engaged gaming audience. Studios benefit from deeper player retention through integrated incentive mechanics. Powered by Visa and Mastercard infrastructure, Tesoro bridges the gap between the physical retail world and digital gaming ecosystems, creating a frictionless rewards experience at scale.",
    img: `${SHOTS}/v1778286326/Tesoro-_-The-Rewards-Platform-Powering-the-125-Billion-Gaming-Economy-05-09-2026_05_55_AM_zpm5tw.png`,
    imgAlt: "Tesoro website homepage",
    link: "https://www.tesoroxp.com/about",
    tags: ["Webflow", "JavaScript", "Fintech"],
    stack: [tech.webflow, tech.html, tech.css, tech.js],
  },
  {
    id: 2,
    slug: "firselo",
    title: "Firselo",
    category: "Web Design",
    desc: "A peer-to-peer marketplace for buying and selling used electronics, focused on trust and clear listings.",
    overview:
      "Firselo is a peer-to-peer marketplace currently in development. It is a proprietary project and the full details will be available once it is completed and ready for release.",
    img: `${SHOTS}/v1774738789/Verideal-_-Buy-and-Sell-Used-Electronics-Safely-03-29-2026_04_29_AM_vr3b0q.png`,
    imgAlt: "Firselo marketplace interface design",
    status: "In development — the live site is not public yet.",
    tags: ["Figma", "Flask", "UI/UX"],
    stack: [tech.figma, tech.html, tech.css, tech.python, tech.flask, tech.js],
  },
  {
    id: 3,
    slug: "cord-studio",
    title: "Cord Studio",
    category: "Web Development",
    desc: "An e-commerce storefront for contemporary clothing and premium leather goods, with bespoke monogramming.",
    overview:
      "Cord Studio is an Indian contemporary fashion brand offering a curated range of clothing and premium leather goods. The brand blends modern design sensibilities with artisanal craftsmanship, releasing limited seasonal collections that celebrate quality and individuality. A standout feature of the brand is its personalised monogramming service, allowing customers to add a bespoke touch to their leather pieces. The e-commerce experience is crafted to reflect the brand's refined aesthetic, with clean layouts, editorial photography, and an intuitive shopping journey that makes luxury feel accessible and personal.",
    img: `${SHOTS}/v1774736319/Contemporary-Clothing-Premium-Leather-Goods-_-Cord-Studio-03-29-2026_03_43_AM_lr1lf8.png`,
    imgAlt: "Cord Studio storefront homepage",
    link: "https://www.cordstudio.in/",
    tags: ["Shopify", "E-commerce", "Liquid"],
    stack: [tech.shopify, tech.html, tech.css, tech.js],
  },
  {
    id: 4,
    slug: "black-fridye",
    title: "Black Fridye",
    category: "Web Development",
    desc: "A campaign store for a sustainable clothing label, pairing provocative storytelling with a one-service checkout.",
    overview:
      "Black Fridye is a sustainable fashion initiative by Citizen Wolf, launched as an annual event every November as an ethical counter to Black Friday consumerism. Instead of buying new, customers send in their faded or worn garments to be professionally re-dyed, giving their clothes a second life and dramatically reducing textile waste. The campaign-style website is bold, provocative, and purposefully minimal, using strong typography and a high-contrast palette to challenge fast fashion norms. The e-commerce flow is streamlined around a single service, making it easy for customers to understand the process, select their garment, and book a dye job in just a few clicks.",
    img: `${SHOTS}/v1774737101/Black-Fridye-by-Citizen-Wolf-Love-Your-Clothes-Longer-03-29-2026_04_00_AM_chkmid.png`,
    imgAlt: "Black Fridye campaign site homepage",
    link: "https://blackfridye.com/",
    tags: ["Shopify", "E-commerce", "Branding"],
    stack: [tech.shopify, tech.html, tech.css, tech.js],
  },
  {
    id: 5,
    slug: "avantgarde",
    title: "Avantgarde Artist Agency",
    category: "Web Development",
    desc: "A booking and roster site for a London electronic music agency, built around bold, editorial layouts.",
    overview:
      "Avantgarde Artist Agency is a London-based electronic music booking and management agency with over 20 years of experience in the industry. Representing more than 20 internationally acclaimed artists, the agency specialises in connecting world-class electronic music talent with promoters, festivals, and venues across the globe. The website reflects the agency's bold artistic identity, featuring a dark, immersive design with dynamic typography and a refined visual language that speaks directly to the underground music scene. The site serves as a central hub for artist discovery, tour booking, and brand communication.",
    img: `${SHOTS}/v1774736319/Avantgarde-Artists-Agency-03-29-2026_03_42_AM_l8ioyg.png`,
    imgAlt: "Avantgarde Artist Agency website homepage",
    link: "https://www.avantgardeartistsagency.com/",
    tags: ["Webflow", "Web Design", "Music"],
    stack: [tech.webflow, tech.html, tech.css, tech.js],
  },
  {
    id: 6,
    slug: "innovative-dental",
    title: "Innovative Dental Springfield",
    category: "Web Development",
    desc: "A calm, accessible site for a premium dental practice, built to drive bookings and patient confidence.",
    overview:
      "Innovative Dental is a premium dental practice based in Springfield, Missouri, renowned for delivering a spa-like patient experience alongside world-class clinical care. The practice specialises in dental implants, orthodontics, and cosmetic dentistry, combining cutting-edge technology with a warm, welcoming environment that puts patient comfort first. The website was designed to communicate trust, expertise, and approachability, using clean white aesthetics and professional photography to ease patient anxiety and guide visitors through available treatments. Appointment booking and patient education are centralised for a seamless digital-to-clinic journey.",
    img: `${SHOTS}/v1774737326/Innovative-Dental-Dental-Implants-Orthodontics-03-29-2026_04_04_AM_pmzcjq.png`,
    imgAlt: "Innovative Dental Springfield website homepage",
    link: "https://www.idspringfield.com/",
    tags: ["Webflow", "Web Design", "Healthcare"],
    stack: [tech.webflow, tech.html, tech.css, tech.js],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

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
      { name: "Home", link: "/#top" },
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
