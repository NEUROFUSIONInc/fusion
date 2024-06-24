import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const Trash = ({
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
        d="M3.3335 6.33325H16.6668"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.3335 9.66675V14.6667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.6665 9.66675V14.6667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.1665 6.33325L4.99984 16.3333C4.99984 16.7753 5.17543 17.1992 5.48799 17.5118C5.80055 17.8243 6.22448 17.9999 6.6665 17.9999H13.3332C13.7752 17.9999 14.1991 17.8243 14.5117 17.5118C14.8242 17.1992 14.9998 16.7753 14.9998 16.3333L15.8332 6.33325"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.5 6.33333V3.83333C7.5 3.61232 7.5878 3.40036 7.74408 3.24408C7.90036 3.0878 8.11232 3 8.33333 3H11.6667C11.8877 3 12.0996 3.0878 12.2559 3.24408C12.4122 3.40036 12.5 3.61232 12.5 3.83333V6.33333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
