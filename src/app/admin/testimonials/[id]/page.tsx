import { notFound } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { getTestimonialById } from "@/lib/testimonials-store";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage(
  props: PageProps<"/admin/testimonials/[id]">
) {
  const { id } = await props.params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit testimonial</h1>
      <p className="mt-1 text-sm text-fun-gray">{testimonial.name}</p>
      <div className="mt-8">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}
