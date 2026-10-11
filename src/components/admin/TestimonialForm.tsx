"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveTestimonial, type FormState } from "@/app/admin/testimonial-actions";
import { initials, type Testimonial } from "@/lib/testimonial-types";
import { ACCEPT_ATTRIBUTE } from "@/lib/uploads";

const initialState: FormState = { ok: true, message: "" };

const field =
  "w-full rounded-lg border border-fun-gray-darker bg-fun-pink-darkest px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-fun-gray-medium focus:border-fun-pink";
const label = "block text-xs font-bold uppercase tracking-wider text-fun-gray";
const hint = "mt-1 text-xs text-fun-gray-medium";

export default function TestimonialForm({ testimonial }: { testimonial: Testimonial }) {
  const [state, formAction, pending] = useActionState(saveTestimonial, initialState);

  const isNew = !testimonial.id;
  const uploaded = testimonial.avatar?.startsWith("/static/testimonials/") ?? false;

  const [name, setName] = useState(testimonial.name);
  const [avatarUrl, setAvatarUrl] = useState(uploaded ? "" : testimonial.avatar ?? "");
  const [uploadName, setUploadName] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const preview = removeAvatar || uploadName ? "" : avatarUrl || testimonial.avatar || "";

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={testimonial.id} />
      <input type="hidden" name="removeAvatar" value={removeAvatar ? "1" : ""} />

      {state.message && !state.ok && (
        <p
          aria-live="polite"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.message}
        </p>
      )}

      <div>
        <span className={label}>Quote</span>
        <textarea
          className={`${field} mt-2`}
          name="quote"
          rows={5}
          required
          defaultValue={testimonial.quote}
          placeholder="What the client said. Quote marks are added automatically."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <span className={label}>Author name</span>
          <input
            className={`${field} mt-2`}
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <span className={label}>Job title</span>
          <input
            className={`${field} mt-2`}
            name="job"
            defaultValue={testimonial.job}
            placeholder="Founder, Acme Co."
          />
          <p className={hint}>Shown under the name.</p>
        </div>
      </div>

      <section className="rounded-xl border border-fun-gray-darker p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-fun-gray">
          Author photo
        </h2>
        <p className={hint}>
          Optional. Shown as a small circle next to the name — square images look best.
          Without one, the author&apos;s initials are used.
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div>
              <span className={label}>Upload an image</span>
              <input
                className="mt-2 w-full text-sm text-fun-gray-light file:mr-3 file:rounded-full file:border-0 file:bg-fun-pink file:px-4 file:py-2 file:text-xs file:font-bold file:text-bg"
                type="file"
                name="avatarFile"
                accept={ACCEPT_ATTRIBUTE}
                onChange={(event) => {
                  setUploadName(event.target.files?.[0]?.name ?? "");
                  setRemoveAvatar(false);
                }}
              />
            </div>

            <div>
              <span className={label}>…or paste an image URL</span>
              <input
                className={`${field} mt-2`}
                name="avatar"
                value={avatarUrl}
                placeholder="https://…"
                onChange={(event) => {
                  setAvatarUrl(event.target.value);
                  setRemoveAvatar(false);
                }}
              />
            </div>

            {(preview || uploadName) && !isNew && (
              <label className="flex items-center gap-2 text-xs text-fun-gray">
                <input
                  type="checkbox"
                  className="accent-fun-pink"
                  checked={removeAvatar}
                  onChange={(event) => setRemoveAvatar(event.target.checked)}
                />
                Remove the photo and show initials instead
              </label>
            )}
          </div>

          <div className="text-center">
            <span className={label}>Preview</span>
            <div className="mt-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-fun-gray-darker bg-fun-pink-dark">
              {uploadName ? (
                <span className="px-1 text-[10px] text-fun-gray-light">New photo</span>
              ) : preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-mono text-sm font-bold text-fun-pink">
                  {initials(name) || "?"}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4 border-t border-fun-pink-dark pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-fun-pink px-6 py-2.5 text-sm font-bold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "Saving…" : isNew ? "Add testimonial" : "Save changes"}
        </button>
        <Link
          href="/admin/testimonials"
          className="text-sm text-fun-gray transition-colors hover:text-fun-pink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
