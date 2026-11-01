import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prepareMonitoringEvent } from "@/lib/monitoring";
import { SiteMonitoring } from "./site-monitoring";

const sdk = vi.hoisted(() => ({ analytics: vi.fn(() => null), speed: vi.fn(() => null) }));
vi.mock("@vercel/analytics/next", () => ({ Analytics: sdk.analytics }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: sdk.speed }));

beforeEach(() => vi.clearAllMocks());

describe("site monitoring", () => {
  it("does not mount monitoring SDKs when disabled for local and preview builds", () => {
    render(<SiteMonitoring enabled={false} />);
    expect(sdk.analytics).not.toHaveBeenCalled();
    expect(sdk.speed).not.toHaveBeenCalled();
  });

  it("connects the privacy filter to both SDKs without debug output", () => {
    render(<SiteMonitoring enabled />);
    for (const mock of [sdk.analytics, sdk.speed]) {
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({ beforeSend: prepareMonitoringEvent, debug: false }),
        undefined,
      );
    }
  });

  it.each(["pageview", "vital"])("keeps the card out of %s events without mutating the source", (type) => {
    const event = {
      type,
      url: "https://name:password@example.test/gui/M%E1%BA%B9%20y%C3%AAu?utm=chat#msg=Con%20y%C3%AAu%20m%E1%BA%B9&from=Th%E1%BB%8Bnh",
    };
    expect(prepareMonitoringEvent(event)).toEqual({ ...event, url: "https://example.test/gui/[name]" });
    expect(event.url).toContain("from=");
  });

  it("reports English card pages by route and leaves other pages alone", () => {
    expect(prepareMonitoringEvent({ type: "pageview", url: "https://example.test/for/Lan" })?.url).toBe(
      "https://example.test/for/[name]",
    );
    expect(prepareMonitoringEvent({ type: "pageview", url: "https://example.test/" })?.url).toBe(
      "https://example.test/",
    );
  });

  it("drops events from automated browsers such as the production smoke checks", () => {
    Object.defineProperty(navigator, "webdriver", { value: true, configurable: true });
    try {
      expect(prepareMonitoringEvent({ type: "pageview", url: "https://example.test/" })).toBeNull();
    } finally {
      Reflect.deleteProperty(navigator, "webdriver");
    }
    expect(prepareMonitoringEvent({ type: "pageview", url: "https://example.test/" })).not.toBeNull();
  });

  it("drops custom events even if another caller adds one later", () => {
    expect(prepareMonitoringEvent({ type: "event", url: "https://example.test/" })).toBeNull();
  });

  it.each(["not a URL", "javascript:alert(1)"])("drops invalid monitoring URLs: %s", (url) => {
    expect(prepareMonitoringEvent({ type: "pageview", url })).toBeNull();
  });
});
