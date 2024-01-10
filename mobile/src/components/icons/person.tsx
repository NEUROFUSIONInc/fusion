import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Defs, Rect, Circle, G, ClipPath } from "react-native-svg";

export const Person = ({ color = "white", ...props }: SvgProps) => {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none" {...props}>
      <G id="Frame 848">
        <G clipPath="url(#clip0_101_705)">
          <Circle
            id="Ellipse 5"
            cx="13"
            cy="12"
            r="3.5"
            stroke={color}
            strokeWidth={1.5}
          />
          <Circle
            id="Ellipse 6"
            cx="13"
            cy="27"
            r="8.5"
            stroke={color}
            strokeWidth={1.5}
          />
        </G>
        <Rect
          x="0.5"
          y="0.5"
          width="25"
          height="25"
          rx="12.5"
          stroke={color}
          strokeWidth={1.5}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_101_705">
          <Rect width="26" height="26" rx="13" fill={color} />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
