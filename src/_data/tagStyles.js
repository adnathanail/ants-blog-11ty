import { z } from "zod";

// Maps tag → style
// - keys are canonical capitalization
// - `color` is a Bootstrap color variant, which templates use to build
//   `bg-{color}-subtle`, `border-{color}`, `text-bg-{color}` etc.
// - `icon` is a Bootstrap Icons name minus the `bi-` prefix
// - `solid` fills the badge (`text-bg-{color}`) instead of the default subtle
//   tint with a matching border
const styles = {
	Draft: { color: "danger", icon: "cone-striped", solid: true },
	Coding: { color: "primary", icon: "laptop-fill", solid: false },
	Project: { color: "secondary", icon: "box2-heart-fill", solid: false },
	Prose: { color: "info", icon: "pen-fill", solid: false },
	Theory: { color: "danger", icon: "calculator-fill", solid: false },
	Tooling: { color: "warning", icon: "tools", solid: false },
	Quantum: { color: "fun", icon: "gem", solid: false },
};

// Bootstrap theme (+custom) colors that ship both `bg-{color}-subtle` and `border-{color}` utilities
const styleSchema = z.object({
	color: z.enum(["primary", "secondary", "success", "danger", "warning", "info", "light", "dark", "fun"]),
	icon: z.string().min(1),
	solid: z.boolean(),
}).strict();

export default function() {
	return Object.fromEntries(Object.entries(styles).map(([label, style]) => {
		const result = styleSchema.safeParse(style);
		if (!result.success) {
			throw new Error(`Invalid style for tag "${label}" in _data/tagStyles.js: ${z.prettifyError(result.error)}`);
		}
		return [label.toLowerCase(), { label, ...style }];
	}));
}
