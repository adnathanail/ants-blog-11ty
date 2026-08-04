import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/visual",
	snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}",
	fullyParallel: true,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		baseURL: "http://localhost:8080",
	},
	projects: [
		{
			name: "desktop",
			use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
		},
		{
			name: "mobile",
			use: { ...devices["Pixel 5"] },
		},
	],
	webServer: {
		command: "npm run build && python3 -m http.server 8080 --directory _site",
		url: "http://localhost:8080",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
	expect: {
		timeout: 15_000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01,
			animations: "disabled",
		},
	},
});
