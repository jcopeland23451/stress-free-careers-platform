import { describe, it, expect } from "vitest";
import { haversineMiles } from "@/lib/geo";

describe("haversineMiles", () => {
  it("returns 0 for the same point", () => {
    expect(haversineMiles(37.7749, -122.4194, 37.7749, -122.4194)).toBe(0);
  });

  it("SF → LA is approximately 347 miles (±15)", () => {
    const dist = haversineMiles(37.7749, -122.4194, 34.0522, -118.2437);
    expect(dist).toBeGreaterThan(347 - 15);
    expect(dist).toBeLessThan(347 + 15);
  });

  it("is symmetric — A→B equals B→A", () => {
    const ab = haversineMiles(37.7749, -122.4194, 34.0522, -118.2437);
    const ba = haversineMiles(34.0522, -118.2437, 37.7749, -122.4194);
    expect(ab).toBeCloseTo(ba, 5);
  });

  it("returns a positive value for distinct points", () => {
    const dist = haversineMiles(32.7157, -117.1611, 38.5816, -121.4944);
    expect(dist).toBeGreaterThan(0);
  });

  it("small delta — nearby cities are < 50 miles apart", () => {
    // San Francisco → Oakland (~8 miles)
    const dist = haversineMiles(37.7749, -122.4194, 37.8044, -122.2712);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(50);
  });
});
