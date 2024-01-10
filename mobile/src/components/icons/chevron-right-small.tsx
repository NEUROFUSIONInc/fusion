import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const ChevronRightSmall = ({
  color = "white",
  width = 12,
  height = 13,
  ...props
}: SvgProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 12 13"
      fill="none"
      {...props}
    >
      <Path
        d="M4.5 3.5L7.5 6.5L4.5 9.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
