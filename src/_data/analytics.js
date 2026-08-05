export default {
	cloudflareToken:
		process.env.CONTEXT === "production"
			? process.env.CLOUDFLARE_ANALYTICS_TOKEN || null
			: null,
};
