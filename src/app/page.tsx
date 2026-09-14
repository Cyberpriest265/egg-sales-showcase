"use client";

import { useEffect, useState } from "react";

type Summary = {
    totalTransactions: number;
    totalQuantity: number;
    totalSalesTotal: number;
    totalPaid: number;
    totalOwed: number;
};

type StockItem = { eggTypeId: string; name: string; remainingStock: number };

const todayString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
  Promise.all([
    fetch(`/api/reports/daily?date=${todayString()}`),
    fetch("/api/stock-transactions/stock"),
  ])
    .then(async ([sumRes, stockRes]) => {
      setSummary(await sumRes.json());
      setStock(await stockRes.json());
    })
    .catch(() => setError("Failed to load dashboard"));
  }, []);

  const totalStock = stock.reduce((sum, item) => sum + item.remainingStock, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Today's Sales" value={summary ? `GH₵${summary.totalSalesTotal}` : "—"} accent="border-t-blue-500" />
        <Card title="Eggs Sold" value={summary ? String(summary.totalQuantity) : "—"} accent="border-t-green-500" />
        <Card title="Amount Paid" value={summary ? `GH₵${summary.totalPaid}` : "—"} accent="border-t-yellow-500" />
        <Card title="Amount Owed" value={summary ? `GH₵${summary.totalOwed}` : "—"} accent="border-t-red-500" />
        <Card title="Remaining Stock" value={String(totalStock)} accent="border-t-purple-500" />
      </div>
    </div>
  );
}

function Card({ title, value, accent }: { title: string; value: string; accent?: string }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 ${accent ?? "border-t-blue-500"}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}