import type { ReactNode } from 'react';
import Header from './navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <main>
                <div className="min-h-screen min-w-full">
                    <Header />
                    {children}
                    <ToastContainer limit={3} toastClassName={"bg-primary"} position={"bottom-right"} />
                </div>
            </main>
        </>
    );
}
