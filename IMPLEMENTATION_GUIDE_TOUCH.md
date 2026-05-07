# 🛠️ PIANO DI IMPLEMENTAZIONE - Display Touch 1080x1920

## FASE 1: Setup Breakpoint Personalizzato (1-2 ore)

### Step 1.1: Aggiungere Custom Breakpoint
**File: `/src/main.ts`**

```typescript
// Aggiungere prima di new Vue()
const vuetifyTheme = new Vuetify({
  breakpoint: {
    mobileBreakpoint: "sm",  // keep default
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1264,
      xl: 1904,
      // NUOVO
      portrait_touch: 1080   // Custom breakpoint per 1080x1920
    }
  },
  theme: {
    dark: (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) || false
  },
  // ... rest
});

export default new Vue({
  // ...
  vuetify: vuetifyTheme
});
```

### Step 1.2: Aggiornare App.vue Bottom Nav Logic
**File: `/src/App.vue` (righe 147-149)**

```javascript
// ATTUALE
showBottomNavigation(): boolean {
  return this.$vuetify.breakpoint.mobile && 
         !this.$vuetify.breakpoint.xsOnly && 
         store.state.settings.bottomNavigation;
}

// NUOVO - Su 1080px, mostrare bottom nav
showBottomNavigation(): boolean {
  const isPortraitTouch = !this.$vuetify.breakpoint.lgAndUp;  // < 1264px
  return (this.$vuetify.breakpoint.mobile || isPortraitTouch) && 
         !this.$vuetify.breakpoint.xsOnly && 
         store.state.settings.bottomNavigation;
}
```

### Step 1.3: Drawer Auto-Hide su Portrait
**File: `/src/App.vue` (righe 3-5, 159)**

```vue
<!-- ATTUALE -->
<v-navigation-drawer v-if="!showBottomNavigation" 
                     v-model="drawer" 
                     clipped fixed app
                     :width="$vuetify.breakpoint.smAndDown ? 275 : 256">

<!-- NUOVO -->
<v-navigation-drawer v-if="!showBottomNavigation" 
                     v-model="drawer" 
                     clipped fixed app
                     :permanent="!isPortraitTouch"
                     :width="drawerWidth"
                     :mini-variant="isPortraitTouch || iconMenu">

<!-- In data() -->
data() {
  return {
    drawer: this.$vuetify.breakpoint.lgAndUp,  // Changed
    // ...
  };
}

<!-- In computed -->
computed: {
  isPortraitTouch(): boolean {
    return !this.$vuetify.breakpoint.lgAndUp;  // < 1264px
  },
  drawerWidth(): number {
    if (this.isPortraitTouch) return 48;  // Icon-only
    return this.$vuetify.breakpoint.smAndDown ? 275 : 256;
  },
  // ... rest
}
```

---

## FASE 2: Fix Layout Status Page (1.5-2 ore)

### Step 2.1: Modificare Job/Status.vue Layout
**File: `/src/routes/Job/Status.vue` (righe 8-77)**

```vue
<!-- ATTUALE - 2-3 colonne -->
<v-row class="mt-0" :dense="$vuetify.breakpoint.mobile">
  <v-col order="1" cols="12" sm="6" md="3">...</v-col>
  <v-col order="0" cols="12" md="5">...</v-col>
  <v-col order="2" cols="12" sm="6" md="4">...</v-col>
</v-row>

<!-- NUOVO - Single column su portrait, multi-column su desktop -->
<v-row class="mt-0" :dense="isPortraitTouch">
  <!-- Portrait: full-width stack -->
  <v-col v-if="isPortraitTouch" cols="12">
    <v-row :dense="true">
      <v-col cols="12">
        <job-control-panel />
      </v-col>
      <v-col cols="12">
        <z-babystep-panel />
      </v-col>
      <v-col cols="12">
        <job-info-panel />
      </v-col>
    </v-row>
  </v-col>

  <!-- Desktop: original multi-column layout -->
  <v-col v-else order="1" order-md="1" cols="12" sm="6" md="3" xl="2">
    <!-- Original content -->
  </v-col>

  <!-- Chart full-width on portrait -->
  <v-col v-if="isPortraitTouch" cols="12">
    <layer-chart class="chart-height-portrait" />
  </v-col>
  
  <v-col v-else order="0" order-md="2" cols="12" md="5" xl="7" class="d-none d-sm-flex flex-column">
    <!-- Original content -->
  </v-col>

  <!-- Right panel -->
  <v-col v-else order="2" order-md="3" cols="12" sm="6" md="4" xl="3">
    <!-- Original content -->
  </v-col>
</v-row>

<!-- In script -->
export default Vue.extend({
  computed: {
    isPortraitTouch(): boolean {
      return !this.$vuetify.breakpoint.lgAndUp;
    }
  }
});

<!-- In style -->
<style scoped>
.chart-height-portrait {
  max-height: 500px !important;  /* ~60% viewport height */
  min-height: 300px;
}
</style>
```

---

## FASE 3: Fix StatusPanel Overflow (1-1.5 ore)

### Step 3.1: Responsive Axis Layout
**File: `/src/components/panels/StatusPanel.vue`**

```vue
<!-- ATTUALE - Overflow su portrait -->
<v-row align-content="center" no-gutters class="flex-nowrap">
  <v-col tag="strong" class="category-header">
    {{ ... }}
  </v-col>
  
  <v-col>
    <v-row align-content="center" no-gutters>
      <v-col v-for="(axis, index) in visibleAxes" 
             :key="index"
             class="d-flex flex-column align-center">
        <!-- axis span -->
      </v-col>
    </v-row>
  </v-col>
</v-row>

<!-- NUOVO - Stack verticale su portrait, orizzontale su desktop -->
<div v-if="isPortraitTouch" class="axis-section-portrait">
  <strong class="d-block mb-2">
    <a href="javascript:void(0)" @click="displayToolPosition = !displayToolPosition">
      {{ $t(displayToolPosition ? "..." : "...") }}
    </a>
  </strong>
  
  <v-row no-gutters>
    <v-col v-for="(axis, index) in visibleAxes"
           :key="index"
           cols="6" sm="4" md="3"
           class="d-flex flex-column align-center pa-1">
      <span class="axis-span font-weight-bold" :class="axisSpanClasses(index)">
        {{ axis.letter }}
      </span>
      <span class="axis-value">
        {{ $displayAxisPosition(axis, !displayToolPosition) }}
      </span>
    </v-col>
  </v-row>
</div>

<v-row v-else align-content="center" no-gutters class="flex-nowrap">
  <!-- Original content -->
</v-row>

<!-- In style scoped -->
<style scoped>
.axis-section-portrait {
  padding: 8px 0;
}

.axis-value {
  font-size: 14px;
  margin-top: 4px;
}

/* Media query per font scaling */
@media (max-width: 600px) {
  .content span,
  .content strong {
    font-size: 14px;
  }
  
  .probe-span {
    width: auto;
    padding: 4px 8px;
    font-size: 12px;
  }
}

@media (min-width: 601px) and (max-width: 1080px) {
  .content span,
  .content strong {
    font-size: 16px;
  }
  
  .probe-span {
    width: 70px;
    font-size: 13px;
  }
}
</style>

<!-- In script -->
export default Vue.extend({
  computed: {
    isPortraitTouch(): boolean {
      return this.$vuetify.breakpoint.width <= 1080;
    }
  }
});
```

---

## FASE 4: Tap Target Standardization (1-1.5 ore)

### Step 4.1: Creare SCSS Mixin
**File: `/src/scss/variables.scss` (o nuovo file `touch-targets.scss`)**

```scss
// Touch-friendly tap targets
$tap-target-height: 44px;  // Material Design recommended
$tap-target-height-large: 48px;
$tap-target-padding: 12px;

@mixin tap-target-sm {
  min-height: 44px;
  padding: 8px 12px;
}

@mixin tap-target-md {
  min-height: 48px;
  padding: 12px 16px;
}

@mixin tap-target-lg {
  min-height: 56px;
  padding: 16px 20px;
}

// Apply to buttons
.v-btn {
  @media (max-width: 1080px) {
    @include tap-target-md;
  }
}

// Apply to list items
.v-list-item {
  @media (max-width: 1080px) {
    min-height: 44px;
    
    .v-list-item__content {
      padding: 8px 0;
    }
  }
}

// Apply to input fields
.v-text-field,
.v-select,
.v-autocomplete {
  @media (max-width: 1080px) {
    .v-input__control {
      min-height: 44px;
    }
    
    input,
    textarea {
      padding: 8px 12px;
    }
  }
}
```

### Step 4.2: Font Scaling per Mobile
```scss
// Typography scaling
@media (max-width: 600px) {
  body {
    font-size: 14px;
  }
}

@media (min-width: 601px) and (max-width: 1080px) {
  body {
    font-size: 15px;
  }
  
  .v-card__title {
    font-size: 18px;  // was 16px
  }
  
  .v-card__text {
    font-size: 15px;  // was 14px
  }
}

@media (min-width: 1081px) {
  body {
    font-size: 16px;
  }
}
```

---

## FASE 5: WebcamPanel Height Responsivity (30-45 min)

### Step 5.1: Responsive Aspect Ratio
**File: `/src/components/panels/WebcamPanel.vue`**

```vue
<!-- ATTUALE - 16:9 fisso -->
<v-responsive v-if="webcam.embedded" :aspect-ratio="16/9">
  <iframe :src="webcam.url" :class="classList"></iframe>
</v-responsive>

<!-- NUOVO - Responsive aspect ratio -->
<v-responsive v-if="webcam.embedded" 
              :aspect-ratio="responsiveAspectRatio"
              class="webcam-responsive">
  <iframe :src="webcam.url" :class="classList"></iframe>
</v-responsive>

<!-- In script -->
export default Vue.extend({
  computed: {
    responsiveAspectRatio(): number {
      // Su portrait (1080x1920): preferire 4:3 per più altezza
      if (this.$vuetify.breakpoint.width <= 1080) {
        return 4/3;  // taller than 16/9
      }
      return 16/9;  // desktop standard
    }
  }
});

<!-- In style -->
<style scoped>
.webcam-responsive {
  max-height: 70vh;  /* 70% viewport height */
}

@media (max-width: 1080px) {
  .webcam-responsive {
    max-height: 60vh;  /* 60% on portrait */
  }
}
</style>
```

---

## FASE 6: FFFDashboardPanel MacroList Repositioning (45-60 min)

### Step 6.1: Macro List Stack on Portrait
**File: `/src/components/panels/FFFDashboardPanel.vue`**

```vue
<!-- ATTUALE - MacroList sempre a destra -->
<v-row :dense="$vuetify.breakpoint.mobile">
  <v-col cols="12" sm="8" md="8" lg="9" xl="9">
    <!-- Main panels -->
  </v-col>

  <v-col class="hidden-xs-only" sm="4" md="4" lg="3" xl="3">
    <macro-list />
  </v-col>
</v-row>

<!-- NUOVO - MacroList sotto su portrait -->
<v-row v-if="isPortraitTouch" :dense="true">
  <v-col cols="12">
    <!-- All main content full-width -->
    <movement-panel class="mb-2" />
    <extrude-panel v-if="isFFForUnset" class="mb-2" />
    <fan-panel class="mb-2" />
  </v-col>

  <v-col cols="12">
    <macro-list />
  </v-col>
</v-row>

<v-row v-else :dense="$vuetify.breakpoint.mobile">
  <!-- Original layout -->
</v-row>

<!-- In script -->
computed: {
  isPortraitTouch(): boolean {
    return !this.$vuetify.breakpoint.lgAndUp;
  }
}
```

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### FASE 1: Breakpoint & Navigation
- [ ] `src/main.ts` - Aggiungere custom breakpoint `portrait_touch: 1080`
- [ ] `src/App.vue:149` - Aggiornare showBottomNavigation logic
- [ ] `src/App.vue:3-5` - Drawer mini-variant su portrait
- [ ] Test: Bottom nav deve apparire su 1080px

### FASE 2: Status Page Layout
- [ ] `src/routes/Job/Status.vue` - Single column su portrait
- [ ] Test su browser 1080x1920
- [ ] Verificare chart visibilità e height

### FASE 3: StatusPanel Fix
- [ ] `src/components/panels/StatusPanel.vue` - Axis stack verticale
- [ ] Aggiungere media queries per font
- [ ] Test: Nessun overflow orizzontale

### FASE 4: Tap Targets
- [ ] `src/scss/variables.scss` - Creare mixins
- [ ] Applicare a buttons, list items, inputs
- [ ] Test con touch device

### FASE 5: WebcamPanel
- [ ] `src/components/panels/WebcamPanel.vue` - Aspect ratio responsive
- [ ] Test height on 1080x1920

### FASE 6: Dashboard Reorganizzazione
- [ ] `src/components/panels/FFFDashboardPanel.vue` - MacroList stack
- [ ] Test layout portrait vs desktop

### Testing Finale
- [ ] Chrome DevTools device emulation 1080x1920
- [ ] Test su tablet/device reale
- [ ] Verificare no horizontal scroll
- [ ] Verificare tap target sizes

---

## 🚀 PRIORITÀ DI MERGE

**Ordine consigliato per PR:**
1. **PR#1 - Breakpoints & Navigation** (P0) - Blocca altri lavori
2. **PR#2 - Status Layout + StatusPanel Fix** (P0)
3. **PR#3 - Tap Targets + Typography** (P1)
4. **PR#4 - WebcamPanel + Dashboard** (P2)

**Tempo totale:** ~6-8 ore di implementazione + 2-3 ore testing

---

## ⚠️ NOTA IMPORTANTE

> Prima di implementare, testare ogni change su browser con **Chrome DevTools → Device Emulation → 1080x1920** per verificare il comportamento.

