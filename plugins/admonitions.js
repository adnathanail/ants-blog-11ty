import admonitionPlugin from 'markdown-it-admonitions';

const admonitionTypeColors = {
	note: 'dark',
	tip: 'success',
	info: 'info',
	warning: 'warning',
	danger: 'danger',
};

const admonitionTypeBootstrapIcons = {
	note: 'sticky',
	tip: 'lightbulb',
	info: 'info-circle',
	warning: 'exclamation-diamond',
	danger: 'radioactive',
}

const makeCardRenderer = (type, mdLib) => {
	const color = admonitionTypeColors[type];
	const icon = admonitionTypeBootstrapIcons[type];
	const typeText = type.charAt(0).toUpperCase() + type.slice(1);
	return {
		open: (tokens, idx, options, env, slf) => {
			const token = tokens[idx];
			const title = token.info.trim().slice(type.length).trim();
			token.attrJoin('class', `card card-admonition card-admonition-${type} border-top-0 border-end-0 border-bottom-0 border-5 border-${color} mb-3 bg-${color}-subtle`);
			const header = title
				? `<div class="card-header bg-transparent border-0 pb-0">
							<h6 class="mb-0 fst-italic" data-ha-exclude>
								${mdLib.utils.escapeHtml(title)}
							</h6>
						</div>`
				: '';
			// Disabling type icon labels for now
			// const typeIconLabel = `<span class="rotated-text-container"><span class="rotated-text">${typeText}</span></span>`;
			const typeIconLabel = "";
			return `${slf.renderToken(tokens, idx, options)}
				<div class="row g-0">
					<div class="col-auto d-flex align-items-center ms-1 py-2">
						${typeIconLabel}
						<i class="bi bi-${icon} fs-2 ms-2"></i>
					</div>
					<div class="col d-flex align-items-center">
						<div>
							${header}
							<div class="card-body pb-0 pt-2">`;
		},
		close: (tokens, idx, options, env, slf) => {
			return `</div></div></div></div>${slf.renderToken(tokens, idx, options)}`;
		},
	};
};

export default function admonitions(mdLib) {
	const types = Object.keys(admonitionTypeColors);
	return mdLib.use(admonitionPlugin, {
		types,
		customRenders: Object.fromEntries(
			types.map((type) => [type, makeCardRenderer(type, mdLib)])
		),
	});
}
