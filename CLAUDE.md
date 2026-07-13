# DuetWebControl — Guida sviluppo (Claude Code)

Progetto: **DuetWebControl v3.6.2** — interfaccia web per schede Duet / RepRapFirmware  
Branch attivo: `3.6_it_modbosch` (personalizzazioni Fabbrix / Mod Bosch)  
Base upstream: `v3.6-dev`

---

## Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Framework UI | **Vue 2** + **Vuetify 2** |
| Linguaggio | **TypeScript** (`.vue` con `<script lang="ts">`) |
| Build | Vue CLI / Webpack |
| State | **Vuex** (store in `src/store/`) |
| i18n | **vue-i18n** (file in `src/i18n/`) |
| Grafici | Chart.js (via vue-chartjs) |
| Router | Vue Router |

---

## Comandi principali

```bash
npm run dev          # Dev server (hot reload)
npm run build        # Build produzione → dist/
npm run gen:icons    # Rigenera icone PWA da public/img/icons/favicon.svg
```

Output build: `dist/` — deployare copiando il contenuto sul server Duet.

---

## Struttura progetto

```
src/
├── main.ts                  ← entry point, config Vuetify (breakpoint, temi)
├── App.vue                  ← shell principale: toolbar, drawer, bottom nav
├── routes/                  ← pagine (Job/Status.vue, Control/Dashboard.vue, …)
├── components/
│   ├── panels/              ← pannelli UI riutilizzabili
│   │   ├── index.ts         ← registrazione globale dei componenti panel
│   │   └── ToolsPanel/ControlList/
│   ├── dialogs/             ← ConfirmDialog, MessageBoxDialog (M291), …
│   ├── charts/              ← TemperatureChart, LayerChart
│   ├── inputs/              ← PercentageInput, …
│   ├── lists/               ← BaseFileList, SystemFileList, …
│   └── misc/                ← JobProgress, StatusLabel, …
├── store/machine/
│   ├── model.ts             ← stato macchina (Duet Object Model)
│   └── settings.ts          ← impostazioni UI (step movimento, defaults, …)
├── i18n/
│   ├── it.json              ← 🇮🇹 italiano (lingua principale custom)
│   ├── en.json              ← 🇬🇧 inglese
│   └── index.ts             ← loader lingue
├── scss/
│   └── variables.scss       ← variabili globali + media query tap target
├── plugins/                 ← InputShaping, HeightMap (plugin separati)
└── components/panels/index.ts ← registra ogni pannello come componente globale
```

---

## Breakpoint `portraitTouch`

Definito in [src/main.ts](src/main.ts):

```javascript
breakpoint: { thresholds: { portraitTouch: 1080 } }
```

Computed helper usato in tutta l'app:

```typescript
// App.vue e Status.vue
isPortraitTouch(): boolean {
  return !this.$vuetify.breakpoint.lgAndUp; // true se < 1264px
}
```

**Regola pratica:** usa `v-if="isPortraitTouch"` / `v-else` per biforcazione layout. Non usare `v-show` nei layout alternativi complessi (problemi con altezze CSS).

---

## Registrare un nuovo pannello

1. Crea `src/components/panels/NomePannello.vue`
2. Aggiungi in [src/components/panels/index.ts](src/components/panels/index.ts):
   ```typescript
   import NomePannello from "./NomePannello.vue";
   // ...
   Vue.component("nome-pannello", NomePannello);
   ```
3. Usa `<nome-pannello />` nei template delle route/container.

---

## Object Model Duet (store)

I dati macchina arrivano via WebSocket e sono mappati in `src/store/machine/model.ts`.  
Accesso nei componenti:

```typescript
import { mapState } from "vuex";

computed: {
  ...mapState("machine/model", {
    sensors: (state: any) => state.sensors,
    job: (state: any) => state.job,
    move: (state: any) => state.move,
  }),
}
```

Sensori I/O usati nel branch. Indici allineati a M950 Jn in config.g — **attenzione**: i commenti
di config.g (FabbrixOS) etichettano J12 come "DOOR LOCK" e J13 come "DOOR PRESENCE", ma il
comportamento verificato sull'hardware reale (test diretto con M409 nei 3 stati fisici) è
**invertito** rispetto a quell'etichetta:

| Pin | Uso reale (verificato su hardware) | Valori |
|---|---|---|
| `sensors.gpIn[12]` | Presenza/chiusura porta (interlock) | 0 = aperta, 1 = chiusa |
| `sensors.gpIn[13]` | Blocco/serratura porta (latch) | 0 = sbloccata, 1 = bloccata |
| `sensors.gpIn[14]` | PEI PRESENCE — presenza piano (1 = assente) | |
| `sensors.filamentMonitors` | Encoder filamento (position, lastPercentage) | |

Le macro firmware lato Duet (`door_check.g`, `trigger8.g`, `trigger9.g`) usano ancora
l'etichettatura di config.g (gpIn[13]=presenza, gpIn[12]=blocco) — se risulta confermato che è
invertita anche lì, andranno corrette in FabbrixOS, non solo qui in DWC.

---

## Internazionalizzazione (i18n)

Aggiungere sempre chiave in **entrambi** `it.json` e `en.json`.

```json
// it.json
"panel": {
  "nomeChiave": "Testo italiano"
}
```

```typescript
// nel componente
this.$t("panel.nomeChiave")
```

---

## Inviare G-code

```typescript
// da un componente (via mixin o store action)
this.sendCode("M18");         // disabilita motori
this.sendCode("G28");         // home tutti gli assi
this.sendCode(`M1202`);       // blocca porta
```

Oppure usa `<code-btn code="G28">` per pulsanti con conferma integrata.

---

## Pattern layout portrait/desktop

```vue
<template>
  <!-- Portrait touch -->
  <div v-if="isPortraitTouch">
    <v-row>
      <v-col cols="6"><!-- left --></v-col>
      <v-col cols="6"><!-- right --></v-col>
    </v-row>
  </div>

  <!-- Desktop originale invariato -->
  <div v-else>
    <!-- layout originale upstream -->
  </div>
</template>
```

---

## Settings macchina (defaults)

**File:** [src/store/machine/settings.ts](src/store/machine/settings.ts)

Step movimento custom (branch):

```typescript
moveSteps: {
  X: [10, 1, 0.05],
  Y: [10, 1, 0.05],
  Z: [10, 1, 0.05],
  default: [10, 1, 0.05],
}
```

---

## Media query touch (variables.scss)

```scss
@media (max-width: 1080px) {
  .v-btn           { min-height: 48px !important; }
  .v-list-item     { min-height: 44px !important; }
  .v-card__title   { font-size: 18px; }
  .v-card__text    { font-size: 15px; }
  .v-btn.v-btn--icon { width: 48px; height: 48px; }
}
```

---

## Icone PWA

Sorgente: `public/img/icons/favicon.svg`  
Generazione: `npm run gen:icons` (usa `@resvg/resvg-js`)  
Logo Fabbrix: `public/img/icons/fabbrix.svg` (arancione `#ff6600`)

---

## Git workflow

```bash
# branch di lavoro
git checkout 3.6_it_modbosch

# upstream da tenere aggiornato
git fetch origin v3.6-dev
git merge origin/v3.6-dev

# push
git push origin 3.6_it_modbosch
```

Remote: `https://github.com/ramengo/DuetWebControl`

---

## Componenti custom branch

| Componente | File | Note |
|---|---|---|
| `job-carousel-panel` | `panels/JobCarouselPanel.vue` | Tab Layer/Temp/Tool/Speed, 50vh |
| Porta indicator | in `App.vue` | gpIn[12,13], M1202/M1203 |
| Piano indicator | in `App.vue` | gpIn[14] |
| M291 touch | `dialogs/MessageBoxDialog.vue` | Full-screen portrait |

---

## Note rapide

- **Non toccare** il layout `v-else` (desktop): il branch garantisce zero regressioni upstream.
- I grafici interni al carousel necessitano `flex: 1 1 0` + `height: 100%` per propagare l'altezza.
- Il toggle porta legge `gpIn[13]` (latch/blocco, verificato su hardware) per decidere M1202/M1203 — **non** `doorOpen`.
- `JobControlPanel` non contiene più la thumbnail (spostata in `Status.vue`).
