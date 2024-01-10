import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const Pause = ({
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
        d="M7.5 4.66675H5.83333C5.3731 4.66675 5 5.03984 5 5.50008V15.5001C5 15.9603 5.3731 16.3334 5.83333 16.3334H7.5C7.96024 16.3334 8.33333 15.9603 8.33333 15.5001V5.50008C8.33333 5.03984 7.96024 4.66675 7.5 4.66675Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.1665 4.66675H12.4998C12.0396 4.66675 11.6665 5.03984 11.6665 5.50008V15.5001C11.6665 15.9603 12.0396 16.3334 12.4998 16.3334H14.1665C14.6267 16.3334 14.9998 15.9603 14.9998 15.5001V5.50008C14.9998 5.03984 14.6267 4.66675 14.1665 4.66675Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
