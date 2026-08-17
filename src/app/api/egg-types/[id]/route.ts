import connectMongo from "@/lib/mongodb";
import { EggType } from "@/models/EggType";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid egg type id" }, { status: 400 });
    }

    await connectMongo();
    const eggType = await EggType.findById(id);

    if (!eggType) {
        return NextResponse.json({ error: "Egg type not found" }, { status: 404 });
    }

    return NextResponse.json(eggType);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid egg type id" }, { status: 400 });
    }

    const body = (await request.json()) as {
        name?: string;
        unitPrice?: number;
        isActive?: boolean;
    };

    const update: { name?: string; unitPrice?: number; isActive?: boolean } = {};

    if (body.name !== undefined) {
        const name = body.name.trim();
        if (!name) {
            return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
        }
        update.name = name;
    }
    if (body.unitPrice !== undefined) {
        if (typeof body.unitPrice !== "number" || body.unitPrice < 0) {
            return NextResponse.json({ error: "unitPrice must be a non-negative number" }, { status: 400 });
        }
        update.unitPrice = body.unitPrice;
    }
    if (body.isActive !== undefined) {
        update.isActive = body.isActive;
    }

    await connectMongo();
    const eggType = await EggType.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
    });

    if (!eggType) {
        return NextResponse.json({ error: "Egg type not found" }, { status: 404 });
    }

    return NextResponse.json(eggType);
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid egg type id" }, { status: 400 });
    }

    await connectMongo();
    const eggType = await EggType.findByIdAndDelete(id);

    if (!eggType) {
        return NextResponse.json({ error: "Egg type not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Egg type deleted", id });
}
