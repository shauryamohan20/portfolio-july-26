/**
 * ============================================================
 *  ALL SITE CONTENT LIVES HERE. Edit this file, save, done.
 * ============================================================
 *
 * - Every entry in `sections` becomes a real HTML <section> (good for SEO
 *   and screen readers) AND a zone of the run in the 3D game, in the same order.
 * - A section's `id` picks its world theme in src/game/themes.js.
 *   Unknown ids still work: they get the default meadow theme and a sign.
 * - Section kinds: hero, about, services, projects, feature, contact, text.
 * - Leave a url as '' to hide that link.
 */

export const site = {
  name: 'Shaurya Mohan',
  role: 'Shopify Developer',
  title: 'Shaurya Mohan | Shopify Developer for Custom Stores & Liquid Themes',
  description:
    'Hire Shaurya Mohan, a Shopify developer with 5+ years of experience and 100+ projects worked on. Custom Shopify store development, Liquid theme customization, bilingual stores, Shopify Functions discounts and store speed optimization.',
  // CHANGE THIS to your real domain once it is live (used for canonical + Open Graph).
  url: 'https://shaurya-portfolio.vercel.app',
  locale: 'en_IN',
  // Link-preview image (1200x630 works best). Replace with your own.
  ogImage: '/projects/hd/bezika.webp',
  ogImageAlt: 'A Shopify store built by Shaurya Mohan',
  themeColor: '#0d0f1f',
  email: 'shaurya.mohan20@gmail.com',
  // Colours of the voxel character in the game.
  character: {
    skin: '#c98d62',
    hair: '#1d1a24',
    eyes: '#1d1a24',
    jacket: '#1f2c5c',
    shirt: '#a9c9f5',
    pants: '#232838',
    shoes: '#141414',
  },
  links: [
    { label: 'LinkedIn', url: '' }, // add your profile URL
    { label: 'GitHub', url: '' },
  ],
};

export const sections = [
  {
    id: 'intro',
    nav: 'Start',
    kind: 'hero',
    eyebrow: 'Player 1 ready',
    heading: 'Shaurya Mohan, Shopify Developer',
    lead:
      'I build and customize Shopify stores in Liquid, from bilingual storefronts and fashion brands to a Shopify discount app of my own. Custom themes, fast product pages and stores your team can run.',
    ctas: [
      { label: 'See my stores', url: '#projects', primary: true },
      { label: 'Hire me', url: '#contact' },
    ],
    hint: 'Run with the arrow keys',
    // Shown beside the headline in the normal view.
    image: '/projects/bezika.webp',
    alt: 'Home page of the Bezika online store',
    caption: 'Recent work: Bezika, a bilingual Shopify store',
  },
  {
    id: 'about',
    nav: 'About',
    kind: 'about',
    eyebrow: 'Level 1',
    heading: 'About Shaurya Mohan',
    paragraphs: [
      "I've been building websites for more than 5 years, and Shopify is what I do. I build stores for brands in the US and around the world, from fashion labels to home goods and beauty.",
      'I work in Liquid, HTML, CSS and JavaScript, so a store can look exactly like the brand and still be easy for its team to edit in the Shopify theme editor.',
      'Every store I build is made to be fast on phones, readable by search engines and accessible to every shopper, because a good-looking store still has to sell.',
    ],
    stats: [
      { value: '100+', label: 'Projects worked on' },
      { value: '5+', label: 'Years building websites' },
      { value: '92', label: 'SEO score on Black Fridye' },
      { value: '92', label: 'Accessibility score on Bezika' },
    ],
    note: 'Scores from Google Lighthouse mobile tests, 3 November 2026.',
  },
  {
    id: 'services',
    nav: 'Services',
    kind: 'services',
    eyebrow: 'Level 2',
    heading: 'Shopify development services',
    lead: 'Shopify, end to end: from a new store to the custom sections, apps and speed fixes that grow it.',
    items: [
      {
        icon: 'store',
        title: 'Custom Shopify store development',
        text: 'New Shopify stores built from the ground up, from theme and collections to product pages, checkout settings and launch. Built for the way your customers shop, on phones first.',
        points: ['Shopify store setup and theme selection', 'Collections, menus and navigation', 'Product page design that converts', 'Migration to Shopify from other platforms', 'Launch, training and handover'],
      },
      {
        icon: 'liquid',
        title: 'Shopify theme development in Liquid',
        text: 'Custom Shopify theme development and customization in Liquid, HTML, CSS and JavaScript. Online Store 2.0 sections and blocks your team can edit in the theme editor without a developer.',
        points: ['Custom sections, blocks and metafields', 'Bilingual and multi-language stores, including Arabic', 'Product personalization, like monogramming', 'Responsive layouts for phones and tablets'],
      },
      {
        icon: 'bolt',
        title: 'Shopify apps, discounts and speed',
        text: 'Discount logic with Shopify Functions, app setup and integrations, and the performance fixes that make a Shopify store load faster and rank better.',
        points: ['Quantity, order and Buy X Get Y discounts with Shopify Functions', 'Shopify app setup and integrations', 'Shopify speed optimization and Core Web Vitals', 'Accessibility and technical SEO fixes'],
      },
    ],
  },
  {
    id: 'projects',
    nav: 'Stores',
    kind: 'projects',
    eyebrow: 'Level 3',
    heading: 'Shopify store portfolio',
    pageTitle: 'Shopify store portfolio',
    lead: 'Live Shopify stores I have designed, built and customized, for fashion, jewelry, beauty, home goods and services.',
    // `featured: true` = shown on the normal home page (keep it to 3-4). All appear on /projects/ and in the game.
    // `image` + `alt`: screenshot in public/projects/. `url`: the live store.
    items: [
      {
        title: 'Bezika', featured: true,
        category: 'Bilingual home goods store',
        summary: 'An Arabic and English Shopify store with the same layout, navigation and product pages in both languages.',
        did: ['Shopify theme customization in Liquid', 'Bilingual store setup', 'Responsive design'],
        platform: 'Shopify', metric: { label: 'Accessibility', value: '92' },
        url: 'https://www.bezika.com/', live: '',
        image: '/projects/bezika.webp', alt: 'Home page of the Bezika online store',
      },
      {
        title: 'Black Fridye', featured: true,
        category: 'Clothing overdyeing service by Citizen Wolf',
        summary: 'A Shopify store that sells a service, not a product: worn clothes dyed black, ordered by garment type in a few clear steps.',
        did: ['Shopify theme customization', 'Service store setup', 'UX and content structure'],
        platform: 'Shopify', metric: { label: 'SEO', value: '92' },
        url: 'https://blackfridye.com/', live: '',
        image: '/projects/black-fridye.webp', alt: 'Home page of the Black Fridye website',
      },
      {
        title: 'Cord Studio', featured: true,
        category: 'Clothing and leather goods label',
        summary: 'An image-led fashion store with seasonal collections and monogramming added right on the product page.',
        did: ['Shopify store build', 'Editorial layouts', 'Product personalization'],
        platform: 'Shopify', metric: null,
        url: 'https://www.cordstudio.in/', live: '',
        image: '/projects/cord-studio.webp', alt: 'Home page of the Cord Studio online store',
      },
      {
        title: 'Karpus', featured: true,
        category: 'Sterling silver bracelet brand',
        summary: 'A minimal, monochrome store where product photography leads and the path to checkout stays short.',
        did: ['Shopify theme customization', 'Product page design', 'Responsive design'],
        platform: 'Shopify', metric: null,
        url: 'https://www.karpus.ae/', live: '',
        image: '/projects/karpus.webp', alt: 'Home page of the Karpus online store',
      },
      {
        title: 'Maison de Marie',
        category: 'Nail care brand',
        summary: 'A soft, premium storefront whose product page explains the formula and its benefits before the add-to-cart button.',
        did: ['Shopify storefront build', 'Product page design', 'Brand storytelling'],
        platform: 'Shopify', metric: null,
        url: 'https://maisondemarie.shop/', live: '',
        image: '/projects/maison-de-marie.webp', alt: 'Home page of the Maison de Marie online store',
      },
    ],
    more: { label: 'See all stores', url: '/projects/' },
  },
  {
    id: 'app',
    nav: 'My app',
    kind: 'feature',
    eyebrow: 'Bonus level',
    heading: 'EZ Master Discount',
    lead: 'My own Shopify discount app.',
    image: '/projects/ez-master-discount-site.webp',
    alt: 'Home page of the EZ Master Discount website',
    paragraphs: [
      'EZ Master Discount gives a store three kinds of discount: quantity tiers, whole-order thresholds with free shipping, and Buy X Get Y. It runs on Shopify Functions inside Shopify’s own checkout, and is being prepared for the Shopify App Store.',
      'Its website has a working demo cart instead of screenshots, so store owners can change quantities and watch each discount apply.',
    ],
    stats: [
      { value: '99', label: 'Mobile speed score of the app’s website' },
      { value: '100', label: 'Accessibility score of the app’s website' },
    ],
    ctas: [
      { label: 'Visit ezmasterdiscount.com', url: 'https://www.ezmasterdiscount.com/', primary: true },
    ],
  },
  {
    id: 'faq',
    nav: 'FAQ',
    kind: 'faq',
    eyebrow: 'Side quest',
    heading: 'Shopify developer FAQ',
    items: [
      {
        q: 'What does a Shopify developer do?',
        a: 'A Shopify developer builds and customizes Shopify stores: setting up the store, writing theme code in Liquid, HTML, CSS and JavaScript, connecting apps, and making the store fast and easy to manage. I handle all of it, from a new store to changes on a live one.',
      },
      {
        q: 'Can you customize my existing Shopify theme?',
        a: 'Yes. I customize existing Shopify themes in Liquid and add Online Store 2.0 sections and blocks, so your team can keep editing pages in the theme editor after I am done.',
      },
      {
        q: 'Do you build bilingual or multi-language Shopify stores?',
        a: 'Yes. Bezika, for example, runs in Arabic and English with the same layout, navigation and product pages in both languages.',
      },
      {
        q: 'Can you make my Shopify store faster?',
        a: 'Yes. I audit the theme, apps, images and scripts, then fix what slows the store down on phones, with Google Lighthouse and Core Web Vitals as the measure.',
      },
      {
        q: 'Do you build Shopify apps and custom discounts?',
        a: 'Yes. I built EZ Master Discount, my own Shopify app for quantity tiers, whole-order discounts with free shipping and Buy X Get Y, running on Shopify Functions inside Shopify checkout.',
      },
      {
        q: 'How do we start a Shopify project?',
        a: `Email me at ${site.email} with your store link, what you want to change or build, and when you need it. I will reply with questions and a plan.`,
      },
    ],
  },
  {
    id: 'contact',
    nav: 'Contact',
    kind: 'contact',
    eyebrow: 'Final level',
    heading: 'Hire a Shopify developer',
    paragraphs: ['Need a new Shopify store, a custom theme, a faster store or a Shopify discount set up? Tell me about your store, what it needs and when you need it.'],
    ctas: [
      { label: 'Email me', url: `mailto:${site.email}?subject=Shopify%20project`, primary: true },
      { label: site.email, url: `mailto:${site.email}` },
    ],
  },
];
