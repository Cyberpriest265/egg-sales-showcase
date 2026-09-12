import connectMongo from "@/lib/mongodb";
import {getDailySummary} from "@/services/dailySummary";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    await connectMongo();

    const {searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
        return NextResponse.json({ error: "Missing date parameter required (YYYY-MM-DD)" }, { status: 400 });
    }

    const [year, month, day] = dateParam.split("-").map(Number);
    if (!year || !month || !day) {
        return NextResponse.json({ error: "date must be a valid YYYY-MM-DD" }, { status: 400 });
    }

    const date = new Date(year, month - 1, day);
    const summary = await getDailySummary(date);

    return NextResponse.json(summary);
}  