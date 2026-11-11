import { describe, expect, it } from "vitest";
import { TOOL_GROUPS, categoryHrefFor, tileHrefFor } from "@/app/(app)/dashboard/data";

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
        if (t.href.startsWith("/tools/"))
          expect(categoryHrefFor(t.href)).toBe(g.direct ? "/dashboard" : `/dashboard/${g.slug}`);
  });
});

describe("direct dashboard tiles", () => {
  it("the Formulary is its own tile that opens the tool, and is no longer under Reference", () => {
    const formulary = TOOL_GROUPS.find((g) => g.slug === "formulary")!;
    expect(formulary.direct).toBe(true);
    expect(tileHrefFor(formulary)).toBe("/tools/formulary");
    expect(categoryHrefFor("/tools/formulary")).toBe("/dashboard");
    const listed = TOOL_GROUPS.flatMap((g) => g.tools.filter((t) => t.href === "/tools/formulary").map(() => g.slug));
    expect(listed).toEqual(["formulary"]);
  });

  it("a direct tile holds exactly one tool; category tiles open their category page", () => {
    for (const g of TOOL_GROUPS) {
      if (g.direct) expect(g.tools).toHaveLength(1);
      else expect(tileHrefFor(g)).toBe(`/dashboard/${g.slug}`);
    }
  });
});
