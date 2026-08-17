import connectMongo from '@/lib/mongodb';
import { StockTransaction } from '@/models/StockTransaction';
import { EggType } from '@/models/EggType';
import { NextResponse} from 'next/server';
import {isValidObjectId} from 'mongoose';


export async function POST(request: Request) {
    await connectMongo();

    const body = (await request.json()) as {
        eggTypeId: string;
        type: "opening" | "addition",
        quantity: number;
        date?: string;
    };

    if (!isValidObjectId(body.eggTypeId)) {
        return NextResponse.json({ error: "Invalid egg type id"}, { status: 400});
    }
    if (body.type !== "opening" && body.type !== "addition"){
        return NextResponse.json({ error: "type must be 'opening' or 'addition'"}, {status: 400});
    }
    if (typeof body.quantity !== "number" || body.quantity < 1) {
        return NextResponse.json({ error: "quantity must be a number of at least 1"}, {status: 400});
    }

    const eggType = await EggType.findById(body.eggTypeId);
    if (!eggType) {
        return NextResponse.json({error: "Egg type not found"}, {status: 404});
    }
    const transaction = await StockTransaction.create({
        eggTypeId: body.eggTypeId,
        type: body.type,
        quantity: body.quantity,
        date: body.date ? new Date(body.date) : new Date()
    });

    return NextResponse.json(transaction, {status: 201});
}

export async function GET(request: Request) {
    await connectMongo();

    const {searchParams} = new URL(request.url);
    const eggTypeId = searchParams.get("eggTypeId");

    const filter = eggTypeId ? {eggTypeId} :{};

    const transactions = await StockTransaction.find(filter).sort({ date: -1});
    return NextResponse.json(transactions);
}