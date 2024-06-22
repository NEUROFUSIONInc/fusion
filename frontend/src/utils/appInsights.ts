import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin, withAITracking } from "@microsoft/applicationinsights-react-js";
import { createBrowserHistory } from "history";

// const browserHistory = createBrowserHistory();

const reactPlugin = new ReactPlugin();
const ai = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.NEXT_PUBLIC_APP_INSIGHTS_KEY,
  },
});

ai.loadAppInsights();

export const appInsights = ai.appInsights;
