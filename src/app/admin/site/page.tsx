import SiteContentForm from "@/components/admin/SiteContentForm";
import { readSiteForAdmin } from "@/lib/site-store";
import { storageMode } from "@/lib/json-store";

export const dynamic = "force-dynamic";

export default async function AdminSitePage(props: PageProps<"/admin/site">) {
  const content = await readSiteForAdmin();
  const { saved } = await props.searchParams;
  const mode = storageMode();

  return (
    <div>
      <h1 className="text-2xl font-bold">Page content</h1>
      <p className="mt-1 text-sm text-fun-gray">
        The hero at the top of the home page, and the about section below it.
      </p>

      {saved && (
        <p className="mt-6 rounded-lg border border-fun-pink/40 bg-fun-pink-darker px-4 py-3 text-sm text-fun-pink">
          Content saved.
          {mode === "github" &&
            " Committed to GitHub — the live site updates once the rebuild finishes."}
        </p>
      )}

      <div className="mt-8">
        <SiteContentForm content={content} />
      </div>
    </div>
  );
}
