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
    <section
      title="team-members"
      className="relative mx-4 my-32 flex max-w-full flex-col items-center md:mx-auto md:my-52"
    >
      <div className="mb-14 flex flex-col items-center justify-center space-y-4">
        <h2 className="max-w-2xl text-4xl font-semibold md:text-5xl lg:text-6xl text-center">
          Who is building <span className="text-primary-gradient">Fusion</span>
        </h2>
        <p className="max-w-sm text-center text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          We're a dynamic and interdisciplinary group specializing in neurotechnology, design, data infrastructure, and
          AI.
        </p>
      </div>

      <TeamMember
        member={teamMembers[selectedMemberIndex]}
        handleLeftClick={handlePreviousMember}
        handleRightClick={handleNextMember}
        showArrows
      />
    </section>
  );
};
