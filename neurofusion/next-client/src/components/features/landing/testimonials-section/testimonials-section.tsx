import { Star } from "lucide-react";

import { testimonials } from "./data";
import { TestimonialComponent } from "./testimonial/testimonial";
import { useSearchParams } from "next/navigation";

export const TestimonialSection = () => {
  const searchParams = useSearchParams();

  return (
    <section
      title="Testimonials"
      aria-labelledby="testimonials"
      className="relative mb-20 mt-28 flex w-full flex-col items-start space-y-4 md:mb-36"
    >
      <div className="md:mp-16 max-w-5xl px-4 lg:mx-auto">
        {searchParams.get("persona") == "explorers_researchers" ? (
          <h2 className="w-11/12 text-left text-3xl font-semibold md:text-5xl lg:text-6xl">
            We're building a community for <span className="text-primary-gradient">open self-experimentation</span>
          </h2>
        ) : (
          <h2 className="w-11/12 text-left text-3xl font-semibold md:text-5xl lg:text-6xl">
            Live with <span className="text-primary-gradient"> more agency and awareness</span>
          </h2>
        )}
      </div>

      <div className="h-24 w-screen bg-stripe-pattern bg-cover bg-center bg-no-repeat py-8 md:h-60" />

      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl">
        <div className="no-scrollbar flex w-full flex-nowrap items-stretch justify-start gap-y-3 space-x-3 overflow-x-auto px-4 pt-12 md:justify-between">
          {testimonials.map((testimonial) => (
            <TestimonialComponent key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* <div className="inline-flex items-start justify-start p-8">
          <div className="mr-2 flex items-end justify-start gap-0.5">
            <Star className="h-3 w-3 fill-yellow stroke-0" />
            <Star className="h-5 w-5 fill-yellow stroke-0" />
            <Star className="h-3 w-3 fill-yellow stroke-0" />
          </div>

          <p className="text-base font-normal text-slate-600 md:text-lg">
            200+ users rated us <span className="font-medium text-lime-700">4.67 </span>
            out of <span className="font-medium text-lime-700">5</span>
          </p>
        </div> */}
      </div>
    </section>
  );
};
