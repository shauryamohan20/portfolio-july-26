import SectionTitle from "./SectionTitle";
import TestimonialCarousel from "./TestimonialCarousel";
import { readTestimonials } from "@/lib/testimonials-store";

export default async function Testimonials() {
  const testimonials = await readTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <div className="m-auto flex w-full max-w-md flex-col text-left md:max-w-full">
      <SectionTitle title="Why clients love my work!" />
      <div className="m-auto w-full max-w-5xl">
        <TestimonialCarousel items={testimonials} />
      </div>
    </div>
  );
}
