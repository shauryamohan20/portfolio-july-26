export const profile = {
  name: "Shaurya Mohan",
  firstName: "Shaurya",
  role: "Developer",
  location: "Gurugram, India",
  tagline: "I enjoy building clean, functional, and user-friendly digital experiences.",
  intro:
    "I'm a full-stack developer and freelancer based in Gurugram, India. I build fast, polished websites and web apps for clients around the world — from e-commerce storefronts to custom platforms.",
  email: "m.shaurya1120@gmail.com",
  phone: "+91-9519391569",
  resumeUrl: "",
};

export const socials = [
  { name: "GitHub", href: "https://github.com/shauryamohan20", icon: "github" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/shauryamohan/", icon: "linkedin" },
  { name: "Upwork", href: "https://www.upwork.com/freelancers/~01d550ba0627e18dcf", icon: "upwork" },
  { name: "Instagram", href: "https://www.instagram.com/wardog.1120/", icon: "instagram" },
] as const;

export type Project = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  gradient: string;
};

export const projects: Project[] = [
  {
    title: "Tesoro",
    description:
      "A gaming economy rewards platform where players earn and redeem in-game value. Built for speed with a clean, game-first interface.",
    tags: ["Next.js", "React", "Tailwind"],
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    title: "Firselo",
    description:
      "A marketplace for buying and selling used electronics, focused on trust, clear listings, and a smooth checkout flow.",
    tags: ["Web Design", "UI/UX", "React"],
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "Cord Studio",
    description:
      "An e-commerce storefront for premium clothing and leather goods, with a refined product experience and Shopify backend.",
    tags: ["Shopify", "E-commerce", "Liquid"],
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Black Fridye",
    description:
      "A brand site for a sustainable clothing label, pairing storytelling with a conversion-focused shopping experience.",
    tags: ["Shopify", "Branding", "E-commerce"],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Avantgarde Artist Agency",
    description:
      "A portfolio and booking site for an artist agency, showcasing talent with bold, editorial layouts.",
    tags: ["WordPress", "Web Design"],
    gradient: "from-rose-500 to-pink-600",
  },
  {
    title: "Innovative Dental Springfield",
    description:
      "A modern, accessible website for a dental practice, built to drive appointment bookings and inspire patient confidence.",
    tags: ["WordPress", "SEO", "Web Dev"],
    gradient: "from-cyan-500 to-sky-600",
  },
];

export const services = [
  {
    title: "Web Development",
    description: "High-quality, production-ready websites and web apps built to professional standards.",
    icon: "code",
  },
  {
    title: "UI/UX Design",
    description: "Modern, clean interfaces designed to feel effortless and look great on any device.",
    icon: "palette",
  },
  {
    title: "Mobile Apps",
    description: "Cross-platform application development for iOS and Android.",
    icon: "phone",
  },
  {
    title: "Photography",
    description: "Capturing nature, landscapes, and everyday moments with a considered eye.",
    icon: "camera",
  },
];

export const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Shopify",
  "WordPress",
  "Figma",
  "Git",
];

export const testimonials = [
  {
    quote:
      "Shaurya's attention to detail is outstanding. Communication was quick and clear, and the site was delivered on time and exactly as we imagined.",
    author: "Shopify Client",
    role: "E-commerce Store Owner",
  },
  {
    quote:
      "Great to work with — responsive, professional, and genuinely invested in getting the result right. I'd hire again without hesitation.",
    author: "Agency Client",
    role: "Founder",
  },
  {
    quote:
      "Delivered high-quality work on our WordPress project and handled every revision with patience. Highly recommended.",
    author: "WordPress Client",
    role: "Small Business Owner",
  },
];
