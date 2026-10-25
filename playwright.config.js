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
		// `python3 -m http.server`, with its listen backlog raised from socketserver's default
		// of 5. Parallel workers loading every image eagerly overflow that, and the dropped
		// connections surface as unstyled pages, unrevealed images, or ERR_CONNECTION_RESET.
		command:
			"npx @11ty/eleventy --output=_site_playwright && python3 -c \"" +
			"import functools, http.server as s; " +
			"s.ThreadingHTTPServer.request_queue_size = 128; " +
			"s.test(HandlerClass=functools.partial(s.SimpleHTTPRequestHandler, directory='_site_playwright'), " +
			"ServerClass=s.ThreadingHTTPServer, port=8080)\"",
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
