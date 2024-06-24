import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const Help = ({
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
        d="M12.3661 21.6152C17.3367 21.6152 21.3661 17.5858 21.3661 12.6152C21.3661 7.64467 17.3367 3.61523 12.3661 3.61523C7.39553 3.61523 3.36609 7.64467 3.36609 12.6152C3.36609 17.5858 7.39553 21.6152 12.3661 21.6152Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.3661 17.6152V17.6252"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.3661 14.1154C12.3477 13.7908 12.4352 13.469 12.6156 13.1984C12.796 12.9279 13.0594 12.7233 13.3661 12.6154C13.742 12.4717 14.0793 12.2426 14.3517 11.9464C14.624 11.6501 14.8238 11.2946 14.9354 10.908C15.047 10.5214 15.0674 10.1141 14.9948 9.71827C14.9223 9.32244 14.7589 8.94885 14.5174 8.62691C14.276 8.30498 13.9631 8.04348 13.6034 7.86302C13.2437 7.68255 12.847 7.58804 12.4446 7.58692C12.0422 7.58581 11.645 7.67812 11.2843 7.85659C10.9237 8.03505 10.6093 8.29481 10.3661 8.6154"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
