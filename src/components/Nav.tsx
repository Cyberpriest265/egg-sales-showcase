"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/", label: "Dashboard" },
    { href: "/sales", label: "Sales" },
    { href: "/inventory", label: "Inventory" },
    { href: "/adjustments", label: "Adjustments" },
    { href: "/egg-types", label: "Egg Types" },
];

export default function Nav() {
    const pathname = usePathname();

    return (
        <nav className="mb-8 flex flex-wrap gap-2">
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === link.href
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-slate-200 text-blue-600 hover:bg-blue-50"
                    }`}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}