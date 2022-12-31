import {SessionProvider} from "next-auth/react";
import "./styles.css";

import {NextPage} from "next";
import type {Session} from "next-auth";
import type {AppProps} from "next/app";
import {ReactElement, ReactNode, useEffect} from "react";
import Layout from "../components/common/layout";
import {themeChange} from "theme-change";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout<T> = AppProps<T> & {
    Component: NextPageWithLayout;
};

function ColorPalette() {
    return (
        <>
            <div>
                <div className="bg-primary" style={{visibility: 'hidden'}}></div>
                <div className="bg-primary-focus" style={{visibility: 'hidden'}}></div>
                <div className="bg-primary-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-secondary" style={{visibility: 'hidden'}}></div>
                <div className="bg-secondary-focus" style={{visibility: 'hidden'}}></div>
                <div className="bg-secondary-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-accent" style={{visibility: 'hidden'}}></div>
                <div className="bg-accent-focus" style={{visibility: 'hidden'}}></div>
                <div className="bg-accent-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-neutral" style={{visibility: 'hidden'}}></div>
                <div className="bg-neutral-focus" style={{visibility: 'hidden'}}></div>
                <div className="bg-neutral-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-base-100" style={{visibility: 'hidden'}}></div>
                <div className="bg-base-200" style={{visibility: 'hidden'}}></div>
                <div className="bg-base-300" style={{visibility: 'hidden'}}></div>
                <div className="bg-base-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-info" style={{visibility: 'hidden'}}></div>
                <div className="bg-info-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-success" style={{visibility: 'hidden'}}></div>
                <div className="bg-success-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-warning" style={{visibility: 'hidden'}}></div>
                <div className="bg-warning-content" style={{visibility: 'hidden'}}></div>
                <div className="bg-error" style={{visibility: 'hidden'}}></div>
                <div className="bg-error-content" style={{visibility: 'hidden'}}></div>
                <div className="primary-text" style={{visibility: 'hidden'}}></div>
            </div>
        </>
    );
}

export default function App({
                                Component,
                                pageProps: {session, ...pageProps},
                            }: AppPropsWithLayout<{ session: Session }>) {
    useEffect(() => {
        // setup theme change
        themeChange(false);
    }, []);
    return (
        <SessionProvider session={session}>
            <Layout>
                <ColorPalette/>
                <Component {...pageProps} />
            </Layout>
        </SessionProvider>
    );
}
