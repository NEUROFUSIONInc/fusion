import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const Location = ({
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
        d="M17.5003 3L12.0836 18C12.0471 18.0798 11.9884 18.1474 11.9145 18.1948C11.8407 18.2422 11.7547 18.2674 11.667 18.2674C11.5792 18.2674 11.4933 18.2422 11.4194 18.1948C11.3456 18.1474 11.2869 18.0798 11.2503 18L8.33364 12.1667L2.5003 9.25C2.42052 9.21344 2.35291 9.15474 2.30551 9.08088C2.25811 9.00701 2.23291 8.9211 2.23291 8.83333C2.23291 8.74557 2.25811 8.65965 2.30551 8.58579C2.35291 8.51193 2.42052 8.45323 2.5003 8.41667L17.5003 3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
