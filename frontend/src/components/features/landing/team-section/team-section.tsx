import { useState } from "react";

import { teamMembers } from "./data";
import { TeamMember } from "./team-member/team-member";

export const TeamSection = () => {
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const handleNextMember = () => {
    if (selectedMemberIndex === teamMembers.length - 1) {
      setSelectedMemberIndex(0);
    } else {
      setSelectedMemberIndex(selectedMemberIndex + 1);
    }
  };

  const handlePreviousMember = () => {
    if (selectedMemberIndex === 0) {
      setSelectedMemberIndex(teamMembers.length - 1);
    } else {
      setSelectedMemberIndex(selectedMemberIndex - 1);
    }
  };
  return (
    <section title="team-members" className="relative mx-4 flex max-w-full flex-col items-center md:mx-auto md:my-52">
      <div className="mb-14 flex flex-col items-center justify-center space-y-4">
        <h2 className="max-w-2xl text-4xl font-semibold md:text-5xl lg:text-6xl text-center">
          Fusion is <span className="text-primary-gradient">open source</span>
        </h2>
        <p className="max-w-xl text-center text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          We believe in working with our doors open.
        </p>
        <p className="max-w-xl text-center text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          Join our community of contributors on{" "}
          <a href="https://github.com/neurofusioninc/fusion" className="underline">
            Github
          </a>{" "}
          &{" "}
          <a href="https://discord.gg/hzt6cAtwGE" className="underline">
            Discord
          </a>
          !
        </p>
      </div>
    </section>
  );
};
