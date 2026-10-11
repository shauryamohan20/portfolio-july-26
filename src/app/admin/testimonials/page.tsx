import Link from "next/link";
import { deleteTestimonial, moveTestimonial } from "../testimonial-actions";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { initials } from "@/lib/testimonial-types";
import { readTestimonialsForAdmin } from "@/lib/testimonials-store";
import { storageMode } from "@/lib/json-store";

export const dynamic = "force-dynamic";

export default async function AdminTestimonials(props: PageProps<"/admin/testimonials">) {
  const testimonials = await readTestimonialsForAdmin();
  const { saved, deleted } = await props.searchParams;
  const mode = storageMode();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="mt-1 text-sm text-fun-gray">
            {testimonials.length}{" "}
            {testimonials.length === 1 ? "testimonial" : "testimonials"}, shown in the
            carousel in this order.
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="rounded-full bg-fun-pink px-5 py-2.5 text-sm font-bold text-bg transition-opacity hover:opacity-80"
        >
          + Add testimonial
        </Link>
      </div>

      {(saved || deleted) && (
        <p className="mt-6 rounded-lg border border-fun-pink/40 bg-fun-pink-darker px-4 py-3 text-sm text-fun-pink">
          {saved ? "Testimonial saved." : "Testimonial deleted."}
          {mode === "github" &&
            " Committed to GitHub — the live site updates once the rebuild finishes."}
        </p>
      )}

      <ul className="mt-8 list-none space-y-4">
        {testimonials.map((item, index) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-fun-gray-darker p-4 transition-colors hover:border-fun-pink"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fun-pink-dark">
              {item.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-mono text-xs font-bold text-fun-pink">
                  {initials(item.name)}
                </span>
              )}
            </div>

            <div className="min-w-50 flex-1">
              <h2 className="font-bold">{item.name}</h2>
              {item.job && <p className="text-xs text-fun-gray">{item.job}</p>}
              <p className="mt-1 line-clamp-2 text-sm text-fun-gray-light">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-1">
              <form action={moveTestimonial}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label={`Move ${item.name} up`}
                  className="rounded-lg border border-fun-gray-darker px-2.5 py-1.5 text-xs text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30"
                >
                  ↑
                </button>
              </form>
              <form action={moveTestimonial}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  disabled={index === testimonials.length - 1}
                  aria-label={`Move ${item.name} down`}
                  className="rounded-lg border border-fun-gray-darker px-2.5 py-1.5 text-xs text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink disabled:opacity-30"
                >
                  ↓
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/testimonials/${item.id}`}
                className="rounded-full border border-fun-pink px-4 py-1.5 text-xs font-bold text-fun-pink transition-colors hover:bg-fun-pink hover:text-bg"
              >
                Edit
              </Link>
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmDeleteButton what={`${item.name}'s testimonial`} />
              </form>
            </div>
          </li>
        ))}
      </ul>

      {testimonials.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-fun-gray-darker p-10 text-center text-fun-gray">
          No testimonials yet. The section is hidden on the site until you add one.
        </p>
      )}
    </div>
  );
}
