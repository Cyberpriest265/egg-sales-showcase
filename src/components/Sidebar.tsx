"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { todayString, weekStartString } from "@/lib/dates";

const links = [
    { href: "/", label: "Dashboard" },
    { href: "/sales", label: "Sales" },
    { href: "/inventory", label: "Inventory" },
    { href: "/adjustments", label: "Adjustments" },
    { href: "/egg-types", label: "Egg Types" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 shrink-0 h-screen sticky top-0 bg-slate-900 text-slate-300 flex flex-col">
            <div className="px-6 py-6 border-b border-slate-800">
                <p className="text-lg font-bold text-white">Egg Farm</p>
                <p className="text-xs text-slate-500 mt-1">Sales Management System</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {links.map((link) => {
                    const active = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                active
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}

                
            </nav>

            <div className="px-6 pb-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2 mt-4">Reports</p>
                <a
                    href={`/api/reports/daily-csv?date=${todayString()}`}
                    className="block w-full text-center px-4 py-2 rounded-lg text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors mb-2"
                >
                    Daily report
                </a>

                <a
                    href={`/api/reports/weekly-csv?start=${weekStartString()}`}
                    className="block w-full text-center px-4 py-2 rounded-lg text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors"
                >
                    Weekly report 
                </a>
            </div>
        
            <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
               developed by cyberpriest
            </div>
        </aside>
    );
}