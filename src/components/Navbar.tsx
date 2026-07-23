import { profile, routes } from "@/data/content";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <a href="#top" className="cursor-pointer text-xl font-black">
        <span className="flex items-center">
          <span className="mr-1 text-fun-pink">{"</>"}</span>
          {profile.name.split("").map((letter, index) => (
            <span
              key={index}
              className="transition-all duration-500 hover:-mt-2 hover:text-fun-pink hover:duration-100"
            >
              {letter === " " ? " " : letter}
            </span>
          ))}
        </span>
      </a>
      <ul className="hidden items-center space-x-10 sm:flex">
        {routes.map((item, index) => (
          <li
            key={index}
            className="list-none text-white opacity-40 transition-opacity hover:opacity-100"
          >
            <a href={item.path}>{item.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
