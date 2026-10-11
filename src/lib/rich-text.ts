import sanitizeHtml from "sanitize-html";

/**
 * Cleaning for pasted rich text.
 *
 * The case-study body is authored by pasting from Word, Google Docs or a web
 * page, and whatever comes along is committed to a public repo and rendered
 * back out. So the HTML is reduced to structure only — headings, emphasis,
 * lists, links, tables — and everything else is dropped:
 *
 * - scripts, iframes, embeds and event handlers (XSS)
 * - colours, fonts and backgrounds, which would otherwise paste Word's
 *   black-on-white styling onto a dark site
 *
 * Headings keep their level, so a Heading 1 in the source is still the
 * largest heading here; the sizes come from the site's own styles.
 */

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "mark", "small", "sup", "sub",
  "ul", "ol", "li",
  "blockquote", "q", "cite",
  "a", "code", "pre",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "figure", "figcaption", "span", "div",
];

export function sanitizeRichText(html: string): string {
  if (!html.trim()) return "";

  const clean = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Word and Docs paste huge style/class soup; none of it is wanted.
    allowedStyles: {},
    allowedClasses: {},
    transformTags: {
      // Links out of the admin are external by nature.
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.href?.startsWith("http")
          ? { ...attribs, target: "_blank", rel: "noreferrer noopener" }
          : attribs,
      }),
      // Google Docs wraps bold/italic in styled spans; keep the meaning.
      b: "strong",
      i: "em",
    },
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
    exclusiveFilter: (frame) =>
      // Drop empty wrappers left behind once styling is stripped.
      ["span", "div", "p"].includes(frame.tag) &&
      !frame.text.trim() &&
      !frame.mediaChildren.length,
  });

  return clean.trim();
}

/** Plain text of the body, for descriptions and fallbacks. */
export function richTextToPlain(html: string): string {
  // Block boundaries become spaces, or words either side would run together.
  const spaced = html.replace(/<\/(p|div|li|h[1-6]|blockquote|tr|pre)>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the value carries markup rather than plain typed text. */
export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}
