import admonitionPlugin from 'markdown-it-admonitions';

const admonitionTypeColors = {
	note: 'dark',
	tip: 'success',
	info: 'info',
	warning: 'warning',
	danger: 'danger',
	question: 'primary',
};

const admonitionTypeBootstrapIcons = {
	note: 'sticky',
	tip: 'lightbulb',
	info: 'info-circle',
	warning: 'exclamation-diamond',
	danger: 'radioactive',
	question: 'question-circle',
}

function cardShellClasses(color) {
	return `card border-top-0 border-end-0 border-bottom-0 border-5 border-${color} mb-3 bg-${color}-subtle`;
}

function renderCardShellOpen({ tokens, idx, options, slf, icon, header = '' }) {
	return `${slf.renderToken(tokens, idx, options)}
		<div class="row g-0">
			<div class="col-auto d-flex align-items-center ms-1 py-2">
				<i class="bi bi-${icon} fs-2 ms-2"></i>
			</div>
			<div class="col d-flex align-items-center">
				<div>
					${header}
					<div class="card-body pb-0 pt-2">`;
}

function renderCardShellClose({ tokens, idx, options, slf }) {
	return `</div></div></div></div>${slf.renderToken(tokens, idx, options)}`;
}

const makeCardRenderer = (type, mdLib) => {
	const color = admonitionTypeColors[type];
	const icon = admonitionTypeBootstrapIcons[type];
	return {
		open: (tokens, idx, options, env, slf) => {
			const token = tokens[idx];
			const title = token.info.trim().slice(type.length).trim();
			token.attrJoin('class', `${cardShellClasses(color)} card-admonition card-admonition-${type}`);
			const header = title
				? `<div class="card-header bg-transparent border-0 pb-0">
							<h6 class="mb-0 fst-italic" data-ha-exclude>
								${mdLib.utils.escapeHtml(title)}
							</h6>
						</div>`
				: '';
			return renderCardShellOpen({ tokens, idx, options, slf, icon, header });
		},
		close: (tokens, idx, options, env, slf) => renderCardShellClose({ tokens, idx, options, slf }),
	};
};

export default function admonitions(mdLib) {
	const types = Object.keys(admonitionTypeColors);
	mdLib.use(admonitionPlugin, {
		types,
		customRenders: Object.fromEntries(
			types.map((type) => [type, makeCardRenderer(type, mdLib)])
		),
	});

	mdLib.renderer.rules.blockquote_open = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		token.attrJoin('class', `${cardShellClasses('dark')} card-blockquote fst-italic`);
		return renderCardShellOpen({ tokens, idx, options, slf, icon: 'quote' });
	};
	mdLib.renderer.rules.blockquote_close = (tokens, idx, options, env, slf) => {
		return renderCardShellClose({ tokens, idx, options, slf });
	};

	return mdLib;
}
