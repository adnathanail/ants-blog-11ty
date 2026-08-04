// Map tag → Bootstrap color variant. Templates use these to build
// `bg-{color}-subtle`, `border-{color}`, `text-bg-{color}` etc.
// Any tag not listed here falls back to `default`.
export default function() {
	return {
		draft: "warning",
		default: "primary",
	};
}
