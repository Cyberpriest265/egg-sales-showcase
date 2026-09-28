"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

type EggType = {
    _id: string;
    name: string;
    unitPrice?: number;
    isActive: boolean;
};

export default function EggTypesPage() {
    const [eggTypes, setEggTypes] = useState<EggType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const fetchEggTypes = async () => {
        try {
            const response = await fetch("/api/egg-types");
            const data = await response.json();
            setEggTypes(data);
        } catch (err) {
            console.error("Failed to fetch egg types:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetch("/api/egg-types")
            .then((res) => res.json())
            .then(setEggTypes)
            .catch((err) => console.error("Failed to fetch egg types:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const resetForm = () => {
        setName("");
        setUnitPrice("");
        setEditingId(null);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const payload = {
            name,
            unitPrice: unitPrice === "" ? undefined : Number(unitPrice),
        };

        try {
            const response = await fetch(
                editingId ? `/api/egg-types/${editingId}` : "/api/egg-types",
                {
                    method: editingId ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save egg type");
            }

            resetForm();
            await fetchEggTypes();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save egg type");
        }
    };

    const handleEdit = (egg: EggType) => {
        setEditingId(egg._id);
        setName(egg.name);
        setUnitPrice(egg.unitPrice !== undefined ? String(egg.unitPrice) : "");
        setError("");
    };

    const handleToggleActive = async (egg: EggType) => {
        try {
            const response = await fetch(`/api/egg-types/${egg._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !egg.isActive }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update egg type");
            }

            await fetchEggTypes();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update egg type");
        }
    };

    const handleDelete = async (egg: EggType) => {
        if (!confirm(`Delete "${egg.name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/egg-types/${egg._id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete egg type");
            }

            if (editingId === egg._id) {
                resetForm();
            }
            await fetchEggTypes();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete egg type");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 max-w-4xl mx-auto">
            <Nav />
            <h1 className="text-3xl font-bold mb-6">Manage Egg Types</h1>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    {editingId ? "Edit Egg Type" : "Add Egg Type"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price (GH₵) <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            id="unitPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {editingId ? "Save Changes" : "Add Egg Type"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-blue-500">
                <h2 className="text-xl font-semibold mb-4">Current Egg Types</h2>

                {isLoading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : eggTypes.length === 0 ? (
                    <p className="text-gray-500">No egg types found. Add one above!</p>
                ) : (
                    <ul className="space-y-3">
                        {eggTypes.map((egg) => (
                            <li
                                key={egg._id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-medium ${egg.isActive ? "" : "text-gray-400 line-through"}`}>
                                        {egg.name}
                                    </span>
                                    {egg.unitPrice !== undefined && (
                                        <span className="text-gray-600">GH₵{egg.unitPrice}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(egg)}
                                        className={`px-3 py-1 rounded-lg text-sm ${
                                            egg.isActive
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                        {egg.isActive ? "Active" : "Inactive"}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(egg)}
                                        className="px-3 py-1 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(egg)}
                                        className="px-3 py-1 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
