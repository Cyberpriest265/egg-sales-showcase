import {describe, it, expect} from "vitest";
import {parseDateParam} from "@/lib/dateParam";

describe("parseDateParam", () => {
    it("return a Date for a real calendar day", () =>{
        const d = parseDateParam("2026-09-16");
        expect(d?.getFullYear()).toBe(2026);
        expect(d?.getMonth()).toBe(8);
        expect(d?.getDate()).toBe(16);
    })

    it("accepts a leap day", () => {
        expect(parseDateParam("2024-02-29")).not.toBeNull();
    });

    it("rejects impossible months", () => {
        expect(parseDateParam("2026-99-99")).toBeNull();
    });

    it("rejects impossible days", () => {
        expect(parseDateParam("2026-04-31")).toBeNull();
    });

    it("rejects non-date strings", () => {
        expect(parseDateParam("abc")).toBeNull();
    });

    it("rejects null", () => {
        expect(parseDateParam(null)).toBeNull();
    });
});