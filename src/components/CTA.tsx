import { profile } from "@/data/content";

export default function CTA() {
  return (
    <div id="contact" className="relative w-full scroll-mt-24 pt-36">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="m-auto mb-2 w-30" src="/static/doodles/lineBreak.svg" />
      <div className="pt-14 pb-40 text-center">
        <h2 className="mb-10 text-4xl font-bold md:text-5xl">
          Interested in Working Together?
        </h2>
        <a
          href={`mailto:${profile.email}`}
          className="mt-6 cursor-pointer rounded-full border-2 border-white bg-bg px-8 py-3 font-bold whitespace-nowrap text-white transition-colors hover:border-fun-pink hover:bg-fun-pink"
        >
          Get in Touch
        </a>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="sqD bottom-[-100px] left-1/2 min-w-[800px] -translate-x-1/2 object-cover sm:bottom-[-150px] sm:min-w-[1100px]"
        style={{ zIndex: -10 }}
        src="/static/doodles/hero/fancyLines.svg"
      />
    </div>
  );
}
