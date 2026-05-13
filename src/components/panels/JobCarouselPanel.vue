<style scoped>
/* ── Card root ─────────────────────────────────────────── */
.carousel-card {
	display: flex;
	flex-direction: column;
}

/* ── Tab bar ────────────────────────────────────────────── */
::v-deep .v-tabs {
	flex: none;
	width: 100%;
}
::v-deep .v-tabs-bar {
	height: 48px !important;
	min-height: 48px !important;
}

/* ── Body: segue il contenuto senza vincoli ─────────────── */
.carousel-body {
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
}

::v-deep .carousel-body .v-tabs-items {
	flex: 1 1 auto;
}

::v-deep .carousel-body .v-window-item {
	display: flex;
	flex-direction: column;
}

/* Chart.js richiede un'altezza minima per inizializzare il canvas */
::v-deep .carousel-body .v-window-item > .v-card {
	flex: 1 1 auto;
	min-height: 280px;
	width: 100%;
	box-shadow: none !important;
	border-radius: 0 !important;
}

/* pannello tool/speed: altezza automatica */
::v-deep .carousel-body .v-window-item > .tool-scroll {
	flex: 1 1 auto;
	width: 100%;
	box-shadow: none !important;
	border-radius: 0 !important;
}

/* titoli interni: compatti (il tab già identifica il contenuto) */
::v-deep .carousel-body .v-card-title {
	padding-top: 4px !important;
	padding-bottom: 4px !important;
	font-size: 0.85rem !important;
	min-height: 0 !important;
}

/* ── Slide Tool ─────────────────────────────────────────── */
.tool-scroll {
	overflow-y: auto;
}

/* ── Sezione Probe ──────────────────────────────────────── */
.probe-section-header {
	display: flex;
	align-items: center;
	padding: 4px 8px 2px;
	font-size: 0.72rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	opacity: 0.6;
	gap: 6px;
}
.probe-table {
	width: 100%;
	border-spacing: 0;
}
.probe-table td,
.probe-table th {
	text-align: center;
}
.probe-chip {
	display: inline-block;
	border-radius: 4px;
	min-width: 52px;
	padding: 2px 10px;
	font-weight: 700;
	font-size: 0.95rem;
	color: white !important;
}

/* ── Slide Speed + Encoder ──────────────────────────────── */
.encoder-section {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	border-top: 1px solid rgba(128,128,128,0.2);
	margin-top: 4px;
	padding-top: 4px;
}
.encoder-block {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 8px 12px;
	text-align: center;
}
.encoder-ring-wrap {
	position: relative;
	width: 140px;
	height: 140px;
}
.encoder-ring-svg {
	position: absolute;
	top: 0;
	left: 0;
}
.encoder-ring-text {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}
.encoder-pct {
	font-size: 1.3rem;
	font-weight: 700;
	line-height: 1;
}
.encoder-label {
	font-size: 0.85rem;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	opacity: 0.7;
	margin-top: 4px;
	font-weight: 600;
}
.speed-container {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
	align-items: stretch;
	padding: 4px 0;
}

.speed-block {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px 8px;
	text-align: center;
	border-right: 1px solid rgba(128, 128, 128, 0.18);
}

.speed-block:last-child {
	border-right: none;
}

.speed-block--clickable {
	cursor: pointer;
}

.speed-value {
	font-size: 2rem;
	font-weight: 700;
	line-height: 1.2;
	white-space: nowrap;
}

.speed-label {
	font-size: 0.72rem;
	text-transform: uppercase;
	letter-spacing: 0.07em;
	opacity: 0.75;
	margin-top: 8px;
	font-weight: 500;
}

.speed-empty {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	opacity: 0.5;
}

/* ── Sezione coordinate (tab Speed) ────────────────────── */
.coords-section {
	padding: 6px 4px 2px;
}
.coords-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around;
	row-gap: 4px;
}
.coord-cell {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 60px;
	padding: 2px 4px;
}
.coord-letter {
	font-size: 0.68rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	opacity: 0.55;
	line-height: 1.2;
}
.coord-value {
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.3;
	white-space: nowrap;
}
</style>

<template>
	<v-card class="carousel-card">
		<v-tabs v-model="activeTab" grow>
			<v-tab>
				<v-icon small class="mr-1">mdi-speedometer</v-icon>
				Speed
			</v-tab>
			<v-tab>
				<v-icon small class="mr-1">mdi-wrench</v-icon>
				Tool
			</v-tab>
			<v-tab>
				<v-icon small class="mr-1">mdi-chart-bar</v-icon>
				Layer
			</v-tab>
			<v-tab>
				<v-icon small class="mr-1">mdi-thermometer</v-icon>
				Temp
			</v-tab>
		</v-tabs>

		<div class="carousel-body">
			<v-tabs-items v-model="activeTab">

				<!-- Slide 1: Coordinate + Speed + Encoder -->
				<v-tab-item>
					<!-- Coordinate assi + estrusori -->
					<div v-if="visibleAxes.length > 0 || activeExtruders.length > 0" class="coords-section">
						<div class="coords-grid">
							<div v-for="(axis, i) in visibleAxes" :key="`ax-${i}`" class="coord-cell">
								<span class="coord-letter">{{ axis.letter }}</span>
								<span class="coord-value">{{ $displayAxisPosition(axis) }}</span>
							</div>
							<template v-if="activeExtruders.length > 0">
								<div v-for="ext in activeExtruders" :key="`ex-${ext.index}`" class="coord-cell">
									<span class="coord-letter">E{{ ext.index }}</span>
									<span class="coord-value">{{ $display(ext.position, 1) }}</span>
								</div>
							</template>
						</div>
					</div>

					<v-divider v-if="visibleAxes.length > 0 || activeExtruders.length > 0" class="my-1" />

					<!-- Velocità -->
					<div v-if="speedsAvailable || topSpeedAvailable || (extrusionAvailable && isFFForUnset)"
						 class="speed-container">
						<div v-if="speedsAvailable" class="speed-block">
							<div class="speed-value">{{ $displayMoveSpeed(model.move.currentMove.requestedSpeed) }}</div>
							<div class="speed-label">{{ $t("panel.status.requestedSpeed") }}</div>
						</div>
						<div v-if="topSpeedAvailable" class="speed-block">
							<div class="speed-value">{{ $displayMoveSpeed(model.move.currentMove.topSpeed) }}</div>
							<div class="speed-label">{{ $t("panel.status.topSpeed") }}</div>
						</div>
						<div v-if="extrusionAvailable && isFFForUnset"
							 class="speed-block speed-block--clickable"
							 @click="showVolumetric = !showVolumetric">
							<div class="speed-value">
								{{ showVolumetric ? $display(volumetricFlow, 1, 'mm³/s') : $displayMoveSpeed(model.move.currentMove.extrusionRate) }}
							</div>
							<div class="speed-label">
								{{ showVolumetric ? $t("panel.status.volumetricFlow") : $t("panel.status.extrusionRate") }}
							</div>
						</div>
					</div>

					<!-- Encoder filamento -->
					<div v-if="activeFilamentMonitors.length > 0" class="encoder-section">
						<div v-for="fm in activeFilamentMonitors" :key="fm.index" class="encoder-block">
							<div class="encoder-ring-wrap">
								<svg class="encoder-ring-svg" width="140" height="140" viewBox="0 0 140 140">
									<!-- Sfondo anello esterno: lastPercentage -->
									<circle cx="70" cy="70" r="62" fill="none"
											stroke="rgba(128,128,128,0.18)" stroke-width="10"/>
									<!-- Anello esterno: lastPercentage (verde/arancio/rosso) -->
									<circle cx="70" cy="70" r="62" fill="none"
											:stroke="encoderRingColor(fm.lastPercentage)"
											stroke-width="10"
											stroke-linecap="round"
											:stroke-dasharray="389.6"
											:stroke-dashoffset="encoderDashOffset(fm.lastPercentage)"
											transform="rotate(-90 70 70)"/>
									<!-- Sfondo anello interno: position (5px gap dall'anello esterno) -->
									<circle cx="70" cy="70" r="48" fill="none"
											stroke="rgba(128,128,128,0.18)" stroke-width="8"/>
									<!-- Anello interno: position 0–1023, solo visivo -->
									<circle cx="70" cy="70" r="48" fill="none"
											stroke="#42a5f5"
											stroke-width="8"
											stroke-linecap="round"
											:stroke-dasharray="301.6"
											:stroke-dashoffset="positionDashOffset(fm.position)"
											transform="rotate(-90 70 70)"/>
								</svg>
								<div class="encoder-ring-text">
									<span class="encoder-pct"
										  :style="{ color: encoderRingColor(fm.lastPercentage) }">
										{{ fm.lastPercentage !== null ? $display(fm.lastPercentage, 1, '%') : '—' }}
									</span>
								</div>
							</div>
							<div class="encoder-label">E{{ fm.index }}</div>
						</div>
					</div>
				</v-tab-item>

				<!-- Slide 2: Tool (riscaldatori + bed + camera) + Probe -->
				<v-tab-item>
					<div class="tool-scroll">
						<tools-panel />

						<!-- Probe -->
						<template v-if="validProbes.length > 0">
							<v-divider class="mt-1" />
							<div class="probe-section-header">
								<v-icon x-small>mdi-crosshairs</v-icon>
								Probe
							</div>
							<table class="probe-table">
								<colgroup>
									<col style="width: 30%">
									<col style="width: 25%">
									<col style="width: 22%">
									<col style="width: 23%">
								</colgroup>
								<thead>
									<tr>
										<th class="pl-2 caption grey--text"></th>
										<th class="caption grey--text">Val.</th>
										<th class="caption grey--text">Soglia</th>
										<th class="pr-2 caption grey--text">H trig.</th>
									</tr>
								</thead>
								<tbody>
									<template v-for="(item, i) in validProbes">
										<tr v-if="i > 0" :key="`pdiv-${i}`">
											<td colspan="4" class="pa-0"><v-divider /></td>
										</tr>
										<tr :key="`probe-${i}`">
											<th class="pl-2 py-2 text-center">
												<v-icon small class="mr-1">mdi-crosshairs</v-icon>
												P{{ item.index }}
											</th>
											<td class="py-2 text-center">
												<span class="probe-chip white--text" :class="probeChipClass(item.probe)">
													{{ formatProbeValues(item.probe.value) }}
												</span>
											</td>
											<td class="py-2 text-center caption">{{ item.probe.threshold }}</td>
											<td class="py-2 pr-2 text-center caption">{{ item.probe.triggerHeight }}</td>
										</tr>
									</template>
								</tbody>
							</table>
						</template>
					</div>
				</v-tab-item>

				<!-- Slide 3: Layer chart -->
				<v-tab-item eager>
					<layer-chart />
				</v-tab-item>

				<!-- Slide 4: Temperature chart -->
				<v-tab-item eager>
					<temperature-chart />
				</v-tab-item>

			</v-tabs-items>
		</div>
	</v-card>
</template>

<script lang="ts">
import ObjectModel, { Axis, MachineMode, Probe, ProbeType } from "@duet3d/objectmodel";
import Vue from "vue";

import store from "@/store";
import { DashboardMode } from "@/store/settings";

export default Vue.extend({
	computed: {
		model(): ObjectModel { return store.state.machine.model; },
		isFFForUnset(): boolean {
			if (store.state.settings.dashboardMode === DashboardMode.default) {
				return !this.model.state.machineMode || this.model.state.machineMode === MachineMode.fff;
			}
			return store.state.settings.dashboardMode === DashboardMode.fff;
		},
		speedsAvailable(): boolean { return isFinite(this.model.move.currentMove.requestedSpeed); },
		topSpeedAvailable(): boolean { return isFinite(this.model.move.currentMove.topSpeed); },
		extrusionAvailable(): boolean { return isFinite(this.model.move.currentMove.extrusionRate); },
		activeFilamentMonitors(): Array<{ index: number; position: number; lastPercentage: number | null }> {
			return this.model.sensors.filamentMonitors
				.map((m, i) => ({ m, i }))
				.filter(({ m }) => m !== null && isFinite((m as any).position))
				.map(({ m, i }) => ({
					index: i,
					position: (m as any).position as number,
					lastPercentage: (m as any).lastPercentage as number | null
				}));
		},
		hasSpeedOrEncoderData(): boolean {
			return this.speedsAvailable || this.topSpeedAvailable ||
				(this.extrusionAvailable && this.isFFForUnset) ||
				this.activeFilamentMonitors.length > 0;
		},
		visibleAxes(): Array<Axis> {
			return this.model.move.axes.filter((axis: Axis) => axis.visible);
		},
		activeExtruders(): Array<{ index: number; position: number }> {
			return this.model.move.extruders
				.map((e, i) => ({ e, i }))
				.filter(({ e }) => e !== null)
				.map(({ e, i }) => ({ index: i, position: (e as any).position as number }));
		},
		validProbes(): Array<{ probe: Probe; index: number }> {
			return this.model.sensors.probes
				.map((p, i) => ({ probe: p as Probe, index: i }))
				.filter(({ probe }) => probe !== null && probe.type !== ProbeType.none);
		},
		darkTheme(): boolean {
			return store.state.settings.darkTheme;
		},
		volumetricFlow(): number {
			if (this.model.state.currentTool >= 0 && this.model.state.currentTool < this.model.tools.length) {
				const selectedTool = this.model.tools[this.model.state.currentTool];
				if (selectedTool !== null) {
					let numExtruders = 0, filamentArea = 0;
					for (let i = 0; i < selectedTool.extruders.length; i++) {
						const extruderIndex = selectedTool.extruders[i];
						if (extruderIndex >= 0 && extruderIndex < this.model.move.extruders.length) {
							const extruder = this.model.move.extruders[extruderIndex];
							if (extruder !== null) {
								filamentArea += selectedTool.mix[i] * (Math.PI * Math.pow((extruder.filamentDiameter / 2), 2));
								numExtruders++;
							}
						}
					}
					if (numExtruders > 0) {
						filamentArea /= numExtruders;
						return filamentArea * this.model.move.currentMove.extrusionRate;
					}
				}
			}
			return NaN;
		}
	},
	data() {
		return {
			activeTab: 0,
			showVolumetric: true
		};
	},
	methods: {
		encoderRingColor(pct: number | null): string {
			if (pct === null || !isFinite(pct)) return "rgba(128,128,128,0.35)";
			const dev = Math.abs(pct - 100);
			if (dev <= 5)  return "#4caf50"; // verde: ±5%
			if (dev <= 15) return "#ff9800"; // arancio: ±15%
			return "#f44336";                // rosso: oltre ±15%
		},
		encoderDashOffset(pct: number | null): number {
			const circumference = 2 * Math.PI * 62; // r=62 → 389.6
			if (pct === null || !isFinite(pct)) return circumference;
			const fill = Math.min(Math.max(pct, 0), 100) / 100;
			return circumference * (1 - fill);
		},
		positionDashOffset(pos: number): number {
			const circumference = 2 * Math.PI * 48; // r=48 → 301.6
			const fill = Math.min(Math.max(pos, 0), 1023) / 1023;
			return circumference * (1 - fill);
		},
		formatProbeValues(values: Array<number>): string {
			if (!values || values.length === 0) return "—";
			if (values.length === 1) return String(values[0]);
			return `${values[0]} (${values.slice(1).join(", ")})`;
		},
		probeChipClass(probe: Probe): string[] {
			if (probe.value.length > 0) {
				if (probe.value[0] >= probe.threshold)       return ["red",    "darken-2"];
				if (probe.value[0] > probe.threshold * 0.9) return ["orange", "darken-2"];
				return ["green", "darken-2"];
			}
			return [];
		}
	}
});
</script>
