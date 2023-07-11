import { FC } from "react";

type ChartContainerProps = {
  type: string;
  data: object;
};

export const ChartContainer: FC<ChartContainerProps> = ({ type, data }) => {
  return (
    <div>
      <h1>Chart Container</h1>
    </div>
  );
};
