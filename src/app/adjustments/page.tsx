"use client";

import { useEffect, useState } from "react";

type Adjustment = {
    _id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    reason: string;
    description?: string;
    responsiblePerson?: string;
    date: string;
};

export default function AdjustmentsPage() {

    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
    const [adjustmentType, setAdjustmentType] = useState("income");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [responsiblePerson, setResponsiblePerson] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetch("/api/adjustments")
            .then((res) => res.json())
            .then(setAdjustments)
            .catch(() => setError("Failed to load adjustments"));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/adjustments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: adjustmentType,
                    category,
                    amount: Number(amount),
                    reason,
                    responsiblePerson: responsiblePerson === "" ? undefined : responsiblePerson,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to record adjustment");
            }

            setSuccess("Adjustment recorded");
            setCategory("");
            setAmount("");
            setReason("");
            setResponsiblePerson("");
            fetch("/api/adjustments")
                .then((res) => res.json())
                .then(setAdjustments);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to record adjustment");
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Adjustments</h1>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">{success}</div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500 mb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={adjustmentType}
                                onChange={(e) => setAdjustmentType(e.target.value as "income" | "expense")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                placeholder="e.g. transport, rent"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GH₵)</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            placeholder="Why is this adjustment happening?"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Person (optional)</label>
                        <input
                            type="text"
                            value={responsiblePerson}
                            onChange={(e) => setResponsiblePerson(e.target.value)}
                            placeholder="Who handled this?"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Record Adjustment
                    </button>
                </form>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500">
                <h2 className="text-xl font-semibold mb-4">Adjustment History</h2>

                {adjustments.length === 0 ? (
                    <p className="text-gray-500">No adjustments recorded yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {adjustments.map((a) => (
                            <li key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">
                                        {a.category} · <span className={a.type === "income" ? "text-green-600" : "text-red-600"}>{a.type}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">{a.reason}</p>
                                    <p className="text-sm text-gray-400">
                                        {new Date(a.date).toLocaleDateString()}
                                        {a.responsiblePerson ? ` · ${a.responsiblePerson}` : ""}
                                    </p>
                                </div>
                                <p className={`text-lg font-semibold ${a.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                    {a.type === "income" ? "+" : "−"}GH₵{a.amount}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}