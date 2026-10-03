"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type BarDatum = { label: string; sales: number };

export default function SalesBarChart({ data }: { data: BarDatum[] }) {
    return (
        <div className="h-56">
            <ResponsiveContainer width="100%" height={224}>
                <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(148,163,184,0.15)" }} />
                    <Bar dataKey="sales" name="Sales (GH₵)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}