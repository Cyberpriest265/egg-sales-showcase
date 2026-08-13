"use client";

import { useEffect, useState } from "react";

// This defines the shape of our data so TypeScript can help us catch errors
type EggType = {
    _id: string;
    name: string;
    unitPrice?: number;
    isActive: boolean;
};

export default function EggTypesPage() {
    // State to hold the egg types we fetch from our API
    const [eggTypes, setEggTypes] = useState<EggType[]>([]);
    // State to track if we are currently loading data
    const [isLoading, setIsLoading] = useState(true);

    // useEffect runs when the component first appears on the screen
    useEffect(() => {
        fetchEggTypes();
    }, []);

    // Function to call the GET API route we just built
    const fetchEggTypes = async () => {
        try {
            const response = await fetch("/api/egg-types");
            const data = await response.json();
            setEggTypes(data);
        } catch (error) {
            console.error("Failed to fetch egg types:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Manage Egg Types</h1>

            {/* Bento UI Card for the List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Current Egg Types</h2>

                {isLoading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : eggTypes.length === 0 ? (
                    <p className="text-gray-500">No egg types found. Add one below!</p>
                ) : (
                    <ul className="space-y-3">
                        {eggTypes.map((egg) => (
                            <li key={egg._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{egg.name}</span>
                                {egg.unitPrice && (
                                    <span className="text-gray-600">GH₵{egg.unitPrice}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
