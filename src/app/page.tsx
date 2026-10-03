"use client";

import { useEffect, useState, type ReactNode } from "react";
import AppShell from "@/components/AppShell";
import DonutChart from "@/components/DonutChart";
import SalesBarChart from "@/components/SalesBarChart";
import { todayString, weekStartString } from "@/lib/dates";

type Summary = {
    totalTransactions: number;
    totalQuantity: number;
    totalSalesTotal: number;
    totalPaid: number;
    totalOwed: number;
    totalIncomeAdjustments: number;
    totalExpenseAdjustments: number;
    totalTransportExpenses: number;
};

type StockItem = { eggTypeId: string; name: string; remainingStock: number };

type DayRow = {
    date: string;
    totalSalesTotal: number;
};



const shortDay = (date: string) => {
    const [y, m, d] = date.substring(0, 10).split("-").map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
    return `${label} ${d}`;
};

export default function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [stock, setStock] = useState<StockItem[]>([]);
    const [week, setWeek] = useState<DayRow[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            fetch(`/api/reports/daily?date=${todayString()}`),
            fetch("/api/stock-transactions/stock"),
            fetch(`/api/reports/weekly?start=${weekStartString()}`),
        ])
            .then(async ([sumRes, stockRes, weekRes]) => {
                setSummary(await sumRes.json());
                setStock(await stockRes.json());
                const weekData = await weekRes.json();
                setWeek(weekData.days ?? []);
            })
            .catch(() => setError("Failed to load dashboard"));
    }, []);

    const totalStock = stock.reduce((sum, item) => sum + item.remainingStock, 0);

    const adjustmentNet = summary ? summary.totalIncomeAdjustments - summary.totalExpenseAdjustments : null;

    const stockSlices = stock
        .filter((item) => item.remainingStock > 0)
        .map((item) => ({ name: item.name, value: item.remainingStock }));

    const moneySlices = summary
        ? [
              { name: "Paid", value: summary.totalPaid },
              { name: "Owed", value: summary.totalOwed },
          ].filter((slice) => slice.value > 0)
        : [];

    const weekBars = week.map((d) => ({
        label: shortDay(d.date),
        sales: d.totalSalesTotal,
    }));

    return (
        <AppShell>
            <header className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 mb-8 shadow-lg">
                <h1 className="text-2xl font-bold">Egg Sales Dashboard</h1>
                <p className="text-white/80 text-sm mt-1">{new Date().toDateString()}</p>
            </header>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                <Panel title="Stock Split by Egg Type">
                    {stockSlices.length > 0 ? (
                        <DonutChart data={stockSlices} centerLabel={`${totalStock} eggs`} />
                    ) : (
                        <p className="text-sm text-slate-400">No stock recorded yet.</p>
                    )}
                </Panel>

                <Panel title="This Week&apos;s Sales">
                    <SalesBarChart data={weekBars} />
                </Panel>

                <Panel title="Money Home vs Still Owed">
                    {moneySlices.length > 0 ? (
                        <DonutChart
                            data={moneySlices}
                            centerLabel={
                                summary ? `GH₵${(summary.totalPaid + summary.totalOwed).toFixed(2)}` : "—"
                            }
                        />
                    ) : (
                        <p className="text-sm text-slate-400">No sales yet today.</p>
                    )}
                </Panel>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card title="Today&apos;s Sales" value={summary ? `GH₵${summary.totalSalesTotal}` : "—"} accent="border-t-blue-500" />
                <Card title="Eggs Sold" value={summary ? String(summary.totalQuantity) : "—"} accent="border-t-green-500" />
                <Card title="Amount Paid" value={summary ? `GH₵${summary.totalPaid}` : "—"} accent="border-t-yellow-500" />
                <Card title="Amount Owed" value={summary ? `GH₵${summary.totalOwed}` : "—"} accent="border-t-red-500" />
                <Card
                    title="Adjustments (excl. transport)"
                    value={adjustmentNet !== null ? `${adjustmentNet >= 0 ? "+" : "−"}GH₵${Math.abs(adjustmentNet)}` : "—"}
                    accent={adjustmentNet !== null && adjustmentNet < 0 ? "border-t-red-500" : "border-t-emerald-500"}
                />
                <Card title="Remaining Stock" value={String(totalStock)} accent="border-t-purple-500" />
            </section>
            
        </AppShell>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 mb-2">{title}</h2>
            {children}
        </div>
    );
}

function Card({ title, value, accent }: { title: string; value: string; accent?: string }) {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 hover:shadow-md transition-shadow ${accent ?? "border-t-blue-500"}`}>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
}