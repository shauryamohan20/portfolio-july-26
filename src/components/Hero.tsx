import { accentParts } from "@/lib/site-types";
import { readSite } from "@/lib/site-store";

export default async function Hero() {
  const { hero } = await readSite();

  return (
    <div
      id="top"
      className="heroElem relative z-1 m-auto flex w-full flex-col items-center justify-center pt-20 pb-40 text-center"
      style={{ maxWidth: "1200px" }}
    >
      <p className="mb-5 text-xl">{hero.greeting}</p>
      <h1 className="relative mb-10 inline-block w-auto max-w-2xl text-5xl font-bold tracking-tighter md:text-6xl lg:max-w-4xl lg:text-7xl">
        {accentParts(hero.heading).map((part, index) =>
          part.accent ? (
            <span key={index} className="text-fun-pink">
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        )}

        {/* eslint-disable @next/next/no-img-element */}
        <img
          alt=""
          className="sqD squiggle-hero-html top-[-90px] right-[5%] w-16 sm:top-[-90px] sm:right-[170px]"
          style={{ animationDelay: "0.1s" }}
          src="/static/doodles/hero/html.svg"
        />
        <img
          alt=""
          className="sqD bottom-[-320px] right-[65%] sm:right-[45%]"
          style={{ animationDelay: "0.3s" }}
          src="/static/doodles/hero/dino.svg"
        />
        <img
          alt=""
          className="sqD bottom-[-150px] left-[100px] hidden sm:block lg:left-[160px]"
          style={{ animationDelay: "0.5s" }}
          src="/static/doodles/hero/js.svg"
        />
        <img
          alt=""
          className="sqD bottom-[-180px] right-[-60px] sm:right-0"
          style={{ animationDelay: "0.7s" }}
          src="/static/doodles/hero/paintbrush.svg"
        />
        <img
          alt=""
          className="sqD squiggle-hero-pop1 top-[-130px] left-[15%] hidden sm:block lg:left-[120px]"
          src="/static/doodles/hero/pop1.svg"
        />
        <img
          alt=""
          className="sqD bottom-[-85px] left-[-35px] opacity-40 sm:bottom-[-100px] sm:left-5"
          style={{ animationDelay: "0.9s" }}
          src="/static/doodles/hero/code.svg"
        />
      </h1>
      {hero.subtext && (
        <p className="mb-10 max-w-2xl text-base text-fun-gray-light md:text-lg">
          {hero.subtext}
        </p>
      )}
      <a href={hero.ctaHref || "#projects"}>
        <div className="cursor-pointer rounded-full border-2 border-white bg-bg px-10 py-4 text-xl font-bold whitespace-nowrap text-white transition-colors hover:border-fun-pink hover:bg-fun-pink hover:text-white">
          {hero.ctaLabel}
        </div>
      </a>
    </div>
  );
}
