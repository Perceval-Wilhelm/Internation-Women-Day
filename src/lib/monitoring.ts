type MonitoringEvent = { type: string; url: string };

// Card paths carry the recipient's name; analytics only ever learns the route.
const NAME_PATH = /^\/(for|gui)\/[^/]+/;

export function prepareMonitoringEvent<T extends MonitoringEvent>(event: T): T | null {
  // Hobby uses page views and performance only; never forward custom events.
  if (event.type !== "pageview" && event.type !== "vital") return null;
  // Automated browsers, our own production smoke checks included, are not readers.
  if (typeof navigator !== "undefined" && navigator.webdriver) return null;

  try {
    const url = new URL(event.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.search = "";
    url.hash = "";
    url.username = "";
    url.password = "";
    url.pathname = url.pathname.replace(NAME_PATH, "/$1/[name]");
    return { ...event, url: url.toString() };
  } catch {
    return null;
  }
}
