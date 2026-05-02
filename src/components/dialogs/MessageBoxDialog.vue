<style>
.persistent {
    position: absolute;
    top: 0;
    right: 0;
}

/* ============================= */
/* BARRA COLORE SINISTRA         */
/* ============================= */
.msg-info    { border-left: 8px solid #f38321 !important; }
.msg-warning { border-left: 8px solid #f44336 !important; }
.msg-success { border-left: 8px solid #4caf50 !important; }
.msg-move    { border-left: 8px solid #13cccf !important; }

/* ============================= */
/* CARD BASE                     */
/* ============================= */
.m291-touch {
    background-color: #4a4a4a !important;
    color: #fff !important;
}

/* ============================= */
/* TITOLO                        */
/* ============================= */
.m291-touch .v-card__title,
.m291-touch .v-card__title .headline {
    font-size: 1.4rem !important;
    font-weight: 700 !important;
    line-height: 1.4 !important;
    text-align: center !important;
    white-space: normal !important;
    word-break: break-word !important;
    padding: 20px 24px 10px !important;
    color: #fff !important;
}

/* ============================= */
/* CORPO MESSAGGIO               */
/* ============================= */
.m291-touch .v-card__text {
    font-size: 1.15rem !important;
    line-height: 1.65 !important;
    padding: 16px 20px !important;
    color: #fff !important;
    background-color: transparent !important;
    max-height: 65vh;
    overflow-y: auto;
    transition: background-color 0.3s;
}

/* Testo messaggio: preserva gli a-capo del firmware */
.m291-msg-text {
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    text-align: left;
}

/* ============================= */
/* JOG BUTTON                    */
/* ============================= */
.m291-touch .move-btn {
    background-color: #ff9800 !important;
    color: black !important;
    border-radius: 20px !important;
    font-size: 1rem !important;
    font-weight: bold !important;
    margin: 8px !important;
    padding: 20px 0 !important;
}

.m291-touch .move-btn .v-icon {
    font-size: 1.1rem !important;
    color: black !important;
}

/* ============================= */
/* PULSANTI OK / CANCEL          */
/* ============================= */
.m291-touch .v-card__actions .v-btn {
    background-color: #ff9800 !important;
    color: black !important;
    font-size: 1rem !important;
    font-weight: bold !important;
    border-radius: 40px !important;
    min-width: 120px !important;
    height: 50px !important;
    margin: 8px !important;
    padding: 0 28px !important;
}

.m291-touch .v-card__actions .v-btn .v-btn__content {
    color: black !important;
}
</style>

<template>
    <v-dialog v-model="shown" :no-click-animation="isPersistent" :persistent="isPersistent"
              :max-width="$vuetify.breakpoint.xsOnly ? '98vw' : 680">
        <v-card class="m291-touch" style="overflow: hidden;">
            <v-card-title class="m291-touch justify-center">
                <span class="headline">
                    {{ messageBox.title }}
                </span>
            </v-card-title>

            <v-card-text :class="statusSettings.class">
                <div class="d-flex align-start" :class="{ 'mb-6': displayedAxes.length > 0 }">
                    <v-icon v-if="statusSettings.icon" size="48" class="me-3 flex-shrink-0 mt-1">
                        {{ statusSettings.icon }}
                    </v-icon>
                    <div class="m291-msg-text" v-html="displayMessage"></div>
                </div>

                <v-row v-for="axis in displayedAxes" :key="axis.letter" dense>
                    <v-col>
                        <v-row no-gutters>
                            <v-col v-for="index in numMoveSteps" :key="index" :class="getMoveCellClass(index - 1)">
                                <code-btn :code="getMoveCode(axis, index - 1, true)" :disabled="!canMove(axis)" no-wait
                                          block tile class="m291-touch move-btn">
                                    <v-icon>mdi-chevron-left</v-icon>
                                    {{ axis.letter + showSign(-moveSteps(axis.letter)[index - 1]) }}
                                </code-btn>
                            </v-col>
                        </v-row>
                    </v-col>

                    <v-col cols="auto" class="d-flex align-center px-3">
                        <strong>
                            {{ axis.letter + ' = ' + displayAxisPosition(axis) }}
                        </strong>
                    </v-col>

                    <v-col>
                        <v-row no-gutters>
                            <v-col v-for="index in numMoveSteps" :key="index"
                                   :class="getMoveCellClass(numMoveSteps - index)">
                                <code-btn :code="getMoveCode(axis, numMoveSteps - index, false)"
                                          :disabled="!canMove(axis)" no-wait block tile class="m291-touch move-btn">
                                    {{ axis.letter + showSign(moveSteps(axis.letter)[numMoveSteps - index]) }}
                                    <v-icon>mdi-chevron-right</v-icon>
                                </code-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>

                <form v-if="needsNumberInput || needsStringInput" @submit.prevent="ok">
                    <v-text-field v-if="needsNumberInput" type="number" autofocus v-model.number="numberInput"
                                  :min="messageBox.min" :max="messageBox.max" :step="needsIntInput ? 1 : 'any'" required
                                  hide-details />
                    <v-text-field v-else type="text" autofocus v-model="stringInput" :minlength="messageBox.min || 0"
                                  :maxlength="messageBox.max || 100" required hide-details />
                </form>
            </v-card-text>

            <v-card-actions v-if="hasButtons" class="flex-wrap justify-center">
                <template v-if="isMultipleChoice">
                    <v-btn v-for="(choice, index) in messageBox.choices" :key="choice" color="blue darken-1"
                           :text="messageBox.default !== index" @click="accept(index)">
                        {{ choice }}
                    </v-btn>
                    <v-btn v-if="messageBox.cancelButton" color="blue darken-1" text @click="cancel">
                        {{ $t("generic.cancel") }}
                    </v-btn>
                </template>
                <template v-else>
                    <v-btn color="blue darken-1" text @click="ok" :disabled="!canConfirm">
                        {{ $t(isPersistent ? "generic.ok" : "generic.close") }}
                    </v-btn>
                    <v-btn v-if="messageBox.cancelButton" color="blue darken-1" text @click="cancel">
                        {{ $t("generic.cancel") }}
                    </v-btn>
                </template>
            </v-card-actions>
        </v-card>

        <div v-if="showEmergencyStop" class="persistent d-flex justify-end pe-4 pt-3">
            <emergency-btn />
        </div>
    </v-dialog>
</template>

<script lang="ts">
import { Axis, AxisLetter, MessageBox, MessageBoxMode } from "@duet3d/objectmodel";
import Vue from "vue";

import store from "@/store";
import { isNumber } from "@/utils/numbers";

export default Vue.extend({
    computed: {
        // --- LOGICA COLORI E ICONE ---
        statusSettings(): { class: string, icon: string } {
            const msg = this.messageBox.message || "";
            if (msg.startsWith('[I]')) return { class: 'msg-info', icon: 'mdi-information' };
            if (msg.startsWith('[W]')) return { class: 'msg-warning', icon: 'mdi-alert' };
            if (msg.startsWith('[S]')) return { class: 'msg-success', icon: 'mdi-check-circle' };
            if (msg.startsWith('[M]')) return { class: 'msg-move', icon: 'mdi-arrow-up-down' };
            return { class: '', icon: '' };
        },
        displayMessage(): string {
            // Rimuove i tag [I], [W], [S] e l'eventuale spazio successivo
            return (this.messageBox.message || "").replace(/^\[[IWSM]\]\s*/, '');
        },
        // --- FINE LOGICA COLORI ---

        moveSteps(): (axisLetter: AxisLetter) => Array<number> { return ((axisLetter: AxisLetter) => store.getters["machine/settings/moveSteps"](axisLetter)); },
        numMoveSteps(): number { return store.getters["machine/settings/numMoveSteps"]; },
        isReconnecting(): boolean { return store.state.machine.isReconnecting; },
        currentMessageBox(): MessageBox | null { return store.state.machine.model.state.messageBox; },
        canConfirm(): boolean {
            if (this.needsNumberInput) {
                let canConfirm;
                if (this.messageBox.mode === MessageBoxMode.intInput) {
                    canConfirm = isNumber(this.numberInput) && this.numberInput === Math.round(this.numberInput);
                } else {
                    canConfirm = isNumber(this.numberInput);
                }
                return canConfirm && ((this.messageBox.min === null) || (this.numberInput >= this.messageBox.min)) && ((this.messageBox.max === null) || (this.numberInput <= this.messageBox.max));
            }
            if (this.needsStringInput) {
                return ((this.messageBox.min === null) || (this.stringInput.length >= this.messageBox.min)) && ((this.messageBox.max === null) || (this.stringInput.length <= this.messageBox.max));
            }
            return true;
        },
        displayedAxes(): Array<Axis> {
            const axisControls = (this.messageBox && this.messageBox.axisControls !== null) ? this.messageBox.axisControls : 0;
            return store.state.machine.model.move.axes.filter((axis, index) => axis.visible && ((axisControls & (1 << index)) !== 0));
        },
        hasButtons(): boolean { return this.messageBox.mode !== MessageBoxMode.noButtons; },
        isMultipleChoice(): boolean { return this.messageBox.mode === MessageBoxMode.multipleChoice; },
        isPersistent(): boolean { return this.messageBox.mode >= MessageBoxMode.okOnly; },
        needsIntInput(): boolean { return this.messageBox.mode === MessageBoxMode.intInput; },
        needsNumberInput(): boolean { return (this.messageBox.mode === MessageBoxMode.intInput) || (this.messageBox.mode === MessageBoxMode.floatInput); },
        needsStringInput(): boolean { return this.messageBox.mode === MessageBoxMode.stringInput; }
    },
    data() {
        return {
            messageBox: new MessageBox(),
            numberInput: 0,
            shown: false,
            showEmergencyStop: false,
            stringInput: ""
        }
    },
    methods: {
        canMove(axis: Axis): boolean { return axis.homed || !store.state.machine.model.move.noMovesBeforeHoming; },
        displayAxisPosition(axis: Axis): string {
            if (axis.userPosition === null) return this.$t("generic.noValue");
            return (axis.letter === AxisLetter.Z) ? this.$displayZ(axis.userPosition, false) : this.$display(axis.userPosition, 1);
        },
        getMoveCellClass(index: number): string {
            let classes = "";
            if (index === 0 || index === 5) classes += "hidden-lg-and-down";
            if (index > 1 && index < 4 && index % 2 === 1) classes += "hidden-md-and-down";
            return classes;
        },
        getMoveCode(axis: Axis, index: number, decrementing: boolean): string {
            return `M120\nG91\nG1 ${/[a-z]/.test(axis.letter) ? '\'' : ""}${axis.letter}${decrementing ? '-' : ""}${this.moveSteps(axis.letter)[index]} F${store.state.machine.settings.moveFeedrate}\nM121`;
        },
        showSign: (value: number): string => (value > 0) ? `+${value}` : value.toString(),
        async ok() {
            this.shown = false;
            if ([MessageBoxMode.closeOnly, MessageBoxMode.okOnly, MessageBoxMode.okCancel].includes(this.messageBox.mode)) {
                await store.dispatch("machine/sendCode", { code: `M292 S${this.messageBox.seq}`, noWait: true });
            } else if (this.messageBox.mode === MessageBoxMode.intInput || this.messageBox.mode === MessageBoxMode.floatInput) {
                await store.dispatch("machine/sendCode", { code: `M292 R{${this.numberInput}} S${this.messageBox.seq}`, noWait: true });
            } else if (this.messageBox.mode === MessageBoxMode.stringInput) {
                await store.dispatch("machine/sendCode", { code: `M292 R{"${this.stringInput.replace(/"/g, '""').replace(/'/g, "''")}"} S${this.messageBox.seq}`, noWait: true });
            }
        },
        async accept(choice: number) {
            this.shown = false;
            if (this.messageBox.mode >= MessageBoxMode.multipleChoice) {
                await store.dispatch("machine/sendCode", { code: `M292 R{${choice}} S${this.messageBox.seq}`, noWait: true });
            }
        },
        async cancel() {
            this.shown = false;
            if (this.messageBox.cancelButton) {
                await store.dispatch("machine/sendCode", { code: `M292 P1 S${this.messageBox.seq}`, noWait: true });
            }
        }
    },
    watch: {
        isReconnecting(to: boolean) {
            if (to) this.shown = false;
            else if (this.currentMessageBox && this.currentMessageBox.mode !== null) this.shown = true;
        },
        currentMessageBox: {
            deep: true,
            handler(to: MessageBox | null) {
                if (to && to.mode !== null) {
                    this.numberInput = (typeof to.default === "number") ? to.default : 0;
                    this.stringInput = (typeof to.default === "string") ? to.default : "";
                    this.messageBox = JSON.parse(JSON.stringify(to));
                    this.shown = true;
                } else {
                    this.shown = false;
                }
            }
        },
        shown(to) {
            if (to && this.isPersistent) {
                setTimeout(() => this.showEmergencyStop = true, 500);
            } else {
                this.showEmergencyStop = false;
            }
        }
    }
});
</script>