import { Sale } from '@/models/Sale';
import { Adjustment } from '@/models/Adjustment';

export type DailySummary = {
    date: string;
    totalTransactions: number;
    totalQuantity: number;
    totalSalesTotal: number;
    totalPaid: number;
    totalOwed: number;
    totalIncomeAdjustments: number;
    totalExpenseAdjustments: number;
    totalTransportExpenses: number;
}


export async function getDailySummary (date: Date):
Promise<DailySummary> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const [sales, adjustments] = await Promise.all([
        Sale.find({ date: { $gte: start, $lt: end } }),
        Adjustment.find({ date: { $gte: start, $lt: end } })
    ]);

    const totalIncomeAdjustments = adjustments
        .filter((a) => a.type === "income" && a.category.toLowerCase() !== "transport")
        .reduce((sum, a) => sum + a.amount, 0);
    const totalExpenseAdjustments = adjustments
        .filter((a) => a.type === "expense" && a.category.toLowerCase() !== "transport")
        .reduce((sum, a) => sum + a.amount, 0);
    const totalTransportExpenses = adjustments
        .filter((a) => a.type === "expense" && a.category.toLowerCase() === "transport")
        .reduce((sum, a) => sum + a.amount, 0);

    return {
        date: date.toISOString(),
        totalTransactions: sales.length,
        totalQuantity:sales.reduce((sum, s) => sum + s.quantity, 0),
        totalSalesTotal: sales.reduce((sum, s) => sum + s.saleTotal, 0),
        totalPaid: sales.reduce((sum, s) => sum + s.amountPaid, 0),
        totalOwed: sales.reduce((sum, s) => sum + s.amountOwed, 0),
        totalIncomeAdjustments,
        totalExpenseAdjustments,
        totalTransportExpenses,
    };
}

export type DayRow = DailySummary;

export type WeeklySummary = {
    days: DayRow[];
    weekTotal: {
        totalQuantity: number;
        totalSalesTotal: number;
        totalPaid: number;
        totalOwed: number;
    };
};

export async function getWeeklySummary(weekStart: Date): Promise<WeeklySummary> {
    const days: DayRow[] = [];
    const base = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());

    for (let i = 0; i < 7; i++) {
        const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
        days.push(await getDailySummary(day));
    }

    const weekTotal = {
        totalQuantity: days.reduce((sum, d) => sum + d.totalQuantity, 0),
        totalSalesTotal: days.reduce((sum, d) => sum + d.totalSalesTotal, 0),
        totalPaid: days.reduce((sum, d) => sum + d.totalPaid, 0),
        totalOwed: days.reduce((sum, d) => sum + d.totalOwed, 0),
    };
    
    return { days, weekTotal };
    
}

