import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      className="m-auto flex min-h-screen w-full flex-col items-center justify-center text-white"
      style={{ maxWidth: "1200px" }}
    >
      <main className="w-full flex-1 p-5 text-center">
        <Navbar />
        <Hero />
        <div className="mt-8 space-y-20 md:mt-20 md:space-y-32">
          <About />
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
