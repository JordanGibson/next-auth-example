import type { ReactNode } from "react";
import Header from "./navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>
        <div className="min-h-screen min-w-full">
          <Header />
          {children}
        </div>
      </main>
    </>
  );
}
