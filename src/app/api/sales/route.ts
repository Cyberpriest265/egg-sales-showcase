import connectMongo from "@/lib/mongodb";
import { Sale } from "@/models/Sale";
import { EggType } from "@/models/EggType";
import { StockTransaction } from "@/models/StockTransaction";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

export async function POST(request: Request) {
    await connectMongo();

    const body = (await request.json()) as {
        eggTypeId: string;
        quantity: number;
        amountPaid: number;
        customerName?: string;
        date?: string;
    };

    if (!isValidObjectId(body.eggTypeId)) {
        return NextResponse.json({ error: "Invalid egg type id" }, { status: 400 });
    }
    if (typeof body.quantity !== "number" || body.quantity < 1) {
        return NextResponse.json({ error: "quantity must be a number of at least 1" }, { status: 400 });
    }
    if (typeof body.amountPaid !== "number" || body.amountPaid < 0) {
        return NextResponse.json({ error: "amountPaid must be a non-negative number" }, { status: 400 });
    }

    const eggType = await EggType.findOne({ _id: body.eggTypeId, isActive: true });
    if (!eggType) {
        return NextResponse.json({ error: "Egg type not found or inactive" }, { status: 404 });
    }
    if (eggType.unitPrice === undefined) {
        return NextResponse.json({ error: "Egg type has no unit price; set one before selling" }, { status: 400 });
    }

    const saleTotal = body.quantity * eggType.unitPrice;

    if (body.amountPaid > saleTotal) {
        return NextResponse.json({ error: "amountPaid cannot exceed saleTotal" }, { status: 400 });
    }

    const transactions = await StockTransaction.find({ eggTypeId: body.eggTypeId });
    const remainingStock = transactions.reduce(
        (sum, t) => (t.type === "sale-deduction" ? sum - t.quantity : sum + t.quantity),
        0
    );
    if (body.quantity > remainingStock) {
        return NextResponse.json(
            { error: `Not enough stock. Available: ${remainingStock}` },
            { status: 400 }
        );
    }

    let sale;
    try {
        sale = await Sale.create({
            eggTypeId: body.eggTypeId,
            quantity: body.quantity,
            saleTotal,
            amountPaid: body.amountPaid,
            customerName: body.customerName,
            date: body.date ? new Date(body.date) : new Date(),
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create sale";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    await StockTransaction.create({
        eggTypeId: body.eggTypeId,
        type: "sale-deduction",
        quantity: body.quantity,
        date: sale.date,
        relatedSaleId: sale._id,
    });

    return NextResponse.json(sale, { status: 201 });
}