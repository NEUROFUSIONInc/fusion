import { QueryClient, QueryClientProvider, Hydrate } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React from "react";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { QUERY_OPTIONS_DEFAULT } from "~/config";
import "../styles/globals.css";
import { gtw } from "~/utils";
import { Meta } from "~/components/layouts";
import Head from "next/head";
import { reactPlugin } from "~/utils/appInsights";
import Script from "next/script";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient({ defaultOptions: QUERY_OPTIONS_DEFAULT }));

  return (
    <>
      <Head>
        {/* clarity tag for usefusion.app */}
        <Script id="clarity-app" strategy="afterInteractive">
          {`if (window.location.hostname === 'usefusion.app') {
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "h7a11p7zxo");
          }`}
        </Script>
        {/* clarity tag for usefusion.ai */}
        <Script id="clarity-ai" strategy="afterInteractive">
          {`if (window.location.hostname === 'usefusion.ai') {
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "mg6dr0x79s");
          }`}
        </Script>
        {/* make frame draggable */}
        <style type="text/css">
          {`body {
  -webkit-app-region: drag;
}
button {
  -webkit-app-region: no-drag;
}`}
        </style>
      </Head>
      <SessionProvider session={session}>
        <AppInsightsContext.Provider value={reactPlugin}>
          <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
              <ThemeProvider enableSystem forcedTheme={(Component as any).theme || undefined} attribute="class">
                <main className={`${gtw.variable} font-body`}>
                  <Component {...pageProps} />
                </main>
              </ThemeProvider>
            </Hydrate>
          </QueryClientProvider>
        </AppInsightsContext.Provider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
