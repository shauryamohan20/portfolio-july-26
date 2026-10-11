"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile, routes } from "@/data/content";

/**
 * Sticky site header.
 *
 * The sticky element is this component's own root, so its containing block is
 * the page's main column — a wrapper that only boxes the bar in would leave it
 * nothing to stick within.
 *
 * At the top of the page the bar is fully transparent: a background there
 * would sit as a panel over the hero's zoom-in animation. The backdrop fades
 * in on scroll, and spans the whole window rather than the centred column.
 */
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * "Home" and the logo point at "/" so no #hash is left in the address bar.
   * On the home page there is nothing to navigate to, so scroll to the top
   * instead of letting the click do nothing.
   */
  function handleHomeClick(event: React.MouseEvent) {
    if (pathname !== "/") return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <header className="sticky top-0 z-50 -mx-5 px-5 py-4">
      {/* Full-bleed backdrop, behind the bar's contents and only once scrolled. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 border-b transition-opacity duration-300 ${
          scrolled
            ? "border-fun-pink-dark bg-bg/85 opacity-100 backdrop-blur-md"
            : "border-transparent opacity-0"
        }`}
      />
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          onClick={handleHomeClick}
          aria-label={`${profile.name} — back to top`}
          className="cursor-pointer text-xl font-black"
        >
          <span className="flex items-center">
            <span className="mr-1 text-fun-pink">{"</>"}</span>
            {profile.name.split("").map((letter, index) => (
              <span
                key={index}
                className="transition-all duration-500 hover:-mt-2 hover:text-fun-pink hover:duration-100"
              >
                {letter === " " ? " " : letter}
              </span>
            ))}
          </span>
        </Link>
        <ul className="hidden items-center space-x-10 sm:flex">
          {routes.map((item, index) => (
            <li
              key={index}
              className="list-none text-white opacity-40 transition-opacity hover:opacity-100"
            >
              <Link
                href={item.path}
                onClick={item.path === "/" ? handleHomeClick : undefined}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
