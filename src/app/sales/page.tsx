"use client";

import { useEffect, useMemo, useState } from "react";

type EggTypeOption = { 
    _id: string;
    name: string;
    unitPrice?: number;
    isActive: boolean; 
};
type Sale = {
    _id: string;
    eggTypeId: string;
    quantity: number;
    saleTotal: number;
    amountPaid: number;
    amountOwed: number;
    customerName?: string;
    date: string;
};

export default function SalesPage() {
    const [eggTypes, setEggTypes] = useState<EggTypeOption[]>([]);
    const [eggTypeId, setEggTypeId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [ sales, setSales] = useState<Sale[]>([]);

    useEffect(() => {

        fetch("/api/sales")
            .then((res) => res.json())
            .then(setSales)
            .catch(() => setError("Failed to load sales"));

        fetch("/api/egg-types")
            .then((res) => res.json())
            .then(setEggTypes)
            .catch(() => setError("Failed to load egg types"));
    }, []);


    const selectedEggType = eggTypes.find((e) => e._id === eggTypeId);

    const { saleTotal, amountOwed } = useMemo(() => {
        if (!selectedEggType?.unitPrice || quantity === "") {
            return { saleTotal: 0, amountOwed: 0 };
        }

        const qty = Number(quantity);
        const total = qty * selectedEggType.unitPrice;
        const paid = amountPaid === "" ? 0 : Number(amountPaid);

        return { saleTotal: total, amountOwed: Math.max(total - paid, 0) };
    }, [selectedEggType, quantity, amountPaid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eggTypeId,
                    quantity: Number(quantity),
                    amountPaid: amountPaid === "" ? 0 : Number(amountPaid),
                    customerName: customerName === "" ? undefined : customerName,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to record sale");
            }

            setSuccess("Sale recorded successfully");
            setQuantity("");
            setAmountPaid("");
            setCustomerName("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to record sale");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Record Sale</h1>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">{success}</div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500 mb-6">
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
                            {eggTypes
                                .filter((e) => e.isActive && e.unitPrice !== undefined)
                                .map((egg) => (
                                    <option key={egg._id} value={egg._id}>
                                        {egg.name} (GH₵{egg.unitPrice})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (GH₵)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-center">
                        <div>
                            <p className="text-sm text-gray-500">Sale Total</p>
                            <p className="text-xl font-bold">GH₵{saleTotal}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Amount Owed</p>
                            <p className="text-xl font-bold">GH₵{amountOwed}</p>
                        </div>
                    </div>

                    {amountOwed > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                                placeholder="Who owes this amount?"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Record Sale
                    </button>
                </form>
        </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500">
                <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>

                {sales.length === 0 ? (
                    <p className="text-gray-500">No sales recorded yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {sales.map((sale) => (
                            <li key={sale._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">
                                        {eggTypes.find((e) => e._id === sale.eggTypeId)?.name ?? "Unknown"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(sale.date).toLocaleDateString()} · Qty {sale.quantity} · GH₵{sale.saleTotal}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        {sale.customerName ? `${sale.customerName} · ` : ""}GH₵{sale.amountPaid} paid
                                    </p>
                                    {sale.amountOwed > 0 && (
                                        <p className="text-sm text-red-600">OWES GH₵{sale.amountOwed}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            </div>
    );
}