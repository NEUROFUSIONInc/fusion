import type { Meta, StoryObj } from "@storybook/react";

import { TeamMember } from "./team-member";

const meta: Meta<typeof TeamMember> = {
  title: "UI/Landing/TeamMember",
  component: TeamMember,
};

export default meta;

type Story = StoryObj<typeof TeamMember>;

export const Default: Story = {
  args: {
    member: {
      id: 1,
      name: "John Doe",
      position: "CEO",
      quote:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam id tincidunt ultrices, nunc libero ultricies nunc,",
      image:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    },
  },
};
