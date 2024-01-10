import { useNavigation } from "@react-navigation/native";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

export const InsightContext = createContext<null | {
  insightPeriod: "day" | "week" | "month" | "year";
  setInsightPeriod: Dispatch<SetStateAction<"day" | "week" | "month" | "year">>;
}>(null);

export const InsightContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const navigation = useNavigation();

  const [insightPeriod, setInsightPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("week");

  useEffect(() => {
    navigation.setParams({ chartPeriod: insightPeriod });
  }, [insightPeriod]);

  return (
    <InsightContext.Provider value={{ insightPeriod, setInsightPeriod }}>
      {children}
    </InsightContext.Provider>
  );
};
