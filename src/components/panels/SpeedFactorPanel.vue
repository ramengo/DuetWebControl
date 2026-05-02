<style scoped>
.speed-title {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	min-width: 0;
}
</style>

<template>
	<v-card class="d-flex flex-column" style="height: 50vh">
		<v-card-title class="pb-0 flex-shrink-0 px-2" style="flex-wrap: nowrap; overflow: hidden;">
			<v-icon small class="mr-1 flex-shrink-0">mdi-timer</v-icon>
			<span class="speed-title">{{ $t("panel.speedFactor.caption") }}</span>

			<v-spacer />

			<a v-show="speedFactor !== 100 && !uiFrozen" href="javascript:void(0)"
			   @click.prevent="sendCode('M220 S100')" class="subtitle-2 flex-shrink-0 ml-1">
				<v-icon small>mdi-backup-restore</v-icon>
			</a>
		</v-card-title>

		<v-card-text class="d-flex flex-column flex-grow-1 pa-1 overflow-hidden">
			<percentage-input vertical v-model="speedFactor" :min="speedFactorMin" :max="speedFactorMax" :disabled="uiFrozen" />
		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import Vue from "vue";

import store from "@/store";

export default Vue.extend({
	computed: {
		uiFrozen(): boolean { return store.getters["uiFrozen"]; },
		speedFactor: {
			get(): number { return (store.state.machine.model.move.speedFactor !== null) ? (store.state.machine.model.move.speedFactor * 100) : 100; },
			set(value: number) { this.sendCode(`M220 S${value}`); }
		},
		speedFactorMin(): number { return Math.max(1, Math.min(100, this.speedFactor - 50)); },
		speedFactorMax(): number { return Math.max(150, this.speedFactor + 50); }
	},
	methods: {
		async sendCode(code: string) {
			await store.dispatch("machine/sendCode", code);
		}
	}
});
</script>
