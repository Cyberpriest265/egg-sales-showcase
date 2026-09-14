import connectMongo from "@/lib/mongodb";
import { Adjustment } from "@/models/Adjustment";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await connectMongo();

    const body = (await request.json()) as {
        type: "income" | "expense";
        category: string;
        amount: number;
        reason: string;
        description?: string;
        responsiblePerson?: string;
        date?: string;
    };

    if (body.type !== "income" && body.type !== "expense") {
        return NextResponse.json({ error: "type must be 'income' or 'expense'" }, { status: 400 });
    }
    if (typeof body.amount !== "number" || body.amount <= 0) {
        return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
    }
    if (!body.category?.trim() || !body.reason?.trim()) {
        return NextResponse.json({ error: "category and reason are required" }, { status: 400 });
    }

    const adjustment = await Adjustment.create({
        type: body.type,
        category: body.category.trim(),
        amount: body.amount,
        reason: body.reason.trim(),
        description: body.description?.trim(),
        responsiblePerson: body.responsiblePerson?.trim(),
        date: body.date ? new Date(body.date) : new Date(),
    });

    return NextResponse.json(adjustment, { status: 201 });
}

export async function GET() {
    await connectMongo();

    const adjustments = await Adjustment.find().sort({ date: -1 });

    return NextResponse.json(adjustments);
}