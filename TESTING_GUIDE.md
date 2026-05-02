# 🧪 Testing Guide - Touch Display 1080x1920

## Setup Chrome DevTools

### Step 1: Aprire DevTools
```
Windows/Linux: F12 or Ctrl+Shift+I
Mac: Cmd+Shift+I
```

### Step 2: Attivare Device Emulation
```
Ctrl+Shift+M (Windows/Linux)
Cmd+Shift+M (Mac)
```

### Step 3: Configurare Device 1080x1920
```
1. Click "Responsive" dropdown (top-left)
2. Select "Edit custom devices..."
3. Click "Add custom device"
4. Name: "DuetTouch1080"
5. Width: 1080
6. Height: 1920
7. DPR: 2.75 (represents high-density mobile)
8. Click "Add"
```

### Step 4: Selezionare Device
```
Refresh page → Dropdown → select "DuetTouch1080"
```

---

## 🧬 Testing Breakdown

### Section 1: Navigation & Layout
**URL:** `http://localhost:8080/`

**Visual Checks:**
```
┌─────────────────────────────┐
│ [☰] Machine Name [emergency]│ <- AppBar OK?
├─────────────────────────────┤
│ [├] Content 1080px wide    │ <- Full width?
│ (Drawer should be 48px)    │
│                             │
│ NO HORIZONTAL SCROLL?       │ <- CRITICAL
│                             │
├─────────────────────────────┤
│ [Nav] [Nav] [Nav] [Nav] [≡]│ <- BottomNav visible?
└─────────────────────────────┘
```

**Checks:**
- [ ] Drawer minimized to icons (≈48px)
- [ ] Bottom navigation shows
- [ ] No horizontal scrollbar at bottom
- [ ] Menu button toggles drawer
- [ ] Content spans full 1080px width

---

### Section 2: Job Status Page
**URL:** `http://localhost:8080/#/Job/Status`

**Expected Layout (Single Column Portrait):**
```
1. Job Progress Bar
   ▰▰▰▰▰▰▰▱▱ 75% (2.5 MB/3.3 MB)

2. Job Control Panel (FULL WIDTH)
   [Start] [Pause] [Cancel]
   Buttons should be:
   - 48px height minimum
   - Visible padding around text

3. Z Babystep Panel (FULL WIDTH)
   Z Offset: +0.05mm
   [−] [Accept] [+]

4. Job Info Panel (FULL WIDTH)
   Time: 02:30
   Layers: 145/256
   Remaining: 1h 15m

5. Layer Chart (FULL WIDTH - LARGE!)
   ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁
   Should be ~500px tall
   ✅ THIS WAS HIDDEN BEFORE!

6. Job Estimations (FULL WIDTH)

7. Job Data (FULL WIDTH)

8. Speed Factor (FULL WIDTH)

9. Fans Panel (FULL WIDTH)

10. Extrusion Factors (FULL WIDTH)
```

**Critical Checks:**
- [ ] **NO horizontal scroll** (most important!)
- [ ] All components visible full-width
- [ ] **Chart NOW visible** (was hidden)
- [ ] **Chart large** (≥400px height)
- [ ] Buttons 48px height
- [ ] Font readable (15px+)
- [ ] Spacing adequate

**Test Interaction:**
- [ ] Click "Start" button - works?
- [ ] Adjust speed slider - smooth?
- [ ] Toggle Z babystep - responsive?
- [ ] Scroll chart - interactive?

---

### Section 3: Machine Position (StatusPanel)
**Location:** On Job Status page, scroll down to find StatusPanel

**Before (PROBLEMATIC):**
```
Position: X: 120.5  Y: 85.3  Z: 0.2  E0: 5.2  E1: 3.1  E2: 2.8
                                                          ↑ OVERFLOW!
```

**After (FIXED - 2-column grid on portrait):**
```
Machine Position

X: 120.5mm        Z: 0.20mm
Y: 85.30mm        E0: 5.20mm
E1: 3.10mm        E2: 2.80mm
E3: 4.50mm        E4: 6.10mm
```

**Checks:**
- [ ] NO text overlap
- [ ] NO horizontal scroll on this section
- [ ] All axis values visible
- [ ] 2-column grid layout (2 per row)
- [ ] Font 15px readable
- [ ] Probe values formatted correctly

---

### Section 4: Dashboard Page
**URL:** `http://localhost:8080/#/Control/Dashboard`

**Expected Layout:**
```
Movement Panel (full-width)
├─ X/Y/Z movements
├─ Extrude controls
└─ Fan controls

MacroList (should be below, not right!)
├─ Calibrate
├─ Print Settings
└─ Park Up
```

**Checks:**
- [ ] Movement panel full-width
- [ ] NO right-side macro column
- [ ] MacroList below on portrait
- [ ] Back to side-by-side on desktop (1600px)

---

### Section 5: Responsive Testing
**Test Multiple Resolutions:**

#### xs (< 600px)
```
iphone 12: 390x844
Tab: 390x390
- [ ] Still functional?
- [ ] Font still readable?
- [ ] No weird overlaps?
```

#### sm (600-959px)
```
Nexus 7: 600x960
iPad mini: 768x1024
- [ ] 2-column grid works?
- [ ] Decent spacing?
```

#### portrait_touch (1080px) ← PRIMARY
```
1080x1920
- [ ] Single column layout
- [ ] Bottom nav shows
- [ ] NO horizontal scroll
- [ ] Tap targets 48px
```

#### md (960-1263px)
```
iPad: 1024x768 (landscape)
- [ ] Multi-column layout?
- [ ] Drawer restored?
```

#### lg+ (1264px+)
```
Desktop: 1600x900
- [ ] Original layout completely?
- [ ] NO regressions?
- [ ] Drawer normal width?
```

---

## ✅ Test Checklist

### Layout Tests
- [ ] 1080x1920: Zero horizontal scroll
- [ ] 1080x1920: Single column full-width
- [ ] 1080x1920: Bottom nav visible
- [ ] 1080x1920: Drawer 48px icon-only
- [ ] 1600x900: Desktop layout unchanged
- [ ] 600x960: Intermediate layout OK

### UI Tests
- [ ] Buttons 48px minimum height
- [ ] List items 44px minimum
- [ ] Input fields 44px height
- [ ] Chart visible & large (500px+)
- [ ] Font sizes: 15px (body), 18px (titles)
- [ ] Spacing adequate, not cramped

### Interaction Tests
- [ ] Button clicks responsive
- [ ] Sliders smooth
- [ ] Menu drawer opens/closes
- [ ] Bottom nav navigation works
- [ ] Scroll smooth & performant
- [ ] No lag on interactions

### Regression Tests
- [ ] Desktop (1600px+) looks same
- [ ] All menus still accessible
- [ ] No broken components
- [ ] No console errors
- [ ] Console warnings minimal

### Touch-Specific Tests (if device available)
- [ ] Fingers fit inside tap targets
- [ ] No accidental multi-taps
- [ ] Scrolling fluid
- [ ] Keyboard doesn't cover inputs

---

## 📊 Expected Sizes (Measure with DevTools)

| Element | Expected | Actual | ✓/✗ |
|---------|----------|--------|-----|
| Buttons | ≥48px | ___ | |
| List items | ≥44px | ___ | |
| Input fields | ≥44px | ___ | |
| Body text | ≥15px | ___ | |
| Titles | ≥18px | ___ | |
| Drawer width | ≤48px | ___ | |
| Chart height | ≥400px | ___ | |
| Page width | ≤1080px | ___ | |

---

## 🔧 DevTools Tips

### Measure Elements
```
Right-click element → Inspect
Look at "Styles" panel → Size info
Or use:
- Measure Tool (Ctrl+Shift+P → "Measure")
- Computed tab for actual sizes
```

### Test Performance
```
DevTools → Performance tab
1. Start recording (Ctrl+Shift+E)
2. Interact with page
3. Stop recording
4. Check for janky frames or long tasks
```

### Check Layout Issues
```
DevTools → Elements/Inspector
1. Hover elements
2. Look for red overflow indicators
3. Check margin/padding collapse
```

### Console Errors
```
DevTools → Console
Should be clean of errors
Warnings OK but should be minimal
```

---

## 🐛 Troubleshooting

### Horizontal Scroll Still Appears
```
1. Check DevTools width is exactly 1080px
2. Look for elements with width: 100vw
3. Check for no-wrap flex containers
4. Verify overflow: hidden on parent
```

### Tap Targets Still Small
```
1. Right-click button → Inspect
2. Check computed height
3. Look for padding override
4. Check for max-height constraint
5. Verify media query applied
```

### Chart Not Visible
```
1. On Job Status page
2. Scroll down to find chart
3. Should be in middle of page
4. Height should be ~500px
5. If hidden, check display: none style
```

### Drawer Won't Minimize
```
1. Refresh page at 1080px width
2. Check isPortraitTouch computed
3. Look at drawer :width prop
4. Check Vuetify breakpoint detection
```

---

## 📸 Screenshots to Collect

For documentation, take screenshots of:
1. 1080x1920 Status page (full scroll)
2. StatusPanel axis section (2-column grid)
3. Chart (large, 500px height)
4. Buttons (48px visible)
5. Mobile 600px comparison
6. Desktop 1600px comparison

---

## ✉️ Report Template

```
TESTING REPORT - Touch Display 1080x1920
Date: [date]
Tester: [name]

### Status
- [ ] PASSED - No issues
- [ ] PASSED WITH NOTES - See below
- [ ] FAILED - Issues found

### Issues Found
1. [Issue description]
   Reproduction: [steps]
   Severity: [High/Medium/Low]
   Screenshot: [attached]

2. ...

### Regression Tests
- [ ] Desktop 1600px: OK / Issues
- [ ] Intermediate 960px: OK / Issues
- [ ] Mobile 600px: OK / Issues

### Notes
[Any additional observations]

### Signed Off
[Tester name] - [Date]
```

---

**Ready to test!** 🎉

Start with Step 1 above, then work through Section 2 (Job Status) as the primary test area.
