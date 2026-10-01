import connectMongo from "@/lib/mongodb";
import { getWeeklySummary } from "@/services/dailySummary";
import { NextResponse } from "next/server";
import { parseDateParam } from "@/lib/dateParam";

export async function GET(request: Request) {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const weekStart = parseDateParam(startParam);

    if (!weekStart){
        return NextResponse.json({error: "Start is required (YYYY-MM-DD)"}, { status: 400 });
        }
   
    const report = await getWeeklySummary(weekStart);
    return NextResponse.json(report);
}