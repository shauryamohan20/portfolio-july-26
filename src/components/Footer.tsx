import { profile, socials } from "@/data/content";
import { icons } from "./Icons";

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="font-semibold">
            {profile.firstName}
            <span className="text-accent">.</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            © {new Date().getFullYear()} {profile.name}. Built with Next.js &amp; Tailwind CSS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {socials.map((s) => {
            const Icon = icons[s.icon];
            return (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="text-muted transition-colors hover:text-accent"
              >
                {Icon && <Icon width={20} height={20} />}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
