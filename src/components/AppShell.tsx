"use client";

import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
        </div>
    );
}