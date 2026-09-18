import { describe, it, expect } from "vitest";
import { escapeCSV } from "@/lib/csv";

describe("escapeCSV", () => {
    it("passes clean strings through unchanged", () => {
        expect(escapeCSV("hello")).toBe("hello");
    });

    it("passes clean numbers through unchanged", () => {
        expect(escapeCSV(42)).toBe("42");
    });

    it("double-quotes strings containing commas", () => {
        expect(escapeCSV("a,b")).toBe('"a,b"');
    });

    it("double-quotes strings containing quotes", () => {
        expect(escapeCSV('say "hi"')).toBe('"say ""hi"""');
    });

    it("double-quotes strings containing newlines", () => {
        expect(escapeCSV("line1\nline2")).toBe('"line1\nline2"');
    });
});