import { Sale } from '@/models/Sale';

export type DailySummary = {
    date: string;
    totalTransactions: number;
    totalQuantity: number;
    totalSalesTotal: number;
    totalPaid: number;
    totalOwed: number;
};

export async function getDailySummary (date: Date):
Promise<DailySummary> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const sales = await Sale.find({ date: {$gte: start, $lt: end } });

    return {
        date: date.toISOString(),
        totalTransactions: sales.length,
        totalQuantity:sales.reduce((sum, s) => sum + s.quantity, 0),
        totalSalesTotal: sales.reduce((sum, s) => sum + s.saleTotal, 0),
        totalPaid: sales.reduce((sum, s) => sum + s.amountPaid, 0),
        totalOwed: sales.reduce((sum, s) => sum + s.amountOwed, 0),
    };
}