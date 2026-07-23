import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      className="m-auto flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-white md:overflow-visible"
      style={{ maxWidth: "1200px" }}
    >
      <main className="w-full flex-1 p-5 text-center">
        <div className="z-100">
          <Navbar />
        </div>
        <Hero />
        <div className="mt-20 space-y-32">
          <Projects />
          <Skills />
          <Testimonials />
        </div>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
