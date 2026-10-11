"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initials, type Testimonial } from "@/lib/testimonial-types";

/**
 * Horizontally scrolling testimonials: three per view on desktop, one on
 * mobile. Built on native scroll-snap, so touch swiping and trackpads work on
 * their own; the arrows and dots drive the same scroll.
 */
/** Width of one card plus the 1.5rem gap between cards. */
function cardWidth(track: HTMLElement) {
  const first = track.querySelector("li");
  return first ? first.getBoundingClientRect().width + 24 : track.clientWidth;
}

export default function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const perView = Math.max(1, Math.round(track.clientWidth / cardWidth(track)));
    setPageCount(Math.max(1, Math.ceil(items.length / perView)));
    setPage(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
  }, [items.length]);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  function scrollToPage(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(next, pageCount - 1));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setPage(clamped);
  }

  const showControls = pageCount > 1;

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        onScroll={(event) => {
          const track = event.currentTarget;
          setPage(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
        }}
        className="hide-scrollbar -mx-1 flex snap-x snap-mandatory list-none gap-6 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            className="w-full shrink-0 snap-start md:w-[calc((100%-3rem)/3)]"
          >
            <figure className="relative flex h-full flex-col justify-between rounded-lg border border-fun-pink-light bg-fun-pink-darker p-5">
              {index === 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="sqD top-[-50px] left-0 z-[-100] w-20 md:top-auto md:right-[-25px] md:bottom-[-50px] md:left-auto"
                  src="/static/doodles/testimonials/yay.svg"
                />
              )}

              <blockquote className="testimonialQuote relative text-base italic">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3">
                {item.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fun-pink-dark font-mono text-xs font-bold text-fun-pink"
                  >
                    {initials(item.name)}
                  </span>
                )}
                <span className="min-w-0">
                  <b className="block truncate font-mono text-sm text-fun-pink">{item.name}</b>
                  <span className="block text-xs text-fun-gray">{item.job}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {showControls && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollToPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous testimonials"
            className="rounded-full border border-fun-gray-darker px-3 py-1.5 text-sm text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30"
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToPage(index)}
                aria-label={`Go to testimonial page ${index + 1}`}
                aria-current={index === page ? "true" : undefined}
                className={
                  index === page
                    ? "h-2.5 w-6 rounded-full bg-fun-pink transition-all"
                    : "h-2.5 w-2.5 rounded-full bg-fun-gray-darker transition-all hover:bg-fun-gray"
                }
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToPage(page + 1)}
            disabled={page >= pageCount - 1}
            aria-label="Next testimonials"
            className="rounded-full border border-fun-gray-darker px-3 py-1.5 text-sm text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
