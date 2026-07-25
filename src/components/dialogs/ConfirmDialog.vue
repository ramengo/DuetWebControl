<style>
.persistent {
    position: absolute;
    top: 0px;
    right: 0px;
}

/* ============================= */
/* TITOLO */
/* ============================= */
.m291-touch .v-card__title,
.v-card__title .headline {
    font-size: 1.7em !important;
    font-weight: bold !important;
    line-height: 4 !important;
    text-align: center !important;
    text-wrap-mode: nowrap;
}

/* ============================= */
/* DESCRIZIONE */
/* ============================= */
.m291-touch .v-card__text {
	min-height: 20vh;
	color: black !important;
    font-size: 1.5em !important;
    line-height: 1.4 !important;
}

.m291-touch .v-dialog > .v-card > .v-card__text {
    padding: 10vw;
}

.m291-touch .v-card > .v-card__text, .m291-touch .v-card > .v-card__subtitle {
	background-color: transparent !important;
	font-size: 1.5em !important;
    line-height: 1.4 !important;
}

.m291-touch {
    background-color: gray !important;
    color: black !important;
}

/* ============================= */
/* JOG BUTTON */
/* ============================= */
.m291-touch .move-btn {
    background-color: #ff9800 !important;
    color: black !important;
    border-radius: 20px !important;
    font-size: 1em !important;
    font-weight: bold !important;
    margin: 12px !important;
    padding: 20px 0 !important;
}

.m291-touch .move-btn .v-icon {
    font-size: 1.2em !important;
    color: black !important;
}

/* ============================= */
/* PULSANTI OK / CANCEL */
/* ============================= */
.v-card__actions .v-btn {
    background-color: #ff9800 !important;
    color: black !important;
    font-size: 1em !important;
    font-weight: bold !important;
    border-radius: 40px !important;
    min-width: 10vw !important;
    height: 50px !important;
    margin: 8px !important;
    padding: 0% 30px !important;
}

.v-card__actions .v-btn .v-btn__content {
    color: black !important;
}

.v-col {
    padding: 12px !important;
}
</style>

<template>
	<v-dialog class="m291-touch" v-model="internalShown" @keydown.escape="dismissed" persistent width="80vw">
		<v-card class="m291-touch" >
			<v-card-title>
				<span class="m291-touch headline">
					{{ title }}
				</span>
			</v-card-title>

			<v-card-text class="m291-touch">
				{{ prompt }}
			</v-card-text>

			<v-card-actions>
				<v-spacer />
				<v-btn color="blue darken-1" text @click="dismissed">{{ $t('generic.no') }}</v-btn>
				<v-btn color="blue darken-1" text @click="confirmed">{{ $t('generic.yes') }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
	props: {
		title: {
			type: String,
			required: true
		},
		prompt: {
			type: String,
			required: true
		},
		shown: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		internalShown: {
			get(): boolean { return this.shown; },
			set(value: boolean) {
				if (value) {
					this.confirmed();
				} else {
					this.dismissed();
				}
			}
		}
	},
	methods: {
		confirmed() {
			this.$emit("confirmed");
			this.$emit("update:shown", false);
		},
		dismissed() {
			this.$emit("dismissed");
			this.$emit("update:shown", false);
		}
	}
});
</script>
