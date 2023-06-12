import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Circle } from "react-native-svg";

export const VerticalMenu = ({
  width = 5,
  height = 25,
  color = "white",
  ...props
}: SvgProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 5 25"
      fill="none"
      {...props}
    >
      <Circle cx="2.5" cy="2.5" r="2.5" fill={color} />
      <Circle cx="2.5" cy="12.5" r="2.5" fill={color} />
      <Circle cx="2.5" cy="22.5" r="2.5" fill={color} />
    </Svg>
  );
};
