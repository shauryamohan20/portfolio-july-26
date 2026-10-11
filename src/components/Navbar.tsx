"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile, routes } from "@/data/content";

/**
 * Sticky site header.
 *
 * The sticky element is this component's own root, so its containing block is
 * the page's main column — a wrapper that only boxes the bar in would leave it
 * nothing to stick within.
 */
export default function Navbar() {
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 -mx-5 bg-bg/85 px-5 py-4 backdrop-blur-md">
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
