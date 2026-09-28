import connectMongo from "@/lib/mongodb";
import { getWeeklySummary } from "@/services/dailySummary";
import { NextResponse } from "next/server";
import { parseDateParam } from "@/lib/dateParam";

export async function GET(request: Request) {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const weekStart = parseDateParam(searchParams.get("start"));

    if (!weekStart){
        return NextResponse.json({error: "Start is required (YYYY-MM-DD)"}, 
            { status: 400 });
    }

    if (!startParam) {
        return NextResponse.json({ error: "start query param required (YYYY-MM-DD)" }, { status: 400 });
    }

    const [year, month, day] = startParam.split("-").map(Number);
    if (!year || !month || !day) {
        return NextResponse.json({ error: "start must be a valid YYYY-MM-DD" }, { status: 400 });
    }

    //const weekStart = new Date(year, month - 1, day);
    const report = await getWeeklySummary(weekStart);
    return NextResponse.json(report);
}