import connectMongo from "@/lib/mongodb";
import { getWeeklySummary } from "@/services/dailySummary";
import { escapeCSV } from "@/lib/csv";

export async function GET(request: Request) {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");

    if (!startParam || !/^\d{4}-\d{2}-\d{2}$/.test(startParam)) {
        return new Response("start is required as YYYY-MM-DD", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
        });
    }

    const [y, m, d] = startParam.split("-").map(Number);
    const { days } = await getWeeklySummary(new Date(y, m - 1, d));

    const header = [
        "Date", "Transactions", "Quantity", "Sales Total", "Paid",
        "Owed", "Income (excl transport)", "Expenses (excl transport)",
        "Transport Expenses", "Net",
    ];

    const netOf = (day: (typeof days)[number]) =>
        day.totalSalesTotal + day.totalIncomeAdjustments
        - day.totalExpenseAdjustments - day.totalTransportExpenses;

    const rows = days.map((day) =>
        [
            day.date.substring(0, 10), day.totalTransactions, day.totalQuantity,
            day.totalSalesTotal, day.totalPaid, day.totalOwed,
            day.totalIncomeAdjustments, day.totalExpenseAdjustments,
            day.totalTransportExpenses, netOf(day),
        ].map(escapeCSV)
    );

    const totalRow = days.reduce(
        (acc, day) => ({
            transactions: acc.transactions + day.totalTransactions,
            quantity: acc.quantity + day.totalQuantity,
            salesTotal: acc.salesTotal + day.totalSalesTotal,
            paid: acc.paid + day.totalPaid,
            owed: acc.owed + day.totalOwed,
            income: acc.income + day.totalIncomeAdjustments,
            expenses: acc.expenses + day.totalExpenseAdjustments,
            transport: acc.transport + day.totalTransportExpenses,
            net: acc.net + netOf(day),
        }),
        { transactions: 0, quantity: 0, salesTotal: 0, paid: 0, owed: 0, income: 0, expenses: 0, transport: 0, net: 0 }
    );

    const csv = [
        header.map(escapeCSV).join(","),
        ...rows.map((row) => row.join(",")),
        ["TOTAL", totalRow.transactions, totalRow.quantity, totalRow.salesTotal, totalRow.paid, totalRow.owed, totalRow.income, totalRow.expenses, totalRow.transport, totalRow.net].map(escapeCSV).join(","),
    ].join("\n");

    return new Response(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="weekly-${startParam}.csv"`,
        },
    });
}