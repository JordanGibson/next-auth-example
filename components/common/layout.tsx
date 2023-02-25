import type { ReactNode } from 'react';
import Header from './navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <main>
                <div className={"flex flex-col h-screen"}>
                    <Header />
                    <div id={'pageContents'} className={'flex-grow'}>
                        {children}
                    </div>
                    <ToastContainer
                        limit={3}
                        toastClassName={'bg-primary'}
                        position={'bottom-right'}
                    />
                </div>
            </main>
        </>
    );
}
