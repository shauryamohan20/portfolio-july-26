/** Editable page content that is not a project or a testimonial. */

export type HeroContent = {
  /** Small line above the headline. */
  greeting: string;
  /** Headline. Words wrapped in *asterisks* are shown in the accent colour. */
  heading: string;
  /** Supporting line under the headline. Leave empty to hide it. */
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
};

export type AboutContent = {
  /** Section heading. */
  heading: string;
  /** Body copy. Blank lines separate paragraphs. */
  body: string;
  /** Portrait or photo; the section shows text only when empty. */
  image: string;
  imageAlt: string;
};

export type SiteContent = {
  hero: HeroContent;
  about: AboutContent;
};

/** Split a heading into plain and *accented* runs. */
export function accentParts(heading: string) {
  return heading
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*") && part.length > 2
        ? { text: part.slice(1, -1), accent: true }
        : { text: part, accent: false }
    );
}

/** Blank-line separated paragraphs. */
export function paragraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
