# DuetWebControl — Personalizzazioni Fabbrix / Mod Bosch
## Branch `3.6_it_modbosch` · Presentazione modifiche

---

## Contesto del progetto

**DuetWebControl** è l'interfaccia web ufficiale per le schede Duet (RepRapFirmware). Il branch `3.6_it_modbosch` introduce una serie di personalizzazioni pensate per un utilizzo industriale su un pannello touch verticale **1080 × 1920 px**, mantenendo piena compatibilità con il layout desktop originale.

---

## 1. Ottimizzazione layout Touch Portrait

### Problema
L'interfaccia originale è progettata per desktop landscape. Su un pannello touch 1080×1920 (portrait):
- Scroll orizzontale indesiderato
- Pulsanti troppo piccoli per il tocco
- Font non leggibili ad alta densità
- Drawer laterale occupava il 25% della larghezza utile

### Soluzione — breakpoint `portraitTouch`

**File:** [src/main.ts](src/main.ts)

Aggiunto un custom breakpoint Vuetify a 1080 px che attiva automaticamente il layout ottimizzato touch:

```javascript
breakpoint: {
  thresholds: { portraitTouch: 1080 }
}
```

**File:** [src/App.vue](src/App.vue)

```javascript
isPortraitTouch(): boolean {
  return !this.$vuetify.breakpoint.lgAndUp; // < 1264px
}
drawerWidth(): number {
  if (this.isPortraitTouch && !this.iconMenu) return 48;
  return this.$vuetify.breakpoint.smAndDown ? 275 : 256;
}
```

### Risultato

| Metrica | Prima | Dopo |
|---|---|---|
| Scroll orizzontale | Presente | Zero |
| Larghezza drawer | 275 px (25%) | 48 px (4%) — solo icone |
| Altezza tap target | 24–36 px | 44–48 px (Material Design) |
| Font body | 14 px | 15 px |
| Grafico layer | Nascosto | Visibile, 500 px |

---

## 2. Redesign pagina Job/Status

**File:** [src/routes/Job/Status.vue](src/routes/Job/Status.vue)

### Layout portrait touch — griglia 2×2 superiore

I pannelli principali sono disposti in una griglia 2×2 a larghezza piena:

| Colonna sinistra | Colonna destra |
|---|---|
| `job-control-panel` (play / pausa) | `z-babystep-panel` (baby stepping) |
| `job-info-panel` (info + stato) | Thumbnail file in stampa |

- Thumbnail con logo **Fabbrix** come placeholder quando non disponibile
- Righe con altezza equalizzata tramite `d-flex` + `align-items: stretch`

### Pannelli inferiori (full-width)

```
job-carousel-panel      (cols=12)
job-estimations-panel   (cols=12)
job-data-panel          (cols=12)
speed-factor | fans | extrusion-factors
```

---

## 3. Nuovo componente: JobCarouselPanel

**File:** [src/components/panels/JobCarouselPanel.vue](src/components/panels/JobCarouselPanel.vue)

Componente a schede (`v-tabs`) con 4 tab che raccoglie le informazioni di stampa in uno spazio compatto (altezza fissa 50 vh):

| Tab | Contenuto |
|---|---|
| **Layer** | Grafico layer in tempo reale |
| **Temp** | Grafico temperature |
| **Tool** | Pannello utensili |
| **Speed** | Velocità + monitor encoder filamento |

### Monitor encoder filamento (tab Speed)

Visualizzazione SVG 72×72 px con due anelli concentrici per ogni encoder attivo:

- **Anello esterno** — `lastPercentage`: verde (±5%), arancione (±15%), rosso (oltre)
- **Anello interno** (blu) — posizione raw 0–1023 mappata a 360°
- Testo centrale: posizione in mm e percentuale colorata

---

## 4. Pannello Strumenti (ToolsPanel) — layout compatto

### ControlList — 4 colonne invece di 5

**File:** [src/components/panels/ToolsPanel/ControlList/ControlList.vue](src/components/panels/ToolsPanel/ControlList/ControlList.vue)

Rimossa la colonna dedicata al nome riscaldatore per guadagnare spazio. Larghezze aggiornate: `32% / 23% / 22% / 24%`.

### ToolRows — cella utensile ridisegnata

**File:** [src/components/panels/ToolsPanel/ControlList/ToolRows.vue](src/components/panels/ToolsPanel/ControlList/ToolRows.vue)

- Rimosso testo nome utensile, mantenuti solo icona + spinner
- Stato riscaldatore (attivo / standby / spento) spostato sotto la temperatura come link cliccabile
- Temperatura corrente in **grassetto** con `font-size: 1.15em`
- Controlli mandrino (M3/M4/M5) integrati nella stessa cella utensile

### HeaterRows — stato integrato

**File:** [src/components/panels/ToolsPanel/ControlList/HeaterRows.vue](src/components/panels/ToolsPanel/ControlList/HeaterRows.vue)

- Stato riscaldatore aggiunto come link/span sotto il nome letto/camera
- Rimossa `<th>` separata per il nome riscaldatore

---

## 5. Pannello Movimento (MovementPanel)

**File:** [src/components/panels/MovementPanel.vue](src/components/panels/MovementPanel.vue)

### Step di movimento ridotti per uso industriale

| Asse | Prima | Dopo |
|---|---|---|
| X, Y | `[100, 50, 10, 1, 0.1]` | `[10, 1, 0.05]` |
| Z | `[50, 25, 5, 0.5, 0.05]` | `[10, 1, 0.05]` |

### Layout pulsanti simmetrico

```
[ −10 ] [ −1 ] [ −0.05 ]  ←→  [ +0.05 ] [ +1 ] [ +10 ]
```

- Pulsanti home con `min-height: 56 px` e icona `mdi-home`
- Voce **"Disabilita motori"** (`M18`) aggiunta al menu Compensazione — abilitata solo quando macchina in stato `idle`

---

## 6. Dialogo M291 / MessageBox — redesign touch

**File:** [src/components/dialogs/MessageBoxDialog.vue](src/components/dialogs/MessageBoxDialog.vue)

Dialogo M291 completamente ridisegnato per uso touch:

- Layout a schermo intero su portrait
- Pulsanti ingranditi e ben distanziati
- Supporto S0 (nessun pulsante), S1 (solo OK), S2 (OK/Cancel), S3 (Sì/No)
- Compatibilità traduzione IT/EN

**File:** [src/components/dialogs/ConfirmDialog.vue](src/components/dialogs/ConfirmDialog.vue)

Aggiornato il dialogo di conferma generico con stile coerente al tema touch.

---

## 7. Indicatori toolbar (App.vue)

**File:** [src/App.vue](src/App.vue)

### Indicatore Porta

| Stato | Colore | Icona |
|---|---|---|
| Porta aperta | Verde | `mdi-lock-open-variant` |
| Porta chiusa, latch OFF | Arancione | `mdi-lock-open-variant` |
| Porta chiusa, latch ON | Rosso | `mdi-lock` |

- Legge `sensors.gpIn[9]` (interlock fisico) e `sensors.gpIn[10]` (latch software)
- Toggle invia `M1202` (blocca) o `M1203` (sblocca) basandosi sul latch — **fix bug** che impediva lo sblocco

### Indicatore Piano

- Legge `sensors.gpIn[11]`: verde se piano presente, rosso se assente

---

## 8. Grafico Temperature

**File:** [src/components/charts/TemperatureChart.vue](src/components/charts/TemperatureChart.vue)

- Asse Y ora usa `suggestedMax` invece di `max` fisso
- Il grafico scala automaticamente sulle temperature reali (non sempre fino a 300 °C)
- Rimosso `stepSize: 50` fisso

---

## 9. Icone e branding PWA — Fabbrix

**Script:** [scripts/generate-icons.js](scripts/generate-icons.js) (`npm run gen:icons`)

Generazione automatica di tutte le icone PWA da `favicon.svg` tramite `@resvg/resvg-js` (renderer SVG Rust):

- Icone plain (sfondo trasparente): 16, 32, 60, 76, 120, 144, 150, 152, 180, 192, 512 px
- Icone maskable (sfondo blu `#2196f3`): 192, 512 px

**Logo:** [public/img/icons/fabbrix.svg](public/img/icons/fabbrix.svg) — arancione `#ff6600` su sfondo trasparente, usato come placeholder thumbnail.

---

## 10. Localizzazione Italiana

**File:** [src/i18n/it.json](src/i18n/it.json)

Tutte le nuove stringhe UI (porta, piano, disabilita motori, stati riscaldatore, dialoghi M291) aggiunte con traduzione italiana e inglese.

---

## Riepilogo file modificati

```
src/
├── main.ts                                         ← custom breakpoint 1080px
├── App.vue                                         ← toolbar porta/piano, drawer portrait
├── routes/Job/Status.vue                           ← griglia 2×2 portrait, placeholder Fabbrix
├── scss/variables.scss                             ← tap target 44-48px, font 15px
├── i18n/it.json, en.json                           ← nuove stringhe
├── components/
│   ├── dialogs/
│   │   ├── MessageBoxDialog.vue                    ← M291 redesign touch
│   │   └── ConfirmDialog.vue                       ← dialogo conferma aggiornato
│   ├── charts/
│   │   └── TemperatureChart.vue                    ← asse Y auto-scale
│   └── panels/
│       ├── JobCarouselPanel.vue                    ← NUOVO — tab Layer/Temp/Tool/Speed
│       ├── MovementPanel.vue                       ← step ridotti, home icon, M18
│       ├── JobInfoPanel.vue                        ← status-label aggiunto
│       ├── JobControlPanel.vue                     ← thumbnail rimossa (spostata in Status)
│       └── ToolsPanel/ControlList/
│           ├── ControlList.vue                     ← 4 colonne
│           ├── ToolRows.vue                        ← layout compatto
│           └── HeaterRows.vue                      ← stato integrato
public/img/icons/                                   ← icone PWA Fabbrix
scripts/generate-icons.js                           ← generatore icone
```

---

## Dipendenze aggiunte

| Pacchetto | Tipo | Uso |
|---|---|---|
| `@resvg/resvg-js ^2.6.2` | devDependency | Render SVG→PNG per icone PWA |

---

*Branch: `3.6_it_modbosch` · Base: `v3.6-dev` · Autore: ramengo*
