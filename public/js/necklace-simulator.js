// Vanilla port of the React NecklaceSimulator. Registers a <necklace-simulator>
// custom element. Idempotent — the guard below lets the script tag appear once
// per shortcode invocation without redefining.
(() => {
	if (customElements.get('necklace-simulator')) return;

	const RADIUS = 100;
	const SVG_NS = 'http://www.w3.org/2000/svg';
	const ANIM_MS = 500;

	function computeVertices(bits, isUnfolded) {
		const n = bits.length;
		const spacing = n > 1 ? (RADIUS * 2) / (n - 1) : 0;
		return Array.from(bits, (bit, i) => {
			const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
			const foldedX = RADIUS * Math.cos(angle);
			const foldedY = RADIUS * Math.sin(angle);
			const unfoldedX = -RADIUS + spacing * i;
			return {
				foldedX, foldedY,
				unfoldedX, unfoldedY: 0,
				currentX: isUnfolded ? unfoldedX : foldedX,
				currentY: isUnfolded ? 0 : foldedY,
				fill: bit === '1' ? 'black' : 'white',
				stroke: i === 0 ? 'red' : 'black',
			};
		});
	}

	class NecklaceSimulator extends HTMLElement {
		connectedCallback() {
			this.bitString = this.getAttribute('bits') || '011001';
			this.isUnfolded = false;
			this.isAnimating = false;
			this.verts = computeVertices(this.bitString, this.isUnfolded);
			this._buildDom();
			this._syncDom();
		}

		_buildDom() {
			this.innerHTML = `
				<div class="d-flex flex-column align-items-center gap-3 p-3">
					<div class="d-flex align-items-center gap-2 flex-wrap justify-content-center">
						<label class="mb-0">Binary string:</label>
						<input type="text" pattern="[01]+" class="form-control form-control-sm font-monospace" style="width:8rem">
						<button type="button" class="btn btn-primary btn-sm" data-role="fold">Unfold</button>
						<button type="button" class="btn btn-success btn-sm" data-role="shunt">Shunt</button>
					</div>
					<svg width="300" height="300" viewBox="-110 -110 220 220">
						<path stroke="black" stroke-width="2" fill="none" style="transition: d ${ANIM_MS}ms ease-in-out" data-role="path"/>
						<g data-role="circles"></g>
					</svg>
				</div>
			`;
			this.$input = this.querySelector('input');
			this.$fold = this.querySelector('[data-role="fold"]');
			this.$shunt = this.querySelector('[data-role="shunt"]');
			this.$path = this.querySelector('[data-role="path"]');
			this.$circles = this.querySelector('[data-role="circles"]');
			this.$input.value = this.bitString;
			this.$input.addEventListener('input', (e) => this._onInput(e));
			this.$fold.addEventListener('click', () => this._toggleFold());
			this.$shunt.addEventListener('click', () => this._shunt());
		}

		_ensureCircleCount(n) {
			while (this.$circles.children.length < n) {
				const c = document.createElementNS(SVG_NS, 'circle');
				c.setAttribute('r', '8');
				c.setAttribute('stroke-width', '1');
				c.setAttribute('style', `transition: cx ${ANIM_MS}ms ease-in-out, cy ${ANIM_MS}ms ease-in-out`);
				this.$circles.appendChild(c);
			}
			while (this.$circles.children.length > n) {
				this.$circles.removeChild(this.$circles.lastChild);
			}
		}

		_pathData() {
			return this.verts
				.map((v, i) => `${i === 0 ? 'M' : 'L'} ${v.currentX} ${v.currentY}`)
				.join(' ') + ' Z';
		}

		_syncDom() {
			this._ensureCircleCount(this.verts.length);
			this.$path.setAttribute('d', this._pathData());
			this.$circles.querySelectorAll('circle').forEach((c, i) => {
				const v = this.verts[i];
				c.setAttribute('cx', v.currentX);
				c.setAttribute('cy', v.currentY);
				c.setAttribute('fill', v.fill);
				c.setAttribute('stroke', v.stroke);
			});
		}

		_onInput(e) {
			const v = e.target.value;
			if (!/^[01]*$/.test(v)) {
				e.target.value = this.bitString;
				return;
			}
			this.bitString = v;
			this.verts = computeVertices(this.bitString, this.isUnfolded);
			this._syncDom();
		}

		_toggleFold() {
			if (this.isAnimating) return;
			this.isUnfolded = !this.isUnfolded;
			this.$fold.textContent = this.isUnfolded ? 'Fold' : 'Unfold';
			this.verts = this.verts.map((v) => ({
				...v,
				currentX: this.isUnfolded ? v.unfoldedX : v.foldedX,
				currentY: this.isUnfolded ? v.unfoldedY : v.foldedY,
			}));
			this._syncDom();
		}

		// Shunt: rotate the bit string left by one. Each DOM circle keeps its fill
		// but slides to the previous vertex's position, so the necklace visually
		// rotates while the label updates to the new equivalent representation.
		_shunt() {
			if (this.isAnimating) return;
			this.isAnimating = true;
			const n = this.verts.length;
			const shifted = this.verts.map((v, i) => {
				const src = this.verts[(i - 1 + n) % n];
				return {
					...v,
					foldedX: src.foldedX, foldedY: src.foldedY,
					unfoldedX: src.unfoldedX,
					currentX: this.isUnfolded ? src.unfoldedX : src.foldedX,
					currentY: this.isUnfolded ? 0 : src.foldedY,
					stroke: src.stroke,
				};
			});
			this.verts = shifted;
			this.bitString = this.bitString.slice(1) + this.bitString[0];
			this.$input.value = this.bitString;
			this._syncDom();
			setTimeout(() => { this.isAnimating = false; }, ANIM_MS);
		}
	}

	customElements.define('necklace-simulator', NecklaceSimulator);
})();
