# Modifiche branch `3.6_it_modbosch`

Riepilogo di tutte le modifiche apportate al progetto DuetWebControl per l'ottimizzazione del layout touch portrait (720×1080).

---

## 1. Layout pagina Job/Status (`src/routes/Job/Status.vue`)

### Doppio layout: Portrait Touch vs Desktop
- Aggiunta variabile `isPortraitTouch` (schermo < 1264px / breakpoint `lgAndUp`).
- Il layout **portrait touch** è completamente separato da quello desktop originale, che rimane invariato.

### Layout portrait touch — griglia 2×2 superiore
I pannelli superiori sono disposti in una griglia 2×2 a larghezza piena:

| Colonna sinistra (`cols="6"`) | Colonna destra (`cols="6"`) |
|---|---|
| `job-control-panel` (play/pausa) | `z-babystep-panel` (baby stepping) |
| `job-info-panel` (info + stato) | Thumbnail del file in stampa |

- Le righe della coppia hanno altezza equalizzata tramite `d-flex` + `align-items: stretch`.
- La thumbnail è centrata nella cella e si adatta alla larghezza disponibile.
- La thumbnail non compare se non è disponibile (`validThumbnails.length > 0`).

### Layout portrait touch — righe inferiori
```
job-carousel-panel   (cols=12)
job-estimations-panel (cols=12)
job-data-panel        (cols=12)
```

### Riga slider — comune a tutti i layout
```
speed-factor-panel (cols=2) | fans-panel (cols=5) | extrusion-factors-panel (cols=5)
```

---

## 2. Pannello JobCarouselPanel (nuovo) (`src/components/panels/JobCarouselPanel.vue`)

Nuovo componente a schede con 4 tab:

| Tab | Contenuto |
|---|---|
| **Layer** | `layer-chart` |
| **Temp** | `temperature-chart` |
| **Tool** | `tools-panel` (webcam rimossa) |
| **Speed** | Velocità richiesta / top speed / estrusione + encoder filamento |

### Specifiche strutturali
- Altezza fissa `50vh`, flex colonna, overflow nascosto.
- Tab bar `48px` fissi (`flex: none`).
- Body occupa il resto con propagazione altezza verso i grafici: `flex: 1 1 0` su `v-tabs-items` → `height: 100%` su `v-window__container` e `v-window-item`.
- Grafici interni senza shadow né bordo, `flex: 1 1 0`.

### Tab Speed — dati filamento (encoder)
- Visualizza i monitor di filamento attivi (`sensors.filamentMonitors`) che espongono `position` e `lastPercentage`.
- Per ogni encoder: SVG 72×72px con due anelli concentrici:
  - **Anello esterno** (r=30): percentuale `lastPercentage` — verde (±5%), arancione (±15%), rosso (oltre).
  - **Anello interno** (r=20, blu `#42a5f5`): posizione raw 0–1023 mappata a 360°.
  - Testo centrale: valore `position` in mm e percentuale colorata.
- Se non ci sono dati di velocità né encoder, viene mostrato un messaggio vuoto.

---

## 3. Grafico temperatura (`src/components/charts/TemperatureChart.vue`)

- Asse Y: sostituito `max` fisso con `suggestedMax` → il grafico ora scala automaticamente in base alle temperature reali invece di mostrare sempre l'asse fino a 300 °C.
- Rimosso `stepSize: 50` dall'inizializzazione dell'asse Y.

---

## 4. Pannello JobControlPanel (`src/components/panels/JobControlPanel.vue`)

- **Rimossa** la thumbnail dal pannello (spostata in `Status.vue` come cella 2×2).
- **Rimossi** i computed `thumbnails` e `validThumbnails`.
- **Rimosso** il CSS `.print-preview`.
- **Rimossa** l'importazione `ThumbnailInfo`.

---

## 5. Pannello JobInfoPanel (`src/components/panels/JobInfoPanel.vue`)

- Aggiunto `<status-label />` come prima voce nella card, mostra lo stato attuale della macchina con etichetta colorata (usa il componente globale già esistente).

---

## 6. Pannello MovementPanel (`src/components/panels/MovementPanel.vue`)

### Step di movimento ridotti
**`src/store/machine/settings.ts`** — valori di default aggiornati:

| Asse | Prima | Dopo |
|---|---|---|
| X | `[100, 50, 10, 1, 0.1]` | `[10, 1, 0.05]` |
| Y | `[100, 50, 10, 1, 0.1]` | `[10, 1, 0.05]` |
| Z | `[50, 25, 5, 0.5, 0.05]` | `[10, 1, 0.05]` |
| default | `[100, 50, 10, 1, 0.1]` | `[10, 1, 0.05]` |

### Layout pulsanti di movimento
I pulsanti mostrano tutti gli `numMoveSteps` (ora 3) per lato, con ordine:

```
[ −10 ] [ −1 ] [ −0.05 ]  |  [ +0.05 ] [ +1 ] [ +10 ]
```

- Lato negativo: dal più grande (sinistra) al più piccolo (verso centro).
- Lato positivo: dal più piccolo (verso centro) al più grande (destra).
- Implementato con `v-for="index in numMoveSteps"` invece del precedente valore fisso `2`.
- Formule indici:
  - Decremento: `centerMoveIdx + (index - 1)`
  - Incremento: `centerMoveIdx + (numMoveSteps - index)`

### Aggiunte al pannello
- Pulsanti home ridimensionati a `min-height: 56px`.
- Icona `mdi-home` aggiunta ai pulsanti home.
- `centerMoveIdx` aggiunto come computed.
- Rimosso `getMoveCellClass()` non più necessario.

### Dropdown Compensazione/Calibrazione — nuova voce
Aggiunta in fondo al menu la voce **"Disabilita motori"**:
- Invia il G-code `M18`.
- Abilitata **solo** quando lo stato macchina è `idle`.
- Icona: `mdi-motor-off`.
- Separata dalle voci precedenti da un divider.

---

## 7. Barra app (`src/App.vue`)

### Indicatore porta
- **Bottone porta** aggiunto nella toolbar con tooltip.
- Legge `sensors.gpIn[9]` (interlock fisico) e `sensors.gpIn[10]` (latch software).
- Colori:
  - Verde (`success`): porta aperta.
  - Arancione (`warning`): porta chiusa fisicamente, latch non attivo.
  - Rosso (`error`): porta chiusa e latch attivo.
- Icona: `mdi-lock-open-variant` (latch inattivo) / `mdi-lock` (latch attivo).
- **Fix bug**: il toggle invia ora il comando basandosi sul latch (`gpIn[10]`), non su `doorOpen`. Questo correggeva il problema per cui, una volta bloccata, la porta non poteva più essere sbloccata (`M1202` = blocca, `M1203` = sblocca).

### Indicatore piano
- Bottone piano aggiunto nella toolbar con tooltip.
- Legge `sensors.gpIn[11]`: verde se piano presente, rosso se assente.

### Navigazione portrait touch
- `isPortraitTouch` aggiunto come computed.
- Il cassetto laterale viene minimizzato (`mini-variant`) in modalità portrait touch.
- `drawerWidth` restituisce `48px` in portrait touch (solo icone).

---

## 8. Registrazione componente (`src/components/panels/index.ts`)

- Registrato globalmente `job-carousel-panel` → `JobCarouselPanel.vue`.
