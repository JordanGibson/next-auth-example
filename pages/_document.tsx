import { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import { createContext, useContext } from "react";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
