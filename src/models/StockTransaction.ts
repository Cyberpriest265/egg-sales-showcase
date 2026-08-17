import {Schema, model, models } from 'mongoose';

export interface StockTransactionDocument {
    eggTypeId: Schema.Types.ObjectId;
    type: 'opening' | 'addition' | 'sale-deduction';
    quantity: number;
    date: Date;
    relatedSaleId?:  Schema.Types.ObjectId;
}

const StockTransactionSchema = new Schema<StockTransactionDocument>(
    {
        eggTypeId: { type: Schema.Types.ObjectId, ref: 'EggType', required: true},
        type: {
            type: String,
            enum: ['opening' , 'addition' , 'sale-deduction'],
            required: true,
        },
        quantity: {type: Number, required: true, min:1 },
        date: {type: Date, required: true},
        relatedSaleId: {type: Schema.Types.ObjectId, ref: 'Sale', required: false},
    },
    {
        timestamps: true,
    }
);

export const StockTransaction =
models.StockTransaction || model<StockTransactionDocument>('StockTransaction' , StockTransactionSchema);