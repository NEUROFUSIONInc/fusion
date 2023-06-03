import * as React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

export const ChartArcs = ({ color = "#5E6068", ...props }: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 12C7 12.9889 7.29324 13.9556 7.84265 14.7779C8.39206 15.6001 9.17295 16.241 10.0866 16.6194C11.0002 16.9978 12.0055 17.0969 12.9755 16.9039C13.9454 16.711 14.8363 16.2348 15.5355 15.5355C16.2348 14.8363 16.711 13.9454 16.9039 12.9755C17.0969 12.0055 16.9978 11.0002 16.6194 10.0866C16.241 9.17295 15.6001 8.39206 14.7779 7.84265C13.9556 7.29324 12.9889 7 12 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.29004 18.957C7.40524 19.8723 8.72412 20.506 10.1355 20.8048C11.5469 21.1036 13.0095 21.0588 14.3999 20.674C15.7904 20.2893 17.0679 19.5759 18.1249 18.594C19.182 17.6122 19.9874 16.3906 20.4735 15.0322C20.9596 13.6739 21.112 12.2186 20.9179 10.789C20.7237 9.35947 20.1888 7.99752 19.3581 6.81797C18.5275 5.63842 17.4254 4.67585 16.1448 4.01139C14.8643 3.34693 13.4427 3.00006 12 3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
