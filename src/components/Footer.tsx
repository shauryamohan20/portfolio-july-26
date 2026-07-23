import { profile, footerColumns } from "@/data/content";

/* eslint-disable @next/next/no-img-element */

export default function Footer() {
  return (
    <footer className="z-5 flex w-full flex-col border-t border-fun-pink-darker bg-bg px-5 py-10">
      <div className="m-auto grid w-full max-w-4xl grid-cols-2 items-start justify-between sm:grid-cols-3">
        {footerColumns.map((col, index) => (
          <div key={index} className="mb-5 text-left sm:mb-0">
            <h4 className="text-sm font-bold uppercase text-fun-gray">{col.title}</h4>
            <div>
              {col.links.map((item, i) => {
                const external = item.link.startsWith("http") || item.link.startsWith("mailto");
                return (
                  <div key={i} className="my-4">
                    <a
                      href={item.link}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      className="flex items-center hover:text-fun-pink transition-colors"
                    >
                      {"icon" in item && item.icon && (
                        <span className="-mb-1 pr-2">
                          <img src={item.icon} width={20} height={20} alt="" />
                        </span>
                      )}
                      {item.name}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="col-span-2 pt-8 text-left text-fun-gray sm:col-auto sm:pt-0">
          <h4 className="text-sm font-bold uppercase text-fun-gray">Get in touch</h4>
          <p className="mt-4 text-sm">Based in {profile.location}.</p>
          <p className="mt-2 text-sm">
            <a href={`mailto:${profile.email}`} className="text-fun-pink hover:underline">
              {profile.email}
            </a>
          </p>
        </div>
      </div>
      <div className="m-auto mt-8 w-full max-w-4xl border-t border-fun-pink-dark pt-8 text-center text-fun-gray">
        <div className="inline-flex items-center text-xs font-bold uppercase tracking-widest">
          Made with
          <span className="ml-3 inline-flex items-center space-x-2">
            {/* eslint-disable @next/next/no-img-element */}
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="24" title="React" alt="React" />
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original-wordmark.svg" width="38" className="invert" title="Next.js" alt="Next.js" />
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="24" title="Tailwind CSS" alt="Tailwind CSS" />
          </span>
        </div>
        <div className="mt-3 text-xs">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-fun-gray-light">{profile.name}</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
