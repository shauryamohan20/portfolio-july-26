"use client";

import { useActionState, useState } from "react";
import { saveSite, type FormState } from "@/app/admin/site-actions";
import { accentParts, type SiteContent } from "@/lib/site-types";
import { ACCEPT_ATTRIBUTE } from "@/lib/uploads";

const initialState: FormState = { ok: true, message: "" };

const field =
  "w-full rounded-lg border border-fun-gray-darker bg-fun-pink-darkest px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-fun-gray-medium focus:border-fun-pink";
const label = "block text-xs font-bold uppercase tracking-wider text-fun-gray";
const hint = "mt-1 text-xs text-fun-gray-medium";

export default function SiteContentForm({ content }: { content: SiteContent }) {
  const [state, formAction, pending] = useActionState(saveSite, initialState);

  const [heading, setHeading] = useState(content.hero.heading);
  const uploaded = content.about.image.startsWith("/static/about/");
  const [imageUrl, setImageUrl] = useState(uploaded ? "" : content.about.image);
  const [uploadName, setUploadName] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const preview = removeImage || uploadName ? "" : imageUrl || content.about.image;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="removeAboutImage" value={removeImage ? "1" : ""} />

      {state.message && !state.ok && (
        <p
          aria-live="polite"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.message}
        </p>
      )}

      <section className="rounded-xl border border-fun-gray-darker p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-fun-gray">
          Hero (top of the home page)
        </h2>

        <div className="mt-4 space-y-5">
          <div>
            <span className={label}>Greeting</span>
            <input
              className={`${field} mt-2`}
              name="heroGreeting"
              defaultValue={content.hero.greeting}
              placeholder="Hey, I'm Shaurya. 👋"
            />
          </div>

          <div>
            <span className={label}>Headline</span>
            <textarea
              className={`${field} mt-2`}
              name="heroHeading"
              rows={2}
              required
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
            />
            <p className={hint}>
              Wrap words in *asterisks* to colour them. Preview:{" "}
              <span className="text-sm font-bold text-white">
                {accentParts(heading).map((part, index) =>
                  part.accent ? (
                    <span key={index} className="text-fun-pink">
                      {part.text}
                    </span>
                  ) : (
                    <span key={index}>{part.text}</span>
                  )
                )}
              </span>
            </p>
          </div>

          <div>
            <span className={label}>Text under the headline</span>
            <textarea
              className={`${field} mt-2`}
              name="heroSubtext"
              rows={3}
              defaultValue={content.hero.subtext}
              placeholder="A sentence or two introducing what you do. Leave empty to hide it."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <span className={label}>Button label</span>
              <input
                className={`${field} mt-2`}
                name="heroCtaLabel"
                defaultValue={content.hero.ctaLabel}
                placeholder="Tell me more"
              />
            </div>
            <div>
              <span className={label}>Button link</span>
              <input
                className={`${field} mt-2`}
                name="heroCtaHref"
                defaultValue={content.hero.ctaHref}
                placeholder="#projects"
              />
              <p className={hint}>A section anchor like #projects, or a full URL.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-fun-gray-darker p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-fun-gray">
          About section
        </h2>
        <p className={hint}>
          Hidden on the site until you add text or a photo.
        </p>

        <div className="mt-4 space-y-5">
          <div>
            <span className={label}>Heading</span>
            <input
              className={`${field} mt-2`}
              name="aboutHeading"
              defaultValue={content.about.heading}
              placeholder="A little about me"
            />
          </div>

          <div>
            <span className={label}>About you</span>
            <textarea
              className={`${field} mt-2`}
              name="aboutBody"
              rows={10}
              defaultValue={content.about.body}
              placeholder={"Write as much as you like.\n\nLeave a blank line between paragraphs."}
            />
            <p className={hint}>Leave a blank line between paragraphs.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <div>
                <span className={label}>Upload a photo</span>
                <input
                  className="mt-2 w-full text-sm text-fun-gray-light file:mr-3 file:rounded-full file:border-0 file:bg-fun-pink file:px-4 file:py-2 file:text-xs file:font-bold file:text-bg"
                  type="file"
                  name="aboutImageFile"
                  accept={ACCEPT_ATTRIBUTE}
                  onChange={(event) => {
                    setUploadName(event.target.files?.[0]?.name ?? "");
                    setRemoveImage(false);
                  }}
                />
                <p className={hint}>Shown as a tall portrait — around 800×1000 works well.</p>
              </div>

              <div>
                <span className={label}>…or paste an image URL</span>
                <input
                  className={`${field} mt-2`}
                  name="aboutImage"
                  value={imageUrl}
                  placeholder="https://…"
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    setRemoveImage(false);
                  }}
                />
              </div>

              <div>
                <span className={label}>Photo alt text</span>
                <input
                  className={`${field} mt-2`}
                  name="aboutImageAlt"
                  defaultValue={content.about.imageAlt}
                  placeholder="Shaurya at his desk"
                />
              </div>

              {(preview || uploadName) && (
                <label className="flex items-center gap-2 text-xs text-fun-gray">
                  <input
                    type="checkbox"
                    className="accent-fun-pink"
                    checked={removeImage}
                    onChange={(event) => setRemoveImage(event.target.checked)}
                  />
                  Remove the photo
                </label>
              )}
            </div>

            <div className="text-center">
              <span className={label}>Preview</span>
              <div className="mt-2 flex aspect-[4/5] w-32 items-center justify-center overflow-hidden rounded-xl border border-fun-gray-darker bg-fun-pink-dark">
                {uploadName ? (
                  <span className="px-2 text-[10px] text-fun-gray-light">New photo</span>
                ) : preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-2 text-[10px] text-fun-gray-medium">No photo</span>
                )}
              </div>
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
          {pending ? "Saving…" : "Save content"}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-fun-gray transition-colors hover:text-fun-pink"
        >
          View home page ↗
        </a>
      </div>
    </form>
  );
}
