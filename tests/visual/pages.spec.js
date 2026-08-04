import { test, expect } from "@playwright/test";

const pages = [
	{ name: "home", path: "/" },
	{ name: "blog-index", path: "/blog/" },
	{ name: "post-moving-to-typst", path: "/blog/2025-11-11-moving-to-typst/" },
	{ name: "404", path: "/404.html" },
];

for (const { name, path } of pages) {
	test(name, async ({ page }) => {
		await page.goto(path, { waitUntil: "networkidle" });
		await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
	});
}
