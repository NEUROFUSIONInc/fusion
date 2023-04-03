import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider, Hydrate } from "@tanstack/react-query";
import React from "react";

import { QUERY_OPTIONS_DEFAULT } from "~/config";
import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient({ defaultOptions: QUERY_OPTIONS_DEFAULT }));

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <ThemeProvider enableSystem forcedTheme={(Component as any).theme || undefined} attribute="class">
            <Component {...pageProps} />
          </ThemeProvider>
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
