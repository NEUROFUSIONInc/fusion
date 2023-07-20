import Image from "next/image";
import { FC } from "react";

import { ITeamMember } from "../types";

interface TeamMemberProps {
  member: ITeamMember;
  handleLeftClick?: () => void;
  handleRightClick?: () => void;
  showArrows?: boolean;
}

export const TeamMember: FC<TeamMemberProps> = ({ member, handleLeftClick, handleRightClick, showArrows }) => {
  return (
    <div className="relative mx-4 flex min-h-[360px] max-w-sm flex-col overflow-hidden rounded-3xl md:min-w-[380px] md:max-w-4xl md:flex-row md:items-stretch lg:mx-auto lg:w-full">
      <Image
        src={member.image}
        alt={member.name}
        width={500}
        height={500}
        className="h-80 w-full object-cover md:h-auto md:w-2/5"
      />
      <div className="w-full bg-indigo-700 bg-team-pattern bg-contain bg-center bg-no-repeat px-7 py-28 text-center md:w-3/5 md:py-12 md:text-left">
        <div className="mx-auto flex h-full w-full max-w-xs flex-col items-center justify-center space-y-8 font-normal text-white">
          <p className="text-lg">
            <q>{member.quote}</q>
          </p>
          <div className="flex w-full flex-col">
            <h3 className="text-base font-semibold">{member.name}</h3>
            <p className="text-sm text-gray-300">{member.position}</p>
          </div>
        </div>
      </div>

      {showArrows && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 transform items-center justify-center gap-6 rounded-md bg-white/60 px-3.5 py-2.5 shadow md:bottom-1/4 md:-translate-x-36 lg:-translate-x-40">
          <button type="button" onClick={handleLeftClick}>
            <span className="sr-only">Previous member</span>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="&#240;&#159;&#166;&#134; icon &#34;arrow narrow left&#34;">
                <path
                  id="Vector"
                  d="M8.33398 20H31.6673"
                  stroke="#3715D7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_2"
                  d="M8.33398 20L15.0007 26.6667"
                  stroke="#3715D7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_3"
                  d="M8.33398 19.9997L15.0007 13.333"
                  stroke="#3715D7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </button>
          <button type="button" onClick={handleRightClick}>
            <span className="sr-only">Next member</span>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="&#240;&#159;&#166;&#134; icon &#34;arrow narrow left&#34;">
                <path
                  id="Vector"
                  d="M31.666 20H8.33268"
                  stroke="#3715D7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_2"
                  d="M31.666 20L24.9993 26.6667"
                  stroke="#3715D7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  id="Vector_3"
                  d="M31.666 19.9997L24.9993 13.333"
                  stroke="#3715D7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
