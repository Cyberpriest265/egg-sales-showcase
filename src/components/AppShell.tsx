"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 md:flex">
            {/* Mobile-only top bar */}
            <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-slate-900 px-4 py-3 text-white md:hidden">
                <div>
                    <p className="font-bold">Egg Farm</p>
                    <p className="text-xs text-slate-400">Sales Management System</p>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-blue-600"
                >
                    Menu
                </button>
            </header>

            {/* Mobile drawer — only rendered while open */}
            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto">
                        <Sidebar onNavigate={() => setOpen(false)} />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <main className="min-w-0 flex-1 px-4 py-6 pt-20 md:px-6 md:py-8 lg:px-8 lg:py-8">
                {children}
            </main>
        </div>
    );
}