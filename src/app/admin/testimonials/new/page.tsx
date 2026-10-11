import TestimonialForm from "@/components/admin/TestimonialForm";
import { emptyTestimonial } from "@/lib/testimonial-types";

export default function NewTestimonialPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Add a testimonial</h1>
      <p className="mt-1 text-sm text-fun-gray">
        It goes to the end of the carousel; reorder it from the list.
      </p>
      <div className="mt-8">
        <TestimonialForm testimonial={emptyTestimonial()} />
      </div>
    </div>
  );
}
