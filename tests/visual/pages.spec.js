import { test, expect } from "@playwright/test";

const pages = [
	{ name: "home", path: "/" },
	{ name: "blog-index", path: "/blog/" },
	{ name: "post-hilbert-curve", path: "/blog/2022-05-01-hilbert-curve/" },
	{ name: "post-sock-pairing", path: "/blog/2024-02-24-sock-pairing/" },
	{ name: "post-advent-of-code-2024", path: "/blog/2024-12-26-advent-of-code-2024/" },
	{ name: "post-how-many-puzzle-pieces", path: "/blog/2025-01-08-how-many-puzzle-pieces/" },
	{ name: "post-moving-to-typst", path: "/blog/2025-11-11-moving-to-typst/" },
	{ name: "404", path: "/404.html" },
];

for (const { name, path } of pages) {
	test(name, async ({ page }) => {
		test.setTimeout(90_000);
		await page.goto(path);
		await page.evaluate(() => {
			for (const img of document.querySelectorAll('img[loading="lazy"]')) {
				img.loading = "eager";
			}
		});
		await page.waitForLoadState("networkidle");
		await page.evaluate(async () => {
			await document.fonts.ready;
			await Promise.all(
				Array.from(document.images).map(async (img) => {
					if (!img.complete) {
						await new Promise((resolve) => {
							img.addEventListener("load", resolve, { once: true });
							img.addEventListener("error", resolve, { once: true });
						});
					}
					try {
						await img.decode();
					} catch {}
				}),
			);
		});
		await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
	});
}
