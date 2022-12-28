import type { ReactNode } from "react";
import Header from "./header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>
        <div className="min-h-screen">
          <Header />
          {children}
        </div>
      </main>
    </>
  );
}
