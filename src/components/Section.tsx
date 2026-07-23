import type { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function Section({ id, eyebrow, title, description, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-3xl px-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
