import { Schema, model, models } from "mongoose";

export interface SaleDocument {
    eggTypeId: Schema.Types.ObjectId;
    quantity: number;
    saleTotal: number;
    amountPaid: number;
    amountOwed: number;
    customerName: string;
    date: Date;
}

const SaleSchema = new Schema<SaleDocument>(
    {
        eggTypeId: { type: Schema.Types.ObjectId, ref: "EggType", required: true },
        quantity: { type: Number, required: true, min: 1 },
        saleTotal: { type: Number, required: true, min: 0 },
        amountPaid: { type: Number, required: true, min: 0 },
        amountOwed: { type: Number, required: true, min: 0 },
        customerName: { type: String, trim: true },
        date: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);

SaleSchema.pre("validate", async function () {
    if (this.amountPaid > this.saleTotal) {
        throw(new Error("amountPaid cannot exceed saleTotal"));
    }
    this.amountOwed = this.saleTotal - this.amountPaid;
    if (this.amountOwed > 0 && !this.customerName?.trim()){
        throw(new Error("customerName is required when there is an outstanding amount"));
    }
});

export const Sale = models.Sale || model<SaleDocument>("Sale" , SaleSchema);