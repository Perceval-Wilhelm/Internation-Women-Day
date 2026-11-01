import { describe, expect, it } from "vitest";
import { cardHref, LIMITS, nameFromSegment, parseCard, type Draft } from "./card";

// What a recipient's browser sees: the name from the path, everything else from the fragment.
function open(href: string) {
  const url = new URL(href, "https://example.test");
  const card = parseCard(url.hash);
  const [, route, segment] = url.pathname.split("/");
  return segment ? { ...card, to: nameFromSegment(segment), route } : { ...card, route: "" };
}

describe("card links", () => {
  it("carry a Vietnamese card through a /gui/ link", () => {
    const draft: Draft = {
      to: "Mẹ yêu",
      msg: "Con yêu mẹ nhiều lắm!\nChúc mẹ 8/3 thật vui 💐",
      from: "Thịnh",
      flower: "rose",
    };
    const href = cardHref({ ...draft, lang: "vi" });
    expect(href.startsWith("/gui/M%E1%BA%B9%20y%C3%AAu#")).toBe(true);
    expect(open(href)).toMatchObject({ ...draft, route: "gui" });
  });

  it("put English names under /for/ and keep the words out of the path", () => {
    const href = cardHref({ to: "Lan", msg: "Hi", from: "An", flower: "lilac", lang: "en" });
    expect(href).toBe("/for/Lan#msg=Hi&from=An");
  });

  it("make no link for an empty card", () => {
    expect(cardHref({ to: "  ", msg: "\n", from: "", flower: "mimosa", lang: "vi" })).toBe("/");
    expect(parseCard("")).toEqual({ to: "", from: "", msg: "", flower: "lilac", lang: "" });
  });

  it("keep names that cannot be path segments in the fragment", () => {
    const href = cardHref({ to: "..", msg: "", from: "", flower: "lilac", lang: "en" });
    expect(href).toBe("/#to=..&lang=en");
    expect(parseCard(new URL(href, "https://example.test").hash).to).toBe("..");
  });

  it("still open the fragment-only links shared before name paths existed", () => {
    expect(parseCard("#to=Lan&msg=Hi&lang=vi&f=aqua")).toEqual({
      to: "Lan",
      msg: "Hi",
      from: "",
      flower: "aqua",
      lang: "vi",
    });
  });
});

describe("card fields", () => {
  it("stay plain text and lose control and bidi-override characters", () => {
    const card = parseCard("#to=" + encodeURIComponent("<img src=x onerror=alert(1)>\u202E") + "&from=a%00b");
    expect(card.to).toBe("<img src=x onerror=alert(1)>");
    expect(card.from).toBe("ab");
    expect(nameFromSegment(encodeURIComponent("Lan\u202E\u0000"))).toBe("Lan");
  });

  it("are capped by character without splitting an emoji", () => {
    const card = parseCard("#msg=" + encodeURIComponent("💐".repeat(LIMITS.msg + 10)));
    expect(Array.from(card.msg)).toHaveLength(LIMITS.msg);
    expect(card.msg.endsWith("💐")).toBe(true);
    expect(Array.from(nameFromSegment(encodeURIComponent("a".repeat(99))))).toHaveLength(LIMITS.to);
  });

  it("fall back to the defaults for unknown flowers and languages", () => {
    const card = parseCard("#to=Lan&f=javascript:alert(1)&lang=xx");
    expect(card.flower).toBe("lilac");
    expect(card.lang).toBe("");
  });

  it("collapse names to one line and keep at most one blank line in messages", () => {
    const card = parseCard("#to=" + encodeURIComponent("Lan\n\nAnh") + "&msg=" + encodeURIComponent("a\n\n\n\nb"));
    expect(card.to).toBe("Lan Anh");
    expect(card.msg).toBe("a\n\nb");
  });

  it("survive malformed percent-escapes", () => {
    expect(parseCard("#to=%E0%A4%A&msg=%").to.length).toBeGreaterThan(0);
    expect(nameFromSegment("100%")).toBe("100%");
  });
});
