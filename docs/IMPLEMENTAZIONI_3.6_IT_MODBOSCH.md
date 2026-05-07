# Implementazioni branch `3.6_it_modbosch`

Branch derivato da `v3.6-dev` — personalizzazioni UI per Fabbrix / Mod Bosch.

---

## 1. ControlList — rimozione colonna Riscaldatore

**File:** `src/components/panels/ToolsPanel/ControlList/ControlList.vue`

- Ridotta la tabella da 5 a 4 colonne (rimossa colonna dedicata al nome riscaldatore)
- Aggiornate le larghezze `<colgroup>`: 32% / 23% / 22% / 24%
- Tutti i `colspan="5"` nelle righe separatore → `colspan="4"`

---

## 2. ToolRows — ristrutturazione cella utensile e temperatura

**File:** `src/components/panels/ToolsPanel/ControlList/ToolRows.vue`

- **Cella Tool:** rimosso il testo del nome utensile, mantenuto solo icona + spinner; separatore `<br>` tra numero utensile `T{n}` e gestione filamento; controlli mandrino (M3/M4/M5) spostati nella stessa cella
- **Cella Temperatura corrente:** valore reso in grassetto con `font-size: 1.15em`; stato riscaldatore (attivo / in standby / spento / ecc.) spostato sotto il valore come link cliccabile in caption
- Rimossa la colonna `<td>` separata per il nome riscaldatore

---

## 3. HeaterRows — stato riscaldatore integrato

**File:** `src/components/panels/ToolsPanel/ControlList/HeaterRows.vue`

- **Modalità singolo controllo:** stato riscaldatore aggiunto come link sotto il nome letto/camera nella `<th>`; rimossa `<th>` separata per nome riscaldatore
- **Modalità controllo individuale:** stato riscaldatore aggiunto come `<span>` caption sotto il nome; rimossa `<th>` separata
- Temperatura corrente resa in grassetto in entrambe le modalità

---

## 4. Job Status — placeholder thumbnail con logo Fabbrix

**File:** `src/routes/Job/Status.vue`

- Nel layout portrait touch (< 1264 px), quando non è disponibile nessuna thumbnail del file di stampa, viene mostrato il logo `fabbrix.svg` al posto della thumbnail
- SVG visualizzato a `width: 80%`, `max-width: 180px`, `opacity: 0.75`

```html
<thumbnail-img v-if="validThumbnails.length > 0" ... />
<img v-else src="/img/icons/fabbrix.svg" alt="Fabbrix"
     style="width: 80%; max-width: 180px; display: block; opacity: 0.75;" />
```

---

## 5. Icone PWA — generazione da favicon.svg

**File:** `scripts/generate-icons.js`  
**Script npm:** `npm run gen:icons`

- Utilizza `@resvg/resvg-js` (renderer SVG Rust-based) per rasterizzare `public/img/icons/favicon.svg` in tutti i formati richiesti dal manifest PWA
- **Icone plain** (sfondo trasparente): 16, 32, 60, 76, 120, 144, 150, 152, 180 px (×2), 192, 512 px
- **Icone maskable** (sfondo blu `#2196f3`, icona centrata all'80% nella safe zone): 192, 512 px
- I path SVG sono hardcoded nello script per evitare problemi con namespace Inkscape

---

## 6. Logo Fabbrix — SVG arancione

**File:** `public/img/icons/fabbrix.svg`

- Modificata la classe CSS interna: `fill: #FFFFFF` → `fill: #ff6600`
- Il logo è ora arancione Fabbrix su sfondo trasparente, utilizzato come placeholder thumbnail in Job Status

---

## Dipendenze aggiunte (devDependencies)

| Pacchetto | Versione | Utilizzo |
|-----------|----------|---------|
| `@resvg/resvg-js` | `^2.6.2` | Render SVG → PNG per generazione icone |

---

## Script npm disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run gen:icons` | Rigenera tutte le icone PWA da `favicon.svg` |

---

## Struttura file modificati / aggiunti

```
public/img/icons/
  fabbrix.svg              ← lettere arancioni #ff6600
  favicon.svg              ← sorgente per gen:icons
  favicon-16x16.png        ┐
  favicon-32x32.png        │
  android-chrome-*.png     ├─ generati da gen:icons
  apple-touch-icon-*.png   │
  msapplication-*.png      │
  mstile-150x150.png       ┘

scripts/
  generate-icons.js        ← genera icone PWA

src/components/panels/ToolsPanel/ControlList/
  ControlList.vue          ← 4 colonne, colspan aggiornati
  ToolRows.vue             ← icona-only, stato sotto temp
  HeaterRows.vue           ← stato integrato nella th

src/routes/Job/
  Status.vue               ← placeholder fabbrix.svg
```
