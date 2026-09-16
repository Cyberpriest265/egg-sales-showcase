import connectMongo from "@/lib/mongodb";
import { getDailySummary } from "@/services/dailySummary";

const escapeCSV = (value: string | number) => {
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(request: Request) {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return new Response("date is required as YYYY-MM-DD", {
            status: 400,
            headers: {"Content-Type": "text/plain" },
        
        });
    }
const [y, m, d] = dateParam.split("-").map(Number);
    const summary = await getDailySummary(new Date(y, m - 1, d));

    const net =
        summary.totalSalesTotal
        + summary.totalIncomeAdjustments
        - summary.totalExpenseAdjustments
        - summary.totalTransportExpenses;

    const header = [
        "Date", "Transactions", "Quantity", "Sales Total", "Paid",
        "Owed", "Income (excl transport)", "Expenses (excl transport)",
        "Transport Expenses", "Net",
    ].map(escapeCSV);

    const row = [
        dateParam, summary.totalTransactions, summary.totalQuantity,
        summary.totalSalesTotal, summary.totalPaid, summary.totalOwed,
        summary.totalIncomeAdjustments, summary.totalExpenseAdjustments,
        summary.totalTransportExpenses, net,
    ].map(escapeCSV);

    const csv = [header.join(","), row.join(",")].join("\n");

    return new Response(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="daily-${dateParam}.csv"`,
        },
    });
}