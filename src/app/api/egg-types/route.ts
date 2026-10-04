import connectMongo from "@/lib/mongodb";
import { EggType } from "@/models/EggType";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectMongo();
        const eggTypes = await EggType.find({}).sort({ name: 1 });
        return NextResponse.json(eggTypes);
    } catch (err) {
        console.error("GET /api/egg-types failed:", err);
        return NextResponse.json(
            { error: "Failed to fetch egg types" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await connectMongo();

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const b = (body ?? {}) as {
            name?: unknown;
            unitPrice?: unknown;
            isActive?: unknown;
        };

        const name = typeof b.name === "string" ? b.name.trim() : "";

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const unitPrice =
            typeof b.unitPrice === "number" && Number.isFinite(b.unitPrice) && b.unitPrice >= 0
                ? b.unitPrice
                : typeof b.unitPrice === "string" && b.unitPrice.trim() !== ""
                ? Number(b.unitPrice)
                : undefined;

        if (unitPrice !== undefined && Number.isNaN(unitPrice)) {
            return NextResponse.json({ error: "Unit price must be a number" }, { status: 400 });
        }

        const isActive = typeof b.isActive === "boolean" ? b.isActive : true;

        const eggType = await EggType.create({
            name,
            unitPrice,
            isActive,
        });

        return NextResponse.json(eggType, { status: 201 });
    } catch (err) {
        console.error("POST /api/egg-types failed:", err);
        return NextResponse.json(
            { error: "Failed to create egg type" },
            { status: 500 }
        );
    }
}