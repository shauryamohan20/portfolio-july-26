import SectionTitle from "./SectionTitle";
import { testimonials } from "@/data/content";

export default function Testimonials() {
  return (
    <div className="m-auto flex w-full max-w-md flex-col text-left md:max-w-full">
      <SectionTitle title="Why clients love my work!" />
      <div className="m-auto grid max-w-5xl grid-cols-1 items-start gap-10 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <div
            key={index}
            className="relative flex h-full flex-col justify-between rounded-lg border border-fun-pink-light bg-fun-pink-darker p-5"
          >
            {index === 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="sqD top-[-50px] left-0 z-[-100] w-20 md:top-auto md:right-[-25px] md:bottom-[-50px] md:left-auto"
                src="/static/doodles/testimonials/yay.svg"
              />
            )}
            <p className="testimonialQuote relative text-base italic">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="mt-4 text-xs text-fun-gray">
              <b className="font-mono text-fun-pink">{item.name}</b> — {item.job}
            </p>
            {index === 2 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="sqD top-[-30px] right-[-15px] w-11"
                src="/static/doodles/testimonials/squiggle2.svg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
