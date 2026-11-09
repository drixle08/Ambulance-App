import { describe, expect, it } from "vitest";
import { TOOL_GROUPS, categoryHrefFor } from "@/app/(app)/dashboard/data";

describe("categoryHrefFor (tool header back target)", () => {
  it("maps a tool to its dashboard category", () => {
    expect(categoryHrefFor("/tools/burns")).toBe("/dashboard/trauma");
    expect(categoryHrefFor("/tools/ecmo-criteria")).toBe("/dashboard/resuscitation");
    expect(categoryHrefFor("/tools/toxicology")).toBe("/dashboard/toxicology");
  });

  it("ignores a trailing slash", () => {
    expect(categoryHrefFor("/tools/burns/")).toBe("/dashboard/trauma");
  });

  it("returns null for unknown or missing paths", () => {
    expect(categoryHrefFor("/tools/not-a-tool")).toBeNull();
    expect(categoryHrefFor(null)).toBeNull();
  });

  it("gives every listed in-app tool a category", () => {
    for (const g of TOOL_GROUPS)
      for (const t of g.tools)
        if (t.href.startsWith("/tools/")) expect(categoryHrefFor(t.href)).toBe(`/dashboard/${g.slug}`);
  });
});
