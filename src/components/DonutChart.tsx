"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Slice = { name: string; value: number };

const COLORS = [
    "#38bdf8", "#34d399", "#fbbf24", "#f472b6",
    "#a78bfa", "#fb923c", "#f87171", "#22d3ee",
];

export default function DonutChart({ data, centerLabel }: { data: Slice[]; centerLabel: string }) {
    return (
        <div>
            <div className="relative h-56">
                <ResponsiveContainer width="100%" height={224}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Total</span>
                    <span className="text-xl font-bold text-slate-800">{centerLabel}</span>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {data.map((slice, i) => (
                    <div key={slice.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        {slice.name} · {slice.value}
                    </div>
                ))}
            </div>
        </div>
    );
}