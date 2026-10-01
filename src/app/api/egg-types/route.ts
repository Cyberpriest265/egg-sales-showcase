import connectMongo from "@/lib/mongodb";
import { EggType } from "@/models/EggType";
import { NextResponse } from 'next/server';

export async function GET() {
    await connectMongo();
    const eggTypes = await EggType.find({}).sort({ name: 1 });
    return NextResponse.json(eggTypes);
}

export async function POST(request: Request) {
    await connectMongo();

    const body = (await request.json()) as {
        name: string;
        unitPrice?: number;
        isActive: boolean;
    };

    const name = body.name?.trim();

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const eggType = await EggType.create({
        name,
        unitPrice: body.unitPrice,
        isActive: body.isActive ?? true,
    });
    return NextResponse.json(eggType, { status: 201 });
}