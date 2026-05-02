<style scoped>
.chart-height-limit {
	max-height: 320px;
}

.chart-height-portrait {
	max-height: 500px !important;
	min-height: 300px;
}
</style>

<template>
	<div class="d-flex flex-column">
		<job-progress />

		<!-- Portrait Touch Layout -->
		<v-row v-if="isPortraitTouch" class="mt-0" dense>
			<!-- Row 1: job-control + babystep — equal height -->
			<v-col cols="6" class="d-flex">
				<job-control-panel style="width: 100%;" />
			</v-col>
			<v-col cols="6" class="d-flex">
				<z-babystep-panel style="width: 100%;" />
			</v-col>

			<!-- Row 2: job-info + thumbnail — equal height -->
			<v-col cols="6" class="d-flex">
				<job-info-panel style="width: 100%;" />
			</v-col>
			<v-col cols="6" class="d-flex align-center justify-center">
				<thumbnail-img v-if="validThumbnails.length > 0"
							   :thumbnail="validThumbnails[0]"
							   style="width: 100%; display: block;" />
			</v-col>

			<v-col cols="12">
				<job-carousel-panel />
			</v-col>

			<v-col cols="12">
				<job-estimations-panel />
			</v-col>

			<v-col cols="12">
				<job-data-panel />
			</v-col>
		</v-row>

		<!-- Desktop Layout: Original Multi-Column (without slider panels) -->
		<v-row v-else class="mt-0" :dense="$vuetify.breakpoint.mobile">
			<v-col order="1" order-md="1" cols="12" sm="6" md="3">
				<v-row align="center" :dense="$vuetify.breakpoint.mobile">
					<v-col cols="12">
						<job-control-panel />
					</v-col>
					<v-col cols="12">
						<z-babystep-panel />
					</v-col>
					<v-col class="hidden-sm-and-down">
						<job-info-panel />
					</v-col>
				</v-row>
			</v-col>

			<v-col order="0" order-md="2" cols="12" md="5" class="d-none d-sm-flex flex-column">
				<layer-chart class="chart-height-limit mb-5"></layer-chart>

				<v-row class="flex-grow-0 flex-shrink-1 d-none d-md-flex">
					<v-col cols="12">
						<job-estimations-panel />
					</v-col>
					<v-col cols="12">
						<job-data-panel />
					</v-col>
				</v-row>
			</v-col>

			<v-col order="2" order-md="3" cols="12" sm="6" md="4">
				<v-row :dense="$vuetify.breakpoint.mobile">
					<v-col cols="12" class="hidden-md-and-up">
						<job-estimations-panel />
					</v-col>
					<v-col cols="12" class="hidden-md-and-up">
						<job-data-panel />
					</v-col>
					<v-col cols="12" class="hidden-md-and-up">
						<job-info-panel />
					</v-col>
				</v-row>
			</v-col>
		</v-row>

		<!-- Slider Row: Speed (2) / Fans ×6 (5) / Extrusion ×5 (5) — optimised for 720×1080 -->
		<v-row class="mt-2" dense>
			<v-col cols="2">
				<speed-factor-panel />
			</v-col>
			<v-col cols="5">
				<fans-panel />
			</v-col>
			<v-col cols="5">
				<extrusion-factors-panel />
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts">
import { ThumbnailInfo } from "@duet3d/objectmodel";
import Vue from "vue";

import store from "@/store";

export default Vue.extend({
	computed: {
		isPortraitTouch(): boolean {
			return !this.$vuetify.breakpoint.lgAndUp;  // < 1264px
		},
		validThumbnails(): Array<ThumbnailInfo> {
			const thumbnails = (store.state.machine.model.job.file !== null)
				? store.state.machine.model.job.file.thumbnails.slice()
				: [];
			thumbnails.sort((a, b) => (b.width * b.height) - (a.width * a.height));
			return thumbnails.filter(t => !!t.data);
		}
	}
});
</script>
