import { describe, expect, it } from "vitest";
import { parsePositiveId } from "./routeParams";

describe("route params", () => {
  it("accepts positive integer ids", () =>
    expect(parsePositiveId("123")).toBe(123));
  it("rejects malformed ids", () => {
    expect(parsePositiveId("abc")).toBeNull();
    expect(parsePositiveId("-1")).toBeNull();
    expect(parsePositiveId(undefined)).toBeNull();
  });
});
