import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Fictional cards only. @smoke tests also run against production after each deploy, so they stay read-only.
test.use({ locale: "en-GB" });

// Test visits are not readers: an empty script keeps them out of production analytics.
test.beforeEach(async ({ page }) => {
  await page.route(/\/_vercel\/(insights|speed-insights)\/script\.js$/, (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
  );
});

const CARD = "/for/Lan#msg=Thank%20you%20for%20everything&from=An&f=rose";
const VI_CARD = "/gui/M%E1%BA%B9%20y%C3%AAu#msg=Con%20y%C3%AAu%20m%E1%BA%B9&from=Th%E1%BB%8Bnh";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function openEnvelope(page: Page) {
  const envelope = page.getByRole("dialog");
  await expect(envelope).toBeVisible();
  await envelope.getByRole("button").click();
  await expect(envelope).toBeHidden();
}

async function axe(page: Page) {
  // Bring every section in so contrast is checked on what readers actually see
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in")));
  return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
}

test.describe("the page", () => {
  test("blooms in English and remembers a switch to Vietnamese @smoke", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Happy Women's Day" })).toBeVisible();
    await expect(page.locator("html")).not.toHaveClass(/not-loaded/, { timeout: 6_000 });

    await page.getByRole("button", { name: "VI Tiếng Việt" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Chúc mừng ngày 8/3" })).toBeVisible();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.getByRole("button", { name: "VI Tiếng Việt" })).toHaveAttribute("aria-pressed", "true");

    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    expect(errors).toEqual([]);
  });

  test("sends security headers @smoke", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-build"]).toBeTruthy();
  });

  test("meets WCAG 2.2 AA", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/not-loaded/);
    expect((await axe(page)).violations).toEqual([]);
  });

  test("answers unknown pages with a 404", async ({ page }) => {
    const response = await page.goto("/no-such-bloom");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This flower hasn't bloomed yet" })).toBeVisible();
  });
});

test.describe("a card", () => {
  test("arrives sealed, opens, and offers a reply @smoke", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(CARD);
    await expect(page).toHaveTitle("For Lan · Happy Women's Day 💐");
    await expect(page.getByRole("dialog", { name: "For Lan" })).toContainText("from An");
    await openEnvelope(page);

    await expect(page.locator(".hero")).toHaveClass(/theme-rose/);
    await expect(page.locator(".card__msg")).toHaveText("Thank you for everything");
    await expect(page.locator(".card__from")).toHaveText("— An");

    await page.getByRole("button", { name: "Send a bloom back to An" }).click();
    const composer = page.getByRole("dialog", { name: "Send a bloom" });
    await expect(composer.getByRole("textbox", { name: "To" })).toHaveValue("An");
    expect(errors).toEqual([]);
  });

  test("opens in Vietnamese from a /gui/ link @smoke", async ({ page }) => {
    await page.goto(VI_CARD);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await openEnvelope(page);
    await expect(page.locator('.hero .eyebrow [lang="vi"]')).toHaveText("Gửi Mẹ yêu · 8/3");
    await expect(page.locator(".card__from")).toHaveText("— Thịnh");
  });

  test("still opens links shared before names moved into the path", async ({ page }) => {
    await page.goto("/#to=Lan&msg=Hi&lang=vi&f=aqua");
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await openEnvelope(page);
    await expect(page.locator(".hero")).toHaveClass(/theme-aqua/);
    await expect(page.locator(".card__msg")).toHaveText("Hi");
  });

  test("swaps the language in the path, keeping the message", async ({ page }) => {
    await page.goto(CARD);
    await openEnvelope(page);
    await page.getByRole("button", { name: "VI Tiếng Việt" }).click();
    await expect(page).toHaveURL(/\/gui\/Lan#msg=Thank/);
    await expect(page.locator('.hero .eyebrow [lang="vi"]')).toBeVisible();
    await expect(page.locator('.hero .eyebrow [lang="vi"]')).toHaveText("Gửi Lan · 8/3");
  });

  test("opens at once for readers who prefer less motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(CARD);
    await openEnvelope(page);
    await expect(page.locator(".card")).toBeFocused();
    expect((await axe(page)).violations).toEqual([]);
  });

  test("previews the name, never the message @smoke", async ({ page, request }) => {
    await page.goto(CARD);
    const meta = (property: string) => page.locator(`meta[property="${property}"]`).getAttribute("content");
    expect(await meta("og:title")).toBe("Lan, a bloom for you 💐");
    expect(await meta("og:description")).not.toContain("Thank you");
    expect(await meta("og:locale")).toBe("en_GB");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");

    const image = await request.get(new URL((await meta("og:image"))!).pathname);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");
  });
});

test.describe("the composer", () => {
  test("writes a card link and previews it as the recipient will see it", async ({ page, context, browserName }) => {
    if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByRole("button", { name: "Write a card" }).first().click();
    const composer = page.getByRole("dialog", { name: "Send a bloom" });
    await composer.getByRole("textbox", { name: "To" }).fill("Lan Anh");
    await composer.getByRole("button", { name: "For a friend" }).click();
    await composer.getByRole("textbox", { name: "From" }).fill("Thịnh");
    await composer.locator("label", { hasText: "Mimosa" }).click();

    await expect(page.locator(".hero")).toHaveClass(/theme-mimosa/);
    const link = composer.getByRole("textbox", { name: "Card link · Link thiệp" });
    await expect(link).toHaveValue(/\/for\/Lan%20Anh#msg=To\+the\+friend.*&from=Th%E1%BB%8Bnh&f=mimosa$/);

    await composer.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByRole("status")).toHaveText("Link copied. Send it with love 💜");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await link.inputValue());

    await composer.getByRole("button", { name: "Preview" }).click();
    await expect(page.getByRole("dialog", { name: "For Lan Anh" })).toBeVisible();
    await openEnvelope(page);
    await expect(page.locator(".card__msg")).toContainText("keep being you");
  });
});
