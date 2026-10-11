import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProjectNotFound() {
  return (
    <div
      className="m-auto flex min-h-screen w-full flex-col items-center justify-center overflow-x-clip text-white"
      style={{ maxWidth: "1200px" }}
    >
      <main className="w-full flex-1 p-5">
        <Navbar />
        <div className="flex flex-col items-center py-40 text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-fun-pink">
            404
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            That project doesn&apos;t exist.
          </h1>
          <p className="mt-4 max-w-md text-fun-gray-light">
            The case study you were looking for has moved or was never here.
          </p>
          <Link
            href="/#projects"
            className="mt-10 rounded-full bg-fun-pink px-6 py-3 text-sm font-bold text-bg transition-opacity hover:opacity-80"
          >
            Browse all projects
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
