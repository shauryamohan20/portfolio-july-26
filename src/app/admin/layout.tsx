import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { logout } from "./actions";
import { adminEnabled, hasValidSession, loginRequired } from "@/lib/admin-guard";
import { storageMode } from "@/lib/projects-store";

export const metadata: Metadata = {
  title: "Admin — Projects",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Off entirely unless a password and session secret are configured (or we
  // are running locally in development).
  if (!adminEnabled()) {
    notFound();
  }

  const signedIn = await hasValidSession();
  const mode = storageMode();

  return (
    <div className="m-auto w-full max-w-5xl px-5 py-10 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-fun-pink-dark pb-6">
        <div>
          <Link href="/admin" className="text-xl font-black">
            <span className="mr-1 text-fun-pink">{"</>"}</span>
            Project Admin
          </Link>
          <p className="mt-1 text-xs text-fun-gray">
            {mode === "github" ? (
              <>
                Saves commit to GitHub — the site rebuilds in about a minute
              </>
            ) : (
              <>
                Edits are written to <span className="font-mono">data/projects.json</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-fun-gray-darker px-4 py-2 text-sm text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink"
          >
            View site
          </Link>
          {loginRequired() && signedIn && (
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-fun-gray-darker px-4 py-2 text-sm text-fun-gray transition-colors hover:border-fun-pink hover:text-fun-pink"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>
      <main className="pt-10">{children}</main>
    </div>
  );
}
