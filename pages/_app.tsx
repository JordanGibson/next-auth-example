import { SessionProvider } from "next-auth/react";
import "./styles.css";

import { NextPage } from "next";
import type { Session } from "next-auth";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import Layout from "../components/common/layout";

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
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
