// Map tag → style. `color` is a Bootstrap color variant, which templates use to
// build `bg-{color}-subtle`, `border-{color}`, `text-bg-{color}` etc. `icon` is
// optional, and is a Bootstrap Icons name minus the `bi-` prefix.
// Any tag not listed here falls back to `default`.
export default function() {
	return {
		draft: { color: "warning" },
		default: { color: "primary" },
		GitHub: { color: "dark", icon: "github" }
	};
}
