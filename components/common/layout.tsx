import Head from "next/head";
import type { ReactNode } from "react";
import Header from "./header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <main>
        <div className="bg-slate-900">
          <Header />
          {children}
        </div>
      </main>
    </>
  );
}
