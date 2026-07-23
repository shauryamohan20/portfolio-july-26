import { skills } from "@/data/content";

export default function Skills() {
  return (
    <div id="skills" className="relative flex scroll-mt-24 flex-col justify-between md:flex-row">
      <h2 className="relative mb-10 mr-0 w-full text-center text-3xl font-bold md:mb-0 md:mr-10 md:w-max md:max-w-lg md:text-left">
        I&apos;ve got the experience.
        <br />
        Here&apos;s my toolbelt for success.
        {/* eslint-disable @next/next/no-img-element */}
        <img
          alt=""
          className="sqD bottom-[-80px] left-[-50px] z-[-10] lg:bottom-[-50px] lg:left-[-35px]"
          src="/static/doodles/skills/laptop.svg"
        />
        <img
          alt=""
          className="sqD top-[-15px] right-[-15px]"
          src="/static/doodles/skills/fillStar.svg"
        />
        <img
          alt=""
          className="sqD top-[140px] right-0 hidden md:block lg:top-[105px]"
          src="/static/doodles/skills/coding.svg"
        />
      </h2>
      <div className="relative mx-auto grid w-full max-w-lg grid-cols-3 place-content-center items-center gap-x-8 gap-y-12 sm:grid-cols-6 sm:gap-8 md:mx-0 md:gap-12">
        {skills.map((item, index) => (
          <div
            title={item.title}
            key={index}
            className="mx-auto flex w-10 flex-col items-center justify-center"
          >
            <img src={item.icon} style={item.style} alt={item.title} />
            <p className="mt-3 text-xs font-bold text-fun-gray opacity-80">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
