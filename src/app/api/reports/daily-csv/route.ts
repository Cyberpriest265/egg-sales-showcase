import connectMongo from "@/lib/mongodb";
import { getDailySummary } from "@/services/dailySummary";
import { escapeCSV } from "@/lib/csv";
import { parseDateParam } from "@/lib/dateParam";



export async function GET(request: Request) {
    await connectMongo();

    const { searchParams } = new URL(request.url);

    const dateParam = searchParams.get("date");
    const date = parseDateParam(dateParam);

    if (!dateParam || !date) {
        return new Response(JSON.stringify({ error: "date is required (YYYY-MM-DD)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const summary = await getDailySummary(date);

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