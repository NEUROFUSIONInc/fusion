import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const Notebook = ({
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
        d="M7.50033 3.83325V18.8333M5.00033 3.83325H14.167C14.609 3.83325 15.0329 4.00885 15.3455 4.32141C15.6581 4.63397 15.8337 5.05789 15.8337 5.49992V15.4999C15.8337 15.9419 15.6581 16.3659 15.3455 16.6784C15.0329 16.991 14.609 17.1666 14.167 17.1666H5.00033C4.77931 17.1666 4.56735 17.0788 4.41107 16.9225C4.25479 16.7662 4.16699 16.5543 4.16699 16.3333V4.66659C4.16699 4.44557 4.25479 4.23361 4.41107 4.07733C4.56735 3.92105 4.77931 3.83325 5.00033 3.83325Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.8335 7.16675H12.5002"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.8335 10.5H12.5002"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
