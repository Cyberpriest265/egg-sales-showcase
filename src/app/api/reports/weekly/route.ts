import connectMongo from "@/lib/mongodb";
import { getWeeklySummary } from "@/services/dailySummary";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");

    if (!startParam) {
        return NextResponse.json({ error: "start query param required (YYYY-MM-DD)" }, { status: 400 });
    }

    const [year, month, day] = startParam.split("-").map(Number);
    if (!year || !month || !day) {
        return NextResponse.json({ error: "start must be a valid YYYY-MM-DD" }, { status: 400 });
    }

    const weekStart = new Date(year, month - 1, day);
    const report = await getWeeklySummary(weekStart);
    return NextResponse.json(report);
}