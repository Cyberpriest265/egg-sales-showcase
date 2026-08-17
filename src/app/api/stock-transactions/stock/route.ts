import connectMongo from "@/lib/mongodb";
import { StockTransaction } from "@/models/StockTransaction";
import { EggType } from "@/models/EggType";
import { NextResponse } from "next/server";

export async function GET() {
    await connectMongo();

    const eggTypes = await EggType.find({ isActive: true }).sort({ name: 1 });
    const transactions = await StockTransaction.find({});

    const stock = eggTypes.map((eggType) => {
        const rows = transactions.filter(
            (t) => String(t.eggTypeId) === String(eggType._id)
        );

        const remainingStock = rows.reduce((sum, t) => {
            return t.type === "sale-deduction" ? sum - t.quantity : sum + t.quantity;
        }, 0);

        return { eggTypeId: eggType._id, name: eggType.name, remainingStock };
    });

    return NextResponse.json(stock);
}