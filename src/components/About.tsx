import Image from "next/image";
import SectionTitle from "./SectionTitle";
import { profile } from "@/data/content";
import { paragraphs } from "@/lib/site-types";
import { readSite } from "@/lib/site-store";

/**
 * About section.
 *
 * Two layouts, because the shape of the content differs completely:
 * with a photo it is a portrait beside the copy; without one the copy would
 * stretch into an unreadable 1200px line, so it becomes a lead paragraph over
 * two balanced columns.
 */
export default async function About() {
  const { about } = await readSite();
  const body = paragraphs(about.body);

  // Nothing written yet — keep the page clean rather than showing an empty shell.
  if (body.length === 0 && !about.image) return null;

  const [lead, ...rest] = body;

  return (
    <div
      id="about"
      className="relative flex scroll-mt-24 flex-col justify-between pt-4 text-left md:pt-8"
    >
      <SectionTitle title={about.heading || "A little about me"} />

      {about.image ? (
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-14">
          <Portrait src={about.image} alt={about.imageAlt} />
          <div>
            <Copy lead={lead} rest={rest} />
            <Meta />
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            aria-hidden="true"
            className="sqD -top-10 right-0 hidden w-16 opacity-80 lg:block"
            src="/static/doodles/skills/star-outline.svg"
          />
          <Copy lead={lead} rest={rest} wide />
          <Meta />
        </div>
      )}
    </div>
  );
}

function Portrait({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto w-full max-w-xs md:mx-0 md:max-w-none">
      {/* Offset outline behind the photo, for a bit of depth. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2 border-fun-pink/40"
      />
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-fun-pink-dark bg-fun-pink-darker">
        <Image
          src={src}
          alt={alt || ""}
          fill
          sizes="(max-width: 768px) 80vw, 352px"
          className="object-cover"
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className="sqD -top-8 -left-6 w-14 opacity-90"
        src="/static/doodles/projects/pop.svg"
      />
    </div>
  );
}

function Copy({
  lead,
  rest,
  wide = false,
}: {
  lead?: string;
  rest: string[];
  wide?: boolean;
}) {
  return (
    <div>
      {lead && (
        <p
          className={`text-lg leading-relaxed text-fun-gray-light md:text-xl ${
            wide ? "max-w-3xl" : ""
          }`}
        >
          {lead}
        </p>
      )}

      {rest.length > 0 && (
        <div
          className={`mt-6 space-y-4 text-base leading-relaxed text-fun-gray ${
            wide ? "md:columns-2 md:gap-12 md:space-y-0" : "max-w-2xl"
          }`}
        >
          {rest.map((paragraph, index) => (
            <p key={index} className={wide ? "mb-4 break-inside-avoid" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** Small factual footer: where I am, and how to reach me. */
function Meta() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-fun-pink-dark bg-fun-pink-darker px-4 py-2 text-sm text-fun-gray-light">
        <span className="h-2 w-2 rounded-full bg-fun-pink" aria-hidden="true" />
        Based in {profile.location}
      </span>
      <a
        href={`mailto:${profile.email}`}
        className="inline-flex items-center gap-2 rounded-full border border-fun-pink px-4 py-2 text-sm font-bold text-fun-pink transition-colors hover:bg-fun-pink hover:text-bg"
      >
        Get in touch
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </a>
    </div>
  );
}
