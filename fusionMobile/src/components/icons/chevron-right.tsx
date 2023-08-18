import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const ChevronRight = ({
  color = "white",
  width = 24,
  height = 24,
  ...props
}: SvgProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M9 6.22144L15 11.4966L9 16.7718"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
