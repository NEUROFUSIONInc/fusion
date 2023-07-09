import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const Pencil = ({
  color = "white",
  width = 20,
  height = 21,
  ...props
}: SvgProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 21"
      fill="none"
      {...props}
    >
      <Path
        d="M3.33301 17.1668H6.66634L15.4163 8.41676C15.8584 7.97473 16.1067 7.37521 16.1067 6.75009C16.1067 6.12497 15.8584 5.52545 15.4163 5.08342C14.9743 4.64139 14.3748 4.39307 13.7497 4.39307C13.1246 4.39307 12.525 4.6414 12.083 5.08342L3.33301 13.8334V17.1668Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.25 5.91675L14.5833 9.25008"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
