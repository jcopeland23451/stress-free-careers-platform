import { describe, it, expect } from "vitest";
import { cn, formatPay, slugify, initials } from "@/lib/utils";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves tailwind conflicts — later class wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes via objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("handles arrays", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", undefined, null, false, "b")).toBe("a b");
  });

  it("returns empty string with no args", () => {
    expect(cn()).toBe("");
  });
});

describe("formatPay — HOURLY", () => {
  it("formats a range with en-dash and /hr suffix", () => {
    expect(formatPay("HOURLY", 32, 48)).toBe("$32.00–$48.00/hr");
  });

  it("formats a single value when min === max", () => {
    expect(formatPay("HOURLY", 25, 25)).toBe("$25.00/hr");
  });

  it("uses two decimal places", () => {
    expect(formatPay("HOURLY", 18.5, 21.75)).toBe("$18.50–$21.75/hr");
  });
});

describe("formatPay — SALARY", () => {
  it("formats a range divided by 1000 with /yr suffix", () => {
    expect(formatPay("SALARY", 80000, 110000)).toBe("$80k–$110k/yr");
  });

  it("formats a single value when min === max", () => {
    expect(formatPay("SALARY", 95000, 95000)).toBe("$95k/yr");
  });

  it("uses zero decimal places for salary", () => {
    expect(formatPay("SALARY", 75000, 100000)).toBe("$75k–$100k/yr");
  });
});

describe("slugify", () => {
  it("lowercases input", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("auto care technician")).toBe("auto-care-technician");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("C++ Developer")).toBe("c-developer");
  });

  it("collapses multiple non-alphanumeric chars into a single hyphen", () => {
    expect(slugify("foo  --  bar")).toBe("foo-bar");
  });

  it("trims leading hyphens", () => {
    expect(slugify("-leading")).toBe("leading");
  });

  it("trims trailing hyphens", () => {
    expect(slugify("trailing-")).toBe("trailing");
  });

  it("handles a plain alphanumeric string unchanged (lowercased)", () => {
    expect(slugify("abc123")).toBe("abc123");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("initials", () => {
  it("returns up to 2 uppercase initials", () => {
    expect(initials("John Doe")).toBe("JD");
  });

  it("uses only the first 2 words when there are more", () => {
    expect(initials("Mary Jo Smith")).toBe("MJ");
  });

  it("returns a single initial for a single-word name", () => {
    expect(initials("Alice")).toBe("A");
  });

  it("uppercases lowercase input", () => {
    expect(initials("jane doe")).toBe("JD");
  });

  it("handles extra spaces gracefully", () => {
    // split(" ") on "John  Doe" gives ["John","","Doe"]; filter(Boolean) removes ""
    expect(initials("John  Doe")).toBe("JD");
  });
});
