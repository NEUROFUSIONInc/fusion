import { useState } from "react";

import { teamMembers } from "./data";
import { TeamMember } from "./team-member/team-member";
import { CustomLink } from "~/components/ui";

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
    <section title="team-members" className="relative mx-4 flex max-w-full flex-col items-center md:mx-auto md:my-10">
      <div className="mb-14 flex flex-col items-center justify-center space-y-4">
        <h2 className="max-w-2xl text-4xl font-semibold md:text-5xl lg:text-6xl text-center">
          Building with transparency <br /> <span className="text-primary-gradient">100% open source</span>
        </h2>

        <TeamMember
          member={teamMembers[selectedMemberIndex]}
          handleLeftClick={handlePreviousMember}
          handleRightClick={handleNextMember}
          showArrows
        />

        <div className="flex w-full flex-col items-center justify-center gap-x-6 gap-y-2 pt-6 md:flex-row md:pt-0">
          <CustomLink store="github" className="w-full md:w-auto" />
          <CustomLink store="discord" className="w-full md:w-auto" />
        </div>
      </div>
    </section>
  );
};
