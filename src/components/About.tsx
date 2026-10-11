import Image from "next/image";
import SectionTitle from "./SectionTitle";
import { paragraphs } from "@/lib/site-types";
import { readSite } from "@/lib/site-store";

export default async function About() {
  const { about } = await readSite();
  const body = paragraphs(about.body);

  // Nothing written yet — keep the page clean rather than showing an empty shell.
  if (body.length === 0 && !about.image) return null;

  return (
    <div id="about" className="relative flex scroll-mt-24 flex-col justify-between pt-8 text-left">
      <SectionTitle title={about.heading || "A little about me"} />
      <div className="grid items-center gap-10 md:grid-cols-[320px_1fr] md:gap-14">
        {about.image && (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-fun-pink-dark bg-fun-pink-darker md:mx-0">
            <Image
              src={about.image}
              alt={about.imageAlt || ""}
              fill
              sizes="(max-width: 768px) 80vw, 320px"
              className="object-cover"
            />
          </div>
        )}
        <div className="space-y-4 text-base leading-relaxed text-fun-gray-light md:text-lg">
          {body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
