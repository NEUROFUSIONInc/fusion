import Image from "next/image";

export const MsPartner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-0 md:flex-row">
      <Image
        src="/images/celebration-badge.svg"
        alt="Microsoft Partner Celebration Badge"
        width={220}
        height={90}
        loading="eager"
        className="h-16 w-48 md:h-24 md:w-56"
      />
      <p className="ml-0 text-sm font-normal text-gray-500 dark:text-gray-400 md:-ml-10 md:text-base">
        Proud to partner with <span className="font-medium text-dark">Microsoft for Startups</span>
      </p>
    </div>
  );
};
