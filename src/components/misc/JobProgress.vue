<template>
	<v-row dense>
		<!-- Riga 1: nome file + percentuale -->
		<v-col cols="12" class="pb-0">
			<span>{{ printStatus }}</span>
		</v-col>

		<!-- Barra verde spessa — separatore visivo -->
		<v-col cols="12" class="pa-0">
			<v-progress-linear :value="jobProgress * 100" color="success" height="10" rounded />
		</v-col>

		<!-- Riga 2: layer + utilizzo filamento -->
		<v-col v-if="printDetails" cols="12" class="pt-1 d-flex justify-end">
			<span class="caption">{{ printDetails }}</span>
		</v-col>
	</v-row>
</template>

<script lang="ts">
import { MachineMode, MachineStatus } from "@duet3d/objectmodel";
import Vue from "vue";

import store from "@/store";
import { isPrinting } from "@/utils/enums";
import { extractFileName } from "@/utils/path";

export default Vue.extend({
	computed: {
		jobProgress(): number { return store.getters["machine/model/jobProgress"]; },
		status(): MachineStatus { return store.state.machine.model.state.status; },
		printStatus(): string {
			if (isPrinting(store.state.machine.model.state.status)) {
				if (this.printFile) {
					const progress = this.$display(this.jobProgress * 100, 1, "%");
					if (this.isSimulating) {
						return this.$t("jobProgress.simulating", [this.printFile, progress]);
					}
					if (store.state.machine.model.state.machineMode === MachineMode.fff) {
						return this.$t("jobProgress.printing", [this.printFile, progress]);
					}
					return this.$t("jobProgress.processing", [this.printFile, progress]);
				}
				return this.$t("generic.loading");
			} else if (this.lastPrintFile) {
				if (store.state.machine.model.job.lastFileSimulated) {
					return this.$t("jobProgress.simulated", [this.lastPrintFile]);
				}
				if (store.state.machine.model.state.machineMode === MachineMode.fff) {
					return this.$t("jobProgress.printed", [this.lastPrintFile]);
				}
				return this.$t("jobProgress.processed", [this.lastPrintFile]);
			}
			return this.$t("jobProgress.noJob");
		},
		printDetails(): string {
			if (!isPrinting(store.state.machine.model.state.status)) {
				return "";
			}

			let details = "";
			if (store.state.machine.model.job.layer !== null && store.state.machine.model.job.file?.numLayers) {
				details = this.$t("jobProgress.layer", [store.state.machine.model.job.layer, store.state.machine.model.job.file.numLayers]);
			}
			if (store.state.machine.model.job.rawExtrusion !== null) {
				if (details !== "") {
					details += ", ";
				}
				details += this.$t("jobProgress.filament", [this.$display(store.state.machine.model.job.rawExtrusion, 1, "mm")]);
				if (store.state.machine.model.job.file !== null && store.state.machine.model.job.file.filament.length > 0) {
					const needed = store.state.machine.model.job.file.filament.reduce((a, b) => a + b);
					details += " (" + this.$t("jobProgress.filamentRemaining", [this.$display(Math.max(needed - store.state.machine.model.job.rawExtrusion, 0), 1, "mm")]) + ")";
				}
			}
			return details;
		},
		printFile() {
			return (store.state.machine.model.job.file?.fileName) ? extractFileName(store.state.machine.model.job.file.fileName) : null;
		},
		lastPrintFile() {
			return (store.state.machine.model.job.lastFileName !== null) ? extractFileName(store.state.machine.model.job.lastFileName) : null;
		}
	},
	data() {
		return {
			isSimulating: false
		}
	},
	mounted() {
		this.isSimulating = (store.state.machine.model.state.status === MachineStatus.simulating);
	},
	watch: {
		status(to: MachineStatus) {
			if (to === MachineStatus.simulating) {
				this.isSimulating = true;
			} else if (!isPrinting(to)) {
				this.isSimulating = false;
			}
		}
	}
});
</script>
