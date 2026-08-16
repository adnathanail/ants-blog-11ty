import { z } from "zod";

// Maps tag → style
// - keys are canonical capitalization
// - `color` is a Bootstrap color variant, which templates use to build
//   `bg-{color}-subtle`, `border-{color}`, `text-bg-{color}` etc.
// - `icon` is a Bootstrap Icons name minus the `bi-` prefix
const styles = {
	Draft: { color: "light", icon: "cone-striped" },
	Coding: { color: "primary", icon: "laptop-fill" },
	Project: { color: "secondary", icon: "box2-heart-fill" },
	Prose: { color: "info", icon: "pen-fill" },
	Theory: { color: "danger", icon: "calculator-fill" },
	Tooling: { color: "warning", icon: "tools" },
};

// Bootstrap theme colors that ship both `bg-{color}-subtle` and `border-{color}` utilities
const styleSchema = z.object({
	color: z.enum(["primary", "secondary", "success", "danger", "warning", "info", "light", "dark"]),
	icon: z.string().min(1),
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
