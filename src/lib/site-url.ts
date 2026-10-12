/**
 * Canonical origin for absolute URLs (sitemap, robots, Open Graph).
 *
 * Set NEXT_PUBLIC_SITE_URL in the hosting environment if the domain changes;
 * Vercel also exposes VERCEL_PROJECT_PRODUCTION_URL for preview builds.
 */
const FALLBACK = "https://www.shaurya.space";

export const siteUrl = (() => {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "");

  const value = configured || FALLBACK;
  return value.replace(/\/+$/, "");
})();
