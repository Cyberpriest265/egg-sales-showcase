import connectMongo from "@/lib/mongodb";
import {getDailySummary} from "@/services/dailySummary";
import {NextResponse} from "next/server";
import { parseDateParam } from "@/lib/dateParam";

export async function GET(request: Request) {
    await connectMongo();

    const {searchParams} = new URL(request.url);
    const date = parseDateParam(searchParams.get("date"));

    if (!date) {
        return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
    }
    const summary = await getDailySummary(date);
    return NextResponse.json(summary);
}  