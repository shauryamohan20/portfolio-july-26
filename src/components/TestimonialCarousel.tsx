"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initials, type Testimonial } from "@/lib/testimonial-types";

/**
 * Horizontally scrolling testimonials: three per view on desktop, one on
 * mobile. Built on native scroll-snap, so touch swiping and trackpads work on
 * their own; the arrows and dots drive the same scroll.
 *
 * The track scrolls on the x axis only. `overflow-y` is pinned to hidden
 * because a scrollable x axis otherwise promotes `visible` to `auto`, which
 * let the cards scroll vertically as well.
 */

type Metrics = { card: number; gap: number; perView: number };

/** Card width, the gap between cards, and how many fit in one view. */
function measureTrack(track: HTMLElement): Metrics {
  const first = track.querySelector("li");
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const card = first ? first.getBoundingClientRect().width : track.clientWidth;
  const stride = card + gap;
  const perView =
    stride > 0 ? Math.max(1, Math.round((track.clientWidth + gap) / stride)) : 1;
  return { card, gap, perView };
}

export default function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / perView));

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { card, gap, perView: fit } = measureTrack(track);
    const stride = card + gap;
    setPerView(fit);

    // Whichever card sits at the left edge tells us the current page, except
    // at the very end: the browser cannot scroll past the last card, so the
    // final page starts mid-row and must be reported as the last page.
    const lastPage = Math.max(0, Math.ceil(items.length / fit) - 1);
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atEnd = maxScroll - track.scrollLeft <= 2;
    const firstVisible = stride > 0 ? Math.round(track.scrollLeft / stride) : 0;
    setPage(atEnd ? lastPage : Math.min(Math.floor(firstVisible / fit), lastPage));
  }, [items.length]);

  useEffect(() => {
    sync();
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(sync);
    observer.observe(track);
    return () => observer.disconnect();
  }, [sync]);

  function scrollToPage(next: number) {
    const track = trackRef.current;
    if (!track) return;

    const { card, gap, perView: fit } = measureTrack(track);
    const lastPage = Math.max(0, Math.ceil(items.length / fit) - 1);
    const clamped = Math.max(0, Math.min(next, lastPage));

    // Scroll to the exact offset of that page's first card. Scrolling by the
    // track width instead would drift: a row of N cards is N gaps wider.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: clamped * fit * (card + gap),
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setPage(clamped);
  }

  const showControls = pageCount > 1;

  return (
    <div className="relative">
      {/* Decorations sit outside the scroll track, so they are neither
          clipped by it nor part of what it can scroll over. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[-50px] left-0 z-[-10] w-20 md:top-auto md:right-[-25px] md:bottom-[-50px] md:left-auto"
        src="/static/doodles/testimonials/yay.svg"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[-30px] right-[-15px] z-[-10] w-11"
        src="/static/doodles/testimonials/squiggle2.svg"
      />

      <ul
        ref={trackRef}
        onScroll={sync}
        className="hide-scrollbar flex snap-x snap-mandatory list-none gap-6 overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        {items.map((item) => (
          <li key={item.id} className="w-full shrink-0 snap-start md:w-[calc((100%-3rem)/3)]">
            <figure className="flex h-full flex-col justify-between rounded-lg border border-fun-pink-light bg-fun-pink-darker p-5">
              <blockquote className="relative pl-7 text-base italic">
                <span
                  aria-hidden="true"
                  className="absolute top-[-8px] left-0 font-serif text-5xl leading-none text-fun-pink opacity-75"
                >
                  &ldquo;
                </span>
                {item.quote}
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
                  {item.job && <span className="block text-xs text-fun-gray">{item.job}</span>}
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
            &larr;
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
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
