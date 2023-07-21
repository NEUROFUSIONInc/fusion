import Image from "next/image";

export const MsPartner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 md:flex-row">
      <Image
        src="/images/celebration-badge.png"
        alt="Microsoft Partner Celebration Badge"
        width={786}
        height={336}
        loading="eager"
        className="w-28 md:w-40"
      />
      <p className="ml-0 text-sm font-normal text-gray-500 dark:text-gray-400 md:ml-4 md:text-base">
        Proud to partner with <span className="font-medium text-dark dark:text-white">Microsoft for Startups</span>
      </p>
    </div>
  );
};
