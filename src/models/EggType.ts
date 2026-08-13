import { Schema, model, models } from 'mongoose';

export interface EggTypeDocument {
  name: string;
  unitPrice?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EggTypeSchema = new Schema<EggTypeDocument>(
  {
    name: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: false, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

export const EggType = models.EggType || model<EggTypeDocument>('EggType', EggTypeSchema);
