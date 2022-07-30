import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { ReactQueryDevtools } from "react-query/devtools";
import { notification } from "../utils/notification";

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <ReactQueryDevtools />
      <div
        className="h-screen w-screen fixed pointer-events-none top-0 left-0 p-4 pr-8 flex flex-col items-end justify-end gap-2"
        id="notification-layer"
      ></div>
    </SessionProvider>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.browser) return ""; // Browser should use current path
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      queryClientConfig: {
        defaultOptions: {
          mutations: {
            onError(err) {
              const error = err as Error;
              if ("message" in error) {
                notification(error.message);
              }
            },
          },
          queries: {
            retry: 0,
            onError(err) {
              const error = err as Error;
              if ("message" in error) {
                notification(error.message);
              }
            },
          },
        },
      },
      transformer: superjson,
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
