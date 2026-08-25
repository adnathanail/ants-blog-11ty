// Vanilla port of the React NecklaceSimulator. Registers a <necklace-simulator>
// custom element. Idempotent — the guard below lets the script tag appear once
// per shortcode invocation without redefining.
(() => {
	if (customElements.get('necklace-simulator')) return;

	const RADIUS = 100;
	const SVG_NS = 'http://www.w3.org/2000/svg';
	const ANIM_MS = 700;
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	const easeInOut = (t) =>
		t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

	// Bead positions for a given fold parameter: 1 is the closed n-gon, 0 the
	// straight line. The chain is treated as inextensible — every joint turns
	// through the same angle, so the n-1 links keep their length throughout and
	// only the clasp (the edge from the last bead back to the first) stretches
	// as it opens. Segment k therefore points along theta * (k + 1/2), which at
	// full fold reproduces the old circle positions exactly and at zero fold is
	// a horizontal run. The result is recentred on its centroid and scaled so
	// the outermost bead sits on the RADIUS circle, which zooms the necklace out
	// as it straightens rather than letting it grow out of the viewBox.
	function layout(n, fold) {
		const theta = (fold * 2 * Math.PI) / n;
		const pts = [{ x: 0, y: 0 }];
		for (let k = 0; k < n - 1; k++) {
			const a = theta * (k + 0.5);
			const p = pts[k];
			pts.push({ x: p.x + Math.cos(a), y: p.y + Math.sin(a) });
		}
		const cx = pts.reduce((s, p) => s + p.x, 0) / n;
		const cy = pts.reduce((s, p) => s + p.y, 0) / n;
		let max = 0;
		for (const p of pts) max = Math.max(max, Math.hypot(p.x - cx, p.y - cy));
		const scale = max > 0 ? RADIUS / max : 1;
		return pts.map((p) => ({ x: (p.x - cx) * scale, y: (p.y - cy) * scale }));
	}

	const fmt = (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
	const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

	class NecklaceSimulator extends HTMLElement {
		connectedCallback() {
			this.bits = this.getAttribute('bits') || '011001';
			this.fold = 1; // 1 = closed necklace, 0 = straight line
			this.shunt = null; // eased progress of a shunt, null when idle
			this.frame = null;
			this._buildDom();
			this._render();
		}

		disconnectedCallback() {
			this._cancel();
		}

		_buildDom() {
			this.innerHTML = `
				<div class="d-flex flex-column align-items-center gap-3 p-3">
					<div class="d-flex align-items-center gap-2 flex-wrap justify-content-center">
						<label class="mb-0">Binary string:</label>
						<input type="text" pattern="[01]+" class="form-control form-control-sm font-monospace" style="width:8rem">
						<button type="button" class="btn btn-primary btn-sm" data-role="fold">Unfold</button>
						<button type="button" class="btn btn-secondary btn-sm" data-role="shunt">Shunt</button>
					</div>
					<svg width="300" height="300" viewBox="-110 -110 220 220">
						<path stroke="black" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" data-role="chain"/>
						<path stroke="black" stroke-width="2" fill="none" stroke-linecap="round" data-role="clasp"/>
						<g data-role="circles"></g>
						<circle r="8" stroke-width="2" fill="none" stroke="var(--bs-primary)" data-role="marker"/>
					</svg>
				</div>
			`;
			this.$input = this.querySelector('input');
			this.$fold = this.querySelector('[data-role="fold"]');
			this.$shunt = this.querySelector('[data-role="shunt"]');
			this.$chain = this.querySelector('[data-role="chain"]');
			this.$clasp = this.querySelector('[data-role="clasp"]');
			this.$circles = this.querySelector('[data-role="circles"]');
			this.$marker = this.querySelector('[data-role="marker"]');
			this.$input.value = this.bits;
			this.$input.addEventListener('input', (e) => this._onInput(e));
			this.$fold.addEventListener('click', () => this._toggleFold());
			this.$shunt.addEventListener('click', () => this._shunt());
		}

		_ensureCircleCount(n) {
			while (this.$circles.children.length < n) {
				const c = document.createElementNS(SVG_NS, 'circle');
				c.setAttribute('r', '8');
				c.setAttribute('stroke-width', '2');
				this.$circles.appendChild(c);
			}
			while (this.$circles.children.length > n) {
				this.$circles.removeChild(this.$circles.lastChild);
			}
		}

		// Drives `step` with an eased 0→1 parameter on every frame, redrawing as
		// it goes, then settles the state with `done`.
		_animate(step, done) {
			if (reduceMotion.matches) {
				step(1);
				done();
				this._render();
				return;
			}
			const start = performance.now();
			const tick = (now) => {
				const t = Math.min(1, (now - start) / ANIM_MS);
				step(easeInOut(t));
				if (t < 1) {
					this._render();
					this.frame = requestAnimationFrame(tick);
				} else {
					this.frame = null;
					done();
					this._render();
				}
			};
			this.frame = requestAnimationFrame(tick);
		}

		_cancel() {
			if (this.frame === null) return;
			cancelAnimationFrame(this.frame);
			this.frame = null;
			this.shunt = null;
			this.fold = Math.round(this.fold);
		}

		// Where each bead sits right now, plus where the ring marking the start of
		// the reading frame goes: the canonical slots for the current fold,
		// displaced by a shunt in progress. Idle, the ring is simply over the
		// first bead.
		_frame() {
			const n = this.bits.length;
			const slots = layout(n, this.fold);
			const e = this.shunt;
			if (e === null || n < 2) return { pos: slots, marker: slots[0] };
			if (this.fold === 1) {
				// Folded, a shunt is a rigid rotation of the whole necklace by one
				// slot. The ring goes to meet the bead it is about to hold: it runs
				// along the edge joining the two — an edge that is itself turning
				// under it, so interpolating between the beads' current positions
				// keeps it on the drawn line — reaching that bead halfway through,
				// and from there it simply is that bead, riding round to the top.
				const a = (-e * 2 * Math.PI) / n;
				const c = Math.cos(a);
				const s = Math.sin(a);
				const pos = slots.map((p) => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c }));
				return { pos, marker: lerp(pos[0], pos[1], Math.min(1, 2 * e)) };
			}
			// Unfolded there is nothing to rotate about, so each bead slides to its
			// neighbour's slot and the first bead runs the length of the string to
			// the far end. The ring makes the same trip out as it does folded, but
			// the line it travels along is not itself moving, so it reaches out from
			// the front slot rather than from the bead that is leaving it.
			const pos = slots.map((p, i) => lerp(p, slots[(i - 1 + n) % n], e));
			return { pos, marker: lerp(slots[0], pos[1], Math.min(1, 2 * e)) };
		}

		_render() {
			const n = this.bits.length;
			this._ensureCircleCount(n);
			if (n === 0) {
				this.$chain.setAttribute('d', '');
				this.$clasp.setAttribute('d', '');
				this.$marker.setAttribute('visibility', 'hidden');
				return;
			}
			const { pos, marker } = this._frame();
			this.$chain.setAttribute(
				'd',
				pos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${fmt(p)}`).join(' ')
			);
			// The clasp stretches right across the string once open, so fade it
			// out early — squaring makes it all but gone by the halfway point.
			this.$clasp.setAttribute('d', n > 1 ? `M ${fmt(pos[n - 1])} L ${fmt(pos[0])}` : '');
			this.$clasp.setAttribute('stroke-opacity', (this.fold * this.fold).toFixed(3));
			this.$circles.querySelectorAll('circle').forEach((c, i) => {
				c.setAttribute('cx', pos[i].x.toFixed(2));
				c.setAttribute('cy', pos[i].y.toFixed(2));
				c.setAttribute('fill', this.bits[i] === '1' ? 'black' : 'white');
				c.setAttribute('stroke', 'black');
			});
			// The ring is its own element drawn over the beads, so it can move
			// independently of them. Same radius and width as a bead outline, so at
			// rest it covers the outline of whichever bead it sits on.
			this.$marker.setAttribute('visibility', 'visible');
			this.$marker.setAttribute('cx', marker.x.toFixed(2));
			this.$marker.setAttribute('cy', marker.y.toFixed(2));
		}

		_onInput(e) {
			const v = e.target.value;
			if (!/^[01]*$/.test(v)) {
				e.target.value = this.bits;
				return;
			}
			this._cancel();
			this.bits = v;
			this._render();
		}

		_toggleFold() {
			if (this.frame !== null) return;
			const from = this.fold;
			const to = from === 1 ? 0 : 1;
			this.$fold.textContent = to === 1 ? 'Unfold' : 'Fold';
			this._animate(
				(e) => { this.fold = from + (to - from) * e; },
				() => { this.fold = to; }
			);
		}

		// Shunt: rotate the bit string left by one. Each bead keeps its fill but
		// moves to the previous slot, so the necklace visually rotates while the
		// label updates to the new equivalent representation.
		_shunt() {
			if (this.frame !== null || this.bits.length < 2) return;
			this.shunt = 0;
			this._animate(
				(e) => { this.shunt = e; },
				() => {
					this.shunt = null;
					this.bits = this.bits.slice(1) + this.bits[0];
					this.$input.value = this.bits;
				}
			);
		}
	}

	customElements.define('necklace-simulator', NecklaceSimulator);
})();
