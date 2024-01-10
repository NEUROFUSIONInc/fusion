import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const ChevronDown = ({
  color = "white",
  width = 25,
  height = 25,
  ...props
}: SvgProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 25 25"
      fill="none"
      {...props}
    >
      <Path
        d="M6.02344 9.03516L12.0469 15.0586L18.0703 9.03516"
        stroke={color}
        strokeWidth="2.00781"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
