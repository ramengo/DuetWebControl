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
    font-size: 1.25rem !important;
    line-height: 1.65 !important;
    padding: 16px 20px !important;
    color: #fff !important;
    background-color: transparent !important;
    max-height: 65vh;
    overflow-y: auto;
    transition: background-color 0.3s;
    text-align: center !important;
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
.m291-touch .v-card__actions {
	gap: 8px;
}

/* RIGA 1: GLASSMORPHISM (trasparente + blur) */
.m291-touch .v-card__actions:not(.msg-actions-row2) .v-btn {
    background: rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(8px) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
    color: #fff !important;
    border-radius: 14px !important;
    font-size: 1rem !important;
    font-weight: 500 !important;
    letter-spacing: 0.04em !important;
    height: 52px !important;
    min-width: 130px !important;
    margin: 0 !important;
    padding: 0 24px !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15) !important;
    transition: all 0.3s ease !important;
}

.m291-touch .v-card__actions:not(.msg-actions-row2) .v-btn:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    border-color: rgba(255, 255, 255, 0.35) !important;
}

.m291-touch .v-card__actions:not(.msg-actions-row2) .v-btn .v-btn__content {
    color: #fff !important;
}

/* RIGA 2: HMI INDUSTRIALE (dark con accento laterale) */
.m291-touch .msg-actions-row2 .v-btn {
    background-color: #2a2a2a !important;
    border-left: 4px solid #ff9800 !important;
    border-radius: 8px !important;
    font-size: 0.85rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    height: 54px !important;
    min-width: 140px !important;
    margin: 0 !important;
    padding: 0 24px !important;
    color: #fff !important;
}

.m291-touch .msg-actions-row2 .v-btn .v-btn__content {
    color: #fff !important;
}

/* Colori riga 2 per prefisso [W] arancio-rosso, [O] verde, [K] viola */
.m291-touch .msg-actions-row2 .msg-btn-w {
    border-left-color: #ff5722 !important;
}

.m291-touch .msg-actions-row2 .msg-btn-o {
    border-left-color: #4caf50 !important;
}

.m291-touch .msg-actions-row2 .msg-btn-k {
    border-left-color: #7c4dff !important;
}

.m291-touch .msg-actions-row2 {
	margin-top: 16px !important;
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

            <!-- Riga 1: choices senza prefisso (solo se non ci sono choices riga 2) -->
            <v-card-actions v-if="isMultipleChoice && choicesRow1.length > 0 && !hasChoicesRow2" class="flex-wrap justify-center">
                <v-btn v-for="choice in choicesRow1" :key="choice.index" color="blue darken-1"
                       :text="messageBox.default !== choice.index" @click="accept(choice.index)">
                    {{ choice.text }}
                </v-btn>
                <v-btn v-if="messageBox.cancelButton" color="blue darken-1" text @click="cancel">
                    {{ $t("generic.cancel") }}
                </v-btn>
            </v-card-actions>

            <!-- Riga 1: choices senza prefisso (quando esistono anche choices riga 2) -->
            <v-card-actions v-if="isMultipleChoice && choicesRow1.length > 0 && hasChoicesRow2" class="flex-wrap justify-center">
                <v-btn v-for="choice in choicesRow1" :key="choice.index" color="blue darken-1"
                       :text="messageBox.default !== choice.index" @click="accept(choice.index)">
                    {{ choice.text }}
                </v-btn>
            </v-card-actions>

            <!-- Riga 2: choices con prefisso [W], [O], [K] — ognuno con colore proprio -->
            <v-card-actions v-if="isMultipleChoice && hasChoicesRow2" class="flex-wrap justify-center msg-actions-row2">
                <v-btn v-for="choice in choicesRow2" :key="choice.index" :class="choice.btnClass"
                       :text="messageBox.default !== choice.index" @click="accept(choice.index)">
                    {{ choice.text }}
                </v-btn>
                <v-btn v-if="messageBox.cancelButton" class="msg-btn-w" text @click="cancel">
                    {{ $t("generic.cancel") }}
                </v-btn>
            </v-card-actions>

            <!-- Bottoni standard OK / CANCEL per modalità non-multipleChoice -->
            <v-card-actions v-else-if="hasButtons" class="flex-wrap justify-center">
                <v-btn color="blue darken-1" text @click="ok" :disabled="!canConfirm">
                    {{ $t(isPersistent ? "generic.ok" : "generic.close") }}
                </v-btn>
                <v-btn v-if="messageBox.cancelButton" color="blue darken-1" text @click="cancel">
                    {{ $t("generic.cancel") }}
                </v-btn>
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
        // --- LOGICA COLORI BORDO MESSAGGIO ([I] info, [W] warning, [S] success, [M] move) ---
        statusSettings(): { class: string, icon: string } {
            const msg = this.messageBox.message || "";
            if (msg.startsWith('[I]')) return { class: 'msg-info', icon: 'mdi-information' };
            if (msg.startsWith('[W]')) return { class: 'msg-warning', icon: 'mdi-alert' };
            if (msg.startsWith('[S]')) return { class: 'msg-success', icon: 'mdi-check-circle' };
            if (msg.startsWith('[M]')) return { class: 'msg-move', icon: 'mdi-arrow-up-down' };
            return { class: '', icon: '' };
        },
        displayMessage(): string {
            return (this.messageBox.message || "").replace(/^\[[IWSM]\]\s*/, '');
        },
        // --- FINE LOGICA COLORI ---

        // --- PARSING CHOICES: [W]=arancio-rosso, [O]=verde, [K]=viola ---
        choicesRow1(): Array<{ text: string, index: number }> {
            if (!this.messageBox.choices) return [];
            return this.messageBox.choices
                .map((c, idx) => ({ text: c, index: idx }))
                .filter(c => !c.text.startsWith('[W]') && !c.text.startsWith('[O]') && !c.text.startsWith('[K]'));
        },
        choicesRow2(): Array<{ text: string, index: number, btnClass: string }> {
            if (!this.messageBox.choices) return [];
            return this.messageBox.choices
                .map((c, idx): { text: string, index: number, btnClass: string } | null => {
                    if (c.startsWith('[W]')) return { text: c.replace(/^\[W\]\s*/, ''), index: idx, btnClass: 'msg-btn-w' };
                    if (c.startsWith('[O]')) return { text: c.replace(/^\[O\]\s*/, ''), index: idx, btnClass: 'msg-btn-o' };
                    if (c.startsWith('[K]')) return { text: c.replace(/^\[K\]\s*/, ''), index: idx, btnClass: 'msg-btn-k' };
                    return null;
                })
                .filter((c): c is { text: string, index: number, btnClass: string } => c !== null);
        },
        hasChoicesRow2(): boolean {
            return (this.messageBox.choices?.some(c => c.startsWith('[W]') || c.startsWith('[O]') || c.startsWith('[K]')) ?? false);
        },
        // --- FINE PARSING CHOICES ---

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
