import type { Meta, StoryObj } from "@storybook/react";

import { TestimonialComponent } from "./testimonial";

const meta: Meta<typeof TestimonialComponent> = {
  title: "UI/Landing/TestimonialComponent",
  component: TestimonialComponent,
};

export default meta;

type Story = StoryObj<typeof TestimonialComponent>;

export const Default: Story = {
  args: {
    testimonial: {
      id: 1,
      name: "Kelechi Odom",
      highlight: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisi eget nunc.",
      image: "/images/testimonials/john-doe.avif",
      location: "Abuja, Nigeria",
    },
  },
};
