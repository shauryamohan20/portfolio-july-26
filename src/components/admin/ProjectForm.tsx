"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProject, type FormState } from "@/app/admin/actions";
import {
  TECH_PRESETS,
  slugify,
  type Project,
  type TechIcon,
} from "@/lib/project-types";

const initialState: FormState = { ok: true, message: "" };

const field =
  "w-full rounded-lg border border-fun-gray-darker bg-fun-pink-darkest px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-fun-gray-medium focus:border-fun-pink";
const label = "block text-xs font-bold uppercase tracking-wider text-fun-gray";
const hint = "mt-1 text-xs text-fun-gray-medium";

function Field({
  children,
  title,
  note,
}: {
  children: React.ReactNode;
  title: string;
  note?: string;
}) {
  return (
    <div>
      <span className={label}>{title}</span>
      <div className="mt-2">{children}</div>
      {note && <p className={hint}>{note}</p>}
    </div>
  );
}

export default function ProjectForm({ project }: { project: Project }) {
  const [state, formAction, pending] = useActionState(saveProject, initialState);

  const isNew = !project.id;
  const presetNames = new Set(TECH_PRESETS.map((item) => item.name));

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(project.slug));
  const [imgUrl, setImgUrl] = useState(
    project.img.startsWith("/static/projects/") ? "" : project.img
  );
  const [uploadName, setUploadName] = useState("");
  const [custom, setCustom] = useState<TechIcon[]>(
    project.stack.filter((item) => !presetNames.has(item.name))
  );

  const selectedPresets = new Set(project.stack.map((item) => item.name));
  const preview = uploadName ? "" : imgUrl || project.img;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={project.id} />

      {state.message && !state.ok && (
        <p
          aria-live="polite"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {state.message}
        </p>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <Field title="Title">
          <input
            className={field}
            name="title"
            value={title}
            required
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
          />
        </Field>

        <Field title="URL slug" note={`Detail page: /projects/${slug || "…"}`}>
          <input
            className={field}
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
          />
        </Field>

        <Field title="Category" note="Shown above the title on the detail page.">
          <input
            className={field}
            name="category"
            defaultValue={project.category}
            list="category-options"
          />
          <datalist id="category-options">
            <option value="Web Development" />
            <option value="Web Design" />
            <option value="E-commerce" />
            <option value="Branding" />
          </datalist>
        </Field>

        <Field title="Tags" note="Comma separated. These are the chips on the card.">
          <input
            className={field}
            name="tags"
            defaultValue={project.tags.join(", ")}
            placeholder="Shopify, E-commerce, Liquid"
          />
        </Field>
      </section>

      <Field title="Short description" note="One or two lines, shown on the project card.">
        <textarea className={field} name="desc" rows={3} defaultValue={project.desc} required />
      </Field>

      <Field
        title="About the project"
        note="The long write-up on the detail page. Blank falls back to the short description."
      >
        <textarea className={field} name="overview" rows={8} defaultValue={project.overview} />
      </Field>

      <section className="rounded-xl border border-fun-gray-darker p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-fun-gray">Thumbnail</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Field title="Upload an image" note="PNG, JPG, WEBP, AVIF, GIF or SVG, up to 6MB.">
              <input
                className="w-full text-sm text-fun-gray-light file:mr-3 file:rounded-full file:border-0 file:bg-fun-pink file:px-4 file:py-2 file:text-xs file:font-bold file:text-bg"
                type="file"
                name="imgFile"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
                onChange={(event) => setUploadName(event.target.files?.[0]?.name ?? "")}
              />
            </Field>

            <Field
              title="…or paste an image URL"
              note="An uploaded file wins if you do both. Leave everything blank to keep the current image."
            >
              <input
                className={field}
                name="img"
                value={imgUrl}
                placeholder="https://res.cloudinary.com/…"
                onChange={(event) => setImgUrl(event.target.value)}
              />
            </Field>

            <Field title="Image alt text" note="Describes the screenshot for screen readers.">
              <input className={field} name="imgAlt" defaultValue={project.imgAlt} />
            </Field>
          </div>

          <div>
            <span className={label}>Current</span>
            <div className="mt-2 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg border border-fun-gray-darker bg-fun-pink-dark">
              {uploadName ? (
                <p className="px-4 text-center text-xs text-fun-gray-light">
                  New upload ready:
                  <br />
                  <span className="font-mono">{uploadName}</span>
                </p>
              ) : preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover object-top" />
              ) : (
                <p className="text-xs text-fun-gray-medium">No thumbnail yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Field title="Live site URL" note="Leave blank if the project is not public.">
          <input className={field} name="link" defaultValue={project.link ?? ""} placeholder="https://" />
        </Field>

        <Field title="GitHub URL" note="Optional. Adds a Source Code button.">
          <input className={field} name="github" defaultValue={project.github ?? ""} placeholder="https://github.com/…" />
        </Field>

        <div className="md:col-span-2">
          <Field
            title="Status note"
            note="Shown instead of the live-site button when there is no live URL."
          >
            <input
              className={field}
              name="status"
              defaultValue={project.status ?? ""}
              placeholder="In development — the live site is not public yet."
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-fun-gray-darker p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-fun-gray">Tech stack</h2>
        <p className={hint}>Listed in the sidebar of the detail page.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {TECH_PRESETS.map((item) => (
            <label
              key={item.name}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-fun-gray-darker px-3 py-2 text-sm transition-colors hover:border-fun-pink"
            >
              <input
                type="checkbox"
                name="stack"
                value={`${item.name}|${item.icon}`}
                defaultChecked={selectedPresets.has(item.name)}
                className="accent-fun-pink"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} width={18} height={18} alt="" />
              <span className="truncate">{item.name}</span>
            </label>
          ))}
        </div>

        {custom.length > 0 && (
          <div className="mt-5 space-y-3">
            <span className={label}>Custom entries</span>
            {custom.map((item, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <input
                  className={`${field} min-w-[9rem] flex-1`}
                  name="customStackName"
                  defaultValue={item.name}
                  placeholder="Name"
                />
                <input
                  className={`${field} min-w-[12rem] flex-[2]`}
                  name="customStackIcon"
                  defaultValue={item.icon}
                  placeholder="Icon URL"
                />
                <button
                  type="button"
                  onClick={() => setCustom(custom.filter((_, i) => i !== index))}
                  className="rounded-lg border border-fun-gray-darker px-3 py-2 text-xs text-fun-gray transition-colors hover:border-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCustom([...custom, { name: "", icon: "" }])}
          className="mt-4 rounded-full border border-fun-pink px-4 py-1.5 text-xs font-bold text-fun-pink transition-colors hover:bg-fun-pink hover:text-bg"
        >
          + Add custom tech
        </button>
      </section>

      <div className="flex items-center gap-4 border-t border-fun-pink-dark pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-fun-pink px-6 py-2.5 text-sm font-bold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "Saving…" : isNew ? "Create project" : "Save changes"}
        </button>
        <Link href="/admin" className="text-sm text-fun-gray transition-colors hover:text-fun-pink">
          Cancel
        </Link>
        {!isNew && (
          <a
            href={`/projects/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-sm text-fun-gray transition-colors hover:text-fun-pink"
          >
            View live page ↗
          </a>
        )}
      </div>
    </form>
  );
}
