"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

type StockItem = { eggTypeId: string; name: string; remainingStock: number };
type EggTypeOption = { _id: string; name: string; isActive: boolean };
type Transaction = {
    _id: string;
    eggTypeId: string;
    type: "opening" | "addition" | "sale-deduction";
    quantity: number;
    date: string;
};

export default function InventoryPage() {
    const [stock, setStock] = useState<StockItem[]>([]);
    const [eggTypes, setEggTypes] = useState<EggTypeOption[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [eggTypeId, setEggTypeId] = useState("");
    const [type, setType] = useState<"opening" | "addition">("opening");
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

   type AppData = {
    stock: StockItem[];
    eggTypes: EggTypeOption[];
    transactions: Transaction[];
   };
   const fetchAll = async (): Promise<AppData> => {
    const [stockRes, eggRes, txRes] = await Promise.all([
        fetch("/api/stock-transactions/stock"),
        fetch("/api/egg-types"),
        fetch("/api/stock-transactions"),
    ]);
    return {
        stock: await stockRes.json(),
        eggTypes: await eggRes.json(),
        transactions: await txRes.json(),
    };
    };

    const applyData = (data: AppData) => {
        setStock(data.stock);
        setEggTypes(data.eggTypes);
        setTransactions(data.transactions);
    };

    useEffect(() => {
        fetchAll()
            .then(applyData)
            .catch((err) => setError(err.message));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/stock-transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eggTypeId,
                    type,
                    quantity: Number(quantity),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save stock");
            }

            setQuantity("");
            setSuccess("Stock added successfully");
            const data = await fetchAll();
            applyData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save stock");
        }
    };

    return (
        <AppShell>
            <h1 className="text-3xl font-bold mb-6">Inventory</h1>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">{success}</div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500 mb-6">
                <h2 className="text-xl font-semibold mb-4">Add Stock</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Egg Type</label>
                        <select
                            value={eggTypeId}
                            onChange={(e) => setEggTypeId(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select egg type</option>
                            {eggTypes.filter((e) => e.isActive).map((egg) => (
                                <option key={egg._id} value={egg._id}>{egg.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as "opening" | "addition")}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="opening">Opening</option>
                                <option value="addition">Addition</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Add Stock
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500 mb-6">
                <h2 className="text-xl font-semibold mb-4">Current Stock</h2>
                {stock.length === 0 ? (
                    <p className="text-gray-500">No stock recorded yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {stock.map((item) => (
                            <li key={item.eggTypeId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-lg font-bold">{item.remainingStock}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500">
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                {transactions.length === 0 ? (
                    <p className="text-gray-500">No transactions yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {transactions.map((tx) => (
                            <li key={tx._id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                    {eggTypes.find((e) => e._id === tx.eggTypeId)?.name ?? "Unknown egg type"}
                                </span>
                                <span className={tx.type === "sale-deduction" ? "text-red-600" : "text-green-600"}>
                                    {tx.type === "sale-deduction" ? "−" : "+"}
                                    {tx.quantity} ({tx.type})
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
    </AppShell>
    );
}