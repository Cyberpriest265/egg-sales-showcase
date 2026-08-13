'use client';

import { FormEvent, useEffect, useState } from 'react';

type EggTypeItem = {
  _id: string;
  name: string;
  unitPrice?: number;
  isActive: boolean;
};

export default function Home() {
  const [eggTypes, setEggTypes] = useState<EggTypeItem[]>([]);
  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');

  const loadEggTypes = async () => {
    const response = await fetch('/api/egg-types');
    const data = await response.json();
    setEggTypes(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadEggTypes();
    };

    void fetchData();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/egg-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        unitPrice: unitPrice === '' ? undefined : Number(unitPrice),
        isActive,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || 'Could not save the egg type.');
      return;
    }

    setMessage(`Saved ${result.name}`);
    setName('');
    setUnitPrice('');
    setIsActive(true);
    await loadEggTypes();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Egg Types</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add the egg categories you want to use in sales and inventory.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Example: Large Eggs"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="unitPrice">
                Unit Price
              </label>
              <input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Optional"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              Active
            </label>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Save Egg Type
            </button>

            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Existing Egg Types</h2>

          {eggTypes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No egg types yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {eggTypes.map((eggType) => (
                <li key={eggType._id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{eggType.name}</span>
                    <span className="text-sm text-slate-500">
                      {eggType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {eggType.unitPrice ? (
                    <p className="mt-1 text-sm text-slate-600">
                      Unit price: {eggType.unitPrice}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}