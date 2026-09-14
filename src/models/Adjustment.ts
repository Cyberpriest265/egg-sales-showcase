import { Schema, model, models } from "mongoose";

export interface AdjustmentDocument {
    type: "income" | "expense";
    category: string;
    amount: number;
    reason: string;
    description?: string;
    responsiblePerson?: string;
    date: Date;
}

const AdjustmentSchema = new Schema<AdjustmentDocument>(
    {
        type: { type: String, enum: ["income", "expense"], required: true },
        category: { type: String, required: true, trim: true},
        amount: { type: Number, required: true, min: 0.01 },
        reason: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        responsiblePerson: { type: String, trim: true },
        date: { type: Date, required: true },
    },
    {timestamps: true }
);

export const Adjustment = models.Adjustment || model<AdjustmentDocument>("Adjustment", AdjustmentSchema);