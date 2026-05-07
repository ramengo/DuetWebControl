# 📱 AUDIT RESPONSIVITÀ - Display Touch 1080x1920 (Portrait)
**Data:** 2026-04-30 | **Risoluzione Target:** 1080x1920px (vertical, ~5.5-6.7") | **DPI:** ~400-450 (high density)

---

## 🔴 PROBLEMI CRITICI IDENTIFICATI

### 1. **Mancanza Breakpoint Personalizzato**
| Aspetto | Status | Impatto |
|---------|--------|--------|
| **Breakpoints attuali** | xs(<600px), sm(600-960px), md, lg, xl | ❌ 1080px cade in `sm` (troppo stretto per 3-col layout) |
| **Drawer width** | 256px (desktop) / 275px (smAndDown) | ⚠️ 275px su 1080px = 25% dello schermo |
| **Bottom nav** | Attiva solo se `mobile && !xsOnly` | ❌ Non attiva su 1080px (breakpoint problem) |
| **Viewport meta** | `width=device-width, initial-scale=1, user-scalable=0` | ✅ Corretto, zoom bloccato |

**File interessato:** `/src/main.ts:26-34`

**Problema specifico:**
```javascript
// Attualmente 1080px breakpoint=sm
// Su Status.vue (Status.vue:11) -> dense=true su mobile
// Ma 1080px ≠ "mobile" per Vuetify logic
```

---

### 2. **Layout Job Status Subottimale per Portrait**
**File:** `/src/routes/Job/Status.vue` (righe 8-77)

#### Problema A: Multi-colonna su schermo stretto
```vue
<!-- ATTUALE - Non ottimale per 1080x1920 -->
<v-col order="1" cols="12" sm="6" md="3" xl="2">  <!-- 50% width su 1080px -->
  <!-- Job Control, Z-Babystep, etc -->
</v-col>

<v-col order="0" cols="12" md="5" xl="7">  <!-- Hidden su <960px -->
  <!-- Layer Chart -->
</v-col>

<v-col order="2" cols="12" sm="6" md="4" xl="3">  <!-- 50% width su 1080px -->
  <!-- Fans, Speed Factors -->
</v-col>
```

**Risultato su 1080x1920:**
- 2 colonne side-by-side = **540px ciascuna** (stretto)
- Chart nascosto (hidden-sm-and-down)
- Scrolling orizzontale non gestito bene

#### Problema B: Dense mode non sufficientemente aggressivo
```vue
<v-row class="mt-0" :dense="$vuetify.breakpoint.mobile">
```
→ Su 1080px, `$vuetify.breakpoint.mobile` è **false** (perché non è xsOnly)

---

### 3. **StatusPanel Problematico su Portrait**
**File:** `/src/components/panels/StatusPanel.vue` (righe 55-100)

#### Problema: Overflow orizzontale su assi/estrusori
```vue
<v-row align-content="center" no-gutters class="flex-nowrap">
  <v-col tag="strong" class="category-header">  <!-- 100px width fisso -->
    Machine Position
  </v-col>
  
  <v-col>
    <v-row align-content="center" no-gutters>
      <!-- Tutte le posizioni assi in riga... -->
    </v-row>
  </v-col>
</v-row>
```

**Su 1080px:**
- 100px header + 6+ assi (X,Y,Z,E0,E1...E4) = **Overflow orizzontale**
- Text si sovrappone: `.probe-span` width=60px fisso, margin 8px
- Calcolo: 100px + (6 × 68px) = 508px > spazio disponibile

**Font size critico:**
```css
/* StatusPanel non ha media query per font */
/* DefaultValue: 1rem = 16px su mobile */
/* Risultato: molto piccolo su 1080x1920 ad alta densità */
```

---

### 4. **FFFDashboardPanel Layout Rigido**
**File:** `/src/components/panels/FFFDashboardPanel.vue` (righe 1-32)

#### Problema: MacroList sempre a destra
```vue
<v-col class="hidden-xs-only" sm="4" md="4" lg="3" xl="3">
  <macro-list />
</v-col>
```
- Su 1080px: macro-list = 33% width (~360px) 
- Main content = 66% width (~720px)
- **Non ideale per portrait**: lista di macro su schermo così stretto preferibilmente sotto

---

### 5. **WebcamPanel Non Responsive Height**
**File:** `/src/components/panels/WebcamPanel.vue` (righe 62-77)

```vue
<v-responsive v-if="webcam.embedded" :aspect-ratio="16/9">
  <iframe :src="webcam.url"></iframe>
</v-responsive>
```

**Problema:**
- Aspect ratio fisso 16:9
- Su 1080px width: 16:9 = 1080px × 607.5px = **50% altezza schermo**
- In portrait scrolling verticale, viewer ideale sarebbe ~60-70% di area viewport

---

### 6. **Tap Targets & Touch UX**
**File:** Distribuito tra `/src/components/`

| Elemento | Dimensione Attuale | Standard Touch | Status |
|----------|-------------------|-----------------|--------|
| v-btn (default) | ~36px height | 48x48px | ⚠️ Sottodimensionato |
| v-list-item | ~32px height | 48x48px min | ⚠️ Sottodimensionato |
| v-icon (small) | 24px | 32px consigliato | ⚠️ Piccolo |
| Bottom nav item | ~48px | 48x48px | ✅ OK |
| Drawer items | ~32px | 44px min | ⚠️ Sottodimensionato |

**Problema specifico dialoghi/modali:**
- Input field height: ~24-28px (default Material)
- Standard touch: 44px minimo
- No custom padding su mobile per input

---

### 7. **Media Query & Font Scaling Inconsistente**
**Files:** Sparse in componenti

**Trovato:**
- ✅ `CNCAxesPosition.vue`: font 30px mobile, 50px desktop (buono)
- ❌ `StatusPanel.vue`: nessuna media query
- ❌ `FFFDashboardPanel.vue`: nessuna media query
- ❌ Dialoghi: font-size fisso 1.5em-1.7em

**Impatto:** Su display 1080x1920 (400+ dpi), text da 16px appare molto piccolo fisicamente

---

## 🟡 PROBLEMI SECONDARI

### 8. **Keyboard Virtual Space Management**
- Meta viewport non ha `viewport-fit=cover`
- No CSS `env(safe-area-inset-*)` per notch/bottom bar
- Dialoghi non hanno `max-height: calc(100vh - keyboard-height)`

### 9. **Overflow Scrolling Tidak Dioptimalkan**
- No `smooth` scroll behavior su liste
- No scroll-snap per navigation
- Console/event lists: scrolling nativo, no virtualization visibile

### 10. **Bottom Navigation Logic Buggato**
```javascript
// App.vue:148
showBottomNavigation(): boolean {
  return this.$vuetify.breakpoint.mobile && 
         !this.$vuetify.breakpoint.xsOnly && 
         store.state.settings.bottomNavigation;
}
```
**Problema:** 1080px = `mobile:true` ma `xsOnly:false` → dovrebbe mostrare bottom nav
**Ma:** Layout status.vue assume top drawer → confusione visiva

---

## ✅ COMPONENTI GIÀ OTTIMIZZATI

1. ✅ **WebcamPanel** - Aspect ratio responsive
2. ✅ **App.vue** - Meta viewport corretto
3. ✅ **Bottom navigation** - Esiste, ma logic inconsistente
4. ✅ **Keep-alive router** - Performance OK

---

## 📊 MOCKUP LAYOUT COMPARATIVI

### Attuale (Problematico) - 1080x1920
```
┌─────────────────────────────────────────┐
│ [☰] Machine Name          [☒]           │ <- AppBar ~56px
├──────────────────┬──────────────────────┤
│                  │                      │ <- Drawer (275px) + Content
│  DRAWER          │  STATUS              │
│  275px wide      │  2-col layout:       │
│  [Control]       │  Left 50% (540px)    │
│  [Job]           │  Right 50% (540px)   │
│  [Files]         │  -> OVERFLOW on row  │
│  [Settings]      │     of axes labels!  │
│                  │                      │
│  Macro List      │  Chart HIDDEN        │
│  ├─Calibrate    │  (hidden-sm-and-down)│
│  ├─Print        │                      │
│                  │                      │
├─────────────────┼──────────────────────┤
│ [Btn] [Btn] [Btn] [Btn] [Btn]          │ <- BottomNav ~56px (if shown)
└─────────────────┴──────────────────────┘
HEIGHT USED: 56px (top) + 1920px - 56px (bottom) = FULL
Problemi:
- 2 colonne su 1080px = troppo stretto
- Drawer 275px = spazio perso 
- Assi si sovrappongono orizzontalmente
- Font piccolo su alta densità
```

### Proposto (Ottimizzato) - 1080x1920
```
┌───────────────────────────────────────────┐
│ [☰] Machine          [🔋] [🔒]            │ <- AppBar compact ~48px
├───────────────────────────────────────────┤
│                                           │
│  📊 JOB PROGRESS (big visual)             │
│  ▰▰▰▰▰▰▰▱▱ 75%                            │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Control Panel (full width)          │  │
│  │ [START] [PAUSE] [CANCEL]            │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Machine Position (responsive stack)│  │
│  │ X: 120.5mm  Y: 85.3mm              │  │
│  │ Z: 0.2mm                           │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Extruders (tab-able or stack)       │  │
│  │ E0: 210°C ↔ 215°C  Heater: ◐      │  │
│  │ E1: 200°C                          │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ 📈 Layer Chart (taller, 400px)     │  │
│  │                                     │  │
│  │  Z Height Line Graph                │  │
│  │  [responsive height]                │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Fans / Speed Factors                │  │
│  └─────────────────────────────────────┘  │
│                                           │
├───────────────────────────────────────────┤
│ [Control] [Job] [Files] [Settings] [•••] │ <- BottomNav full-width
└───────────────────────────────────────────┘

Miglioramenti:
✅ Full width (no drawer on portrait)
✅ Stack verticale componenti
✅ Font sizes aumentati (leggibilità)
✅ Tap targets ≥48px
✅ Chart più grande (70% viewport)
✅ Bottom nav sempre visibile
```

---

## 🎯 RACCOMANDAZIONI PRIORITÀ

### **P0 - CRITICO** (Implementare SUBITO)
1. **Aggiungere breakpoint personalizzato** `portrait_touch: 1080`
2. **Modificare bottom navigation logic** per attivare su 1080px
3. **Fissare tap targets** a minimo 44-48px su mobile
4. **Ricalcolare layout Status.vue** per single-column su portrait

### **P1 - ALTO**
5. **Font scaling media query** per StatusPanel
6. **StatusPanel axis overflow** - stack verticale on narrow widths
7. **WebcamPanel height** - responsive aspect ratio
8. **Drawer auto-hide** su portrait (o ridimensionare a ~48px icon-only)

### **P2 - MEDIO**
9. Keyboard virtual keyboard management (env safe-area)
10. Smooth scroll optimization
11. Macro list repositioning on portrait
12. Input field height standardization

---

## 💾 FILE CHIAVE DA MODIFICARE

```
PRIORITÀ ALTA:
├── src/main.ts                          (Vuetify breakpoints config)
├── src/App.vue                          (Bottom nav logic, drawer responsivity)
├── src/routes/Job/Status.vue            (Layout multi-col → single-col)
├── src/components/panels/StatusPanel.vue (Axis overflow, font scaling)
├── src/components/panels/WebcamPanel.vue (Height responsivity)
└── src/components/panels/FFFDashboardPanel.vue (MacroList repositioning)

PRIORITÀ MEDIA:
├── src/scss/variables.scss              (Font sizes, breakpoints)
├── src/components/lists/MacroList.vue   (Layout on portrait)
└── src/components/dialogs/**            (Input field sizing)
```

---

## 📈 METRICHE USCITA AUDIT

| Metrica | Prima | Dopo | Target |
|---------|-------|------|--------|
| Tap target size | 24-36px avg | 48px min | ✅ |
| Colonne layout portrait | 2-3 | 1 | ✅ |
| Horizontal scroll | Presente | Zero | ✅ |
| Font size legible % | 70% | 95% | ✅ |
| Drawer width on portrait | 275px (25%) | 0px or 48px icon | ✅ |

---

**Prossimo Passo:** Implementare P0 items (breakpoint + bottom nav + tap targets)
**Tempo Stimato P0:** 2-3 ore | **P0+P1:** 6-8 ore
