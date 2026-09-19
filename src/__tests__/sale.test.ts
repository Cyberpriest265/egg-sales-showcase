import { describe, it, expect } from "vitest"
import { Types } from "mongoose";
import { Sale } from "@/models/Sale";


const eggTypeId = new Types.ObjectId();

describe("Sale moodel rules", () => {
    it("computes amountOwed = saleTotal - amountPaid", async () => {
        const sale = new Sale({
            eggTypeId,
            quantity: 10,
            saleTotal: 100,
            amountPaid: 40,
            amountOwed: 60,
            customerName: "Hajia",
            date: new Date(),
        });

        await sale.validate();
        
        expect(sale.amountOwed).toBe(60);
    });

    it("blocks overpayment (amountPaid > saleTotal)", async () => {
    const sale = new Sale({
        eggTypeId,
        quantity: 10,
        saleTotal: 100,
        amountPaid: 200,
        amountOwed: 100,
        date: new Date(),
    });

    await expect(sale.validate()).rejects.toThrow("amountPaid cannot exceed saleTotal");
    });

    it("requires customerName when the amount is owed", async () => {
        const sale = new Sale({
            eggTypeId,
            quantity: 10,
            saleTotal: 100,
            amountPaid: 40,
            amountOwed: 60,
            date: new Date(),
        });

        await expect(sale.validate()).rejects.toThrow(
            "customerName is required when there is an outstanding amount"
        );
    });

    it("accepts a full payment with no customer", async () => {
        const sale = new Sale({
            eggTypeId,
            quantity: 10,
            saleTotal: 100,
            amountPaid: 100,
            amountOwed: 0,
            date: new Date(),
        });

        await sale.validate();

        expect(sale.amountOwed).toBe(0);
    });
});