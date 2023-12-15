import { FC } from "react";

import { cn } from "~/utils";

interface PropType {
  integrations: string[];
}

export const IntegrationsCarousel: FC<PropType> = (props) => {
  const { integrations } = props;

  return (
    <div className="w-full">
      <div className="relative mt-4 flex min-h-max w-full origin-top-left rotate-[2.05deg] items-center overflow-x-hidden bg-lime-100 py-6">
        <div className="animate-marquee items-center whitespace-nowrap">
          {integrations.map((integration) => {
            return (
              <span key={integration} className={cn("mx-8 inline-flex items-center space-x-16")}>
                <p className="block text-2xl text-lime-700 font-medium md:text-5xl">{integration}</p>
                <StarIcon />
              </span>
            );
          })}
        </div>
        <div className="absolute top-1/4 animate-marquee2 whitespace-nowrap">
          {integrations.map((integration) => {
            return (
              <span key={integration} className={cn("mx-8 inline-flex items-center space-x-16")}>
                <p className="block text-2xl text-lime-700 md:text-5xl font-medium">{integration}</p>
                <StarIcon />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 17" fill="none">
    <path
      id="Star 8"
      d="M7.99752 0.317038C8.18982 -0.0644072 8.74098 -0.044636 8.90545 0.349607L10.4735 4.10831C10.5552 4.30408 10.7515 4.42701 10.9633 4.415L15.0294 4.18439C15.4559 4.1602 15.7144 4.6474 15.4552 4.98696L12.9841 8.22431C12.8554 8.39292 12.8471 8.62439 12.9634 8.8018L15.1962 12.2079C15.4304 12.5651 15.1377 13.0326 14.714 12.9779L10.6748 12.4565C10.4645 12.4294 10.2598 12.5379 10.1644 12.7273L8.33099 16.364C8.1387 16.7455 7.58754 16.7257 7.42307 16.3315L5.85499 12.5727C5.77332 12.377 5.57701 12.2541 5.36522 12.2661L1.29908 12.4967C0.872588 12.5209 0.614131 12.0337 0.873319 11.6941L3.34441 8.45675C3.47312 8.28814 3.48142 8.05667 3.36513 7.87926L1.13234 4.47318C0.898149 4.11592 1.19085 3.64849 1.61451 3.70318L5.65368 4.22454C5.86406 4.25169 6.06867 4.14314 6.16416 3.95373L7.99752 0.317038Z"
      fill="#73B12C"
    />
  </svg>
);
