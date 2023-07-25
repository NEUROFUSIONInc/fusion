import Image from "next/image";
import { FC } from "react";

import { Testimonial } from "../types";

interface TestimonialProps {
  testimonial: Testimonial;
}

export const TestimonialComponent: FC<TestimonialProps> = ({ testimonial }) => {
  return (
    <div className="flex min-w-[260px] flex-col items-start space-y-10 bg-gray-50 p-5 text-sm md:min-w-[420px] md:text-base">
      <p className="text-slate-500">
        <q>{testimonial.highlight}</q>
      </p>
      <div className="flex items-center">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={80}
          height={80}
          className="mr-4 h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="text-slate-900">{testimonial.name}</p>
          <p className="text-indigo">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};
