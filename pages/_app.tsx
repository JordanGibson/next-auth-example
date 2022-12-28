import { SessionProvider } from "next-auth/react";
import "./styles.css";

import { NextPage } from "next";
import type { Session } from "next-auth";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode, useEffect } from "react";
import Layout from "../components/common/layout";
import { themeChange } from "theme-change";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout<T> = AppProps<T> & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout<{ session: Session }>) {
  useEffect(() => {
    // setup theme change
    themeChange(false);
  }, []);
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
