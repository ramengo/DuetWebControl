# Guida ai Dialog M291 — DuetWebControl Fabbrix

Questa guida descrive il comportamento personalizzato del comando `M291` nell'interfaccia DuetWebControl utilizzata sulle stampanti Fabbrix. Tramite specifici **prefissi** nel testo del messaggio e nelle scelte dei pulsanti, è possibile controllare colori, icone e layout del dialog.

---

## Comando base M291

```gcode
M291 P"testo messaggio" R"titolo" S<modo> [B1] [K"scelta0|scelta1|..."]
```

| Parametro | Descrizione |
|-----------|-------------|
| `P"..."` | Testo del corpo del messaggio |
| `R"..."` | Titolo del dialog (visualizzato in maiuscolo) |
| `S0` | Solo notifica, nessun pulsante |
| `S1` | Pulsante **OK** (persistente) |
| `S2` | Pulsanti **OK** + **Annulla** |
| `S3` | Scelte multiple (richiede `K`) |
| `B1` | Mostra pulsante di emergenza sovrapposto |

---

## Prefissi messaggio — colore bordo e icona

Aggiungendo un prefisso all'inizio del parametro `P`, l'interfaccia applica automaticamente una **barra colorata** sul lato sinistro del dialog e un'**icona** sopra il testo.

Il prefisso viene rimosso dal testo visualizzato.

### Tabella prefissi

| Prefisso | Tipo | Colore bordo | Icona |
|----------|------|-------------|-------|
| `[I]` | Informazione | 🟠 Arancione `#f38321` | `ⓘ` informazione |
| `[W]` | Avvertimento | 🔴 Rosso `#f44336` | `⚠` alert |
| `[S]` | Successo | 🟢 Verde `#4caf50` | `✓` check-circle |
| `[M]` | Movimento | 🩵 Ciano `#13cccf` | `↕` arrow-up-down |
| *(nessuno)* | Neutro | nessuna barra | nessuna icona |

### Esempi GCode

```gcode
; Messaggio informativo (bordo arancione, icona ⓘ)
M291 P"[I] Cambio filamento in corso" R"Informazione" S1

; Avvertimento (bordo rosso, icona ⚠)
M291 P"[W] Temperatura ugello elevata — procedere con cautela" R"Attenzione" S2

; Conferma operazione riuscita (bordo verde, icona ✓)
M291 P"[S] Calibrazione completata con successo" R"Completato" S1

; Dialog di movimento asse (bordo ciano, icona ↕)
M291 P"[M] Posizionare l'asse Z manualmente" R"Movimento" S2 Z1

; Messaggio neutro (nessun bordo, nessuna icona)
M291 P"Operazione in corso, attendere..." R"Info" S0
```

---

## Prefissi scelte — stile pulsanti riga 2

Quando si usa la modalità scelta multipla (`S3` con `K`), i testi delle scelte possono avere prefissi che le spostano in una **seconda riga** con uno stile HMI industriale (sfondo scuro, accento colorato sul bordo sinistro).

Le scelte **senza prefisso** appaiono nella riga 1 (stile glassmorphism trasparente).  
Le scelte **con prefisso** appaiono nella riga 2 (stile HMI industriale).

### Tabella prefissi scelte

| Prefisso | Colore accento bordo sinistro | Uso consigliato |
|----------|-------------------------------|-----------------|
| `[W]` | 🔴 Arancio-rosso `#ff5722` | Azioni di avvertimento / rischio |
| `[O]` | 🟢 Verde `#4caf50` | Azioni di conferma / ok |
| `[K]` | 🟣 Viola `#7c4dff` | Azioni speciali / alternative |

> Il prefisso viene rimosso automaticamente dal testo del pulsante visualizzato.

### Esempio GCode con scelte miste

```gcode
; Riga 1: scelte senza prefisso (glassmorphism)
; Riga 2: scelte con prefisso [W]/[O]/[K] (HMI industriale)
M291 P"[W] Selezionare l'azione da eseguire" R"Scelta operazione" S3 K"Annulla|[O] Conferma|[W] Forza reset|[K] Modalità manuale"
```

Risultato:
- **Riga 1 (glassmorphism):** `Annulla`
- **Riga 2 (HMI industriale):** `Conferma` (verde) · `Forza reset` (arancio-rosso) · `Modalità manuale` (viola)

Il valore restituito con `M292 R{n}` corrisponde all'indice della scelta nell'elenco originale (0-based), indipendentemente dalla riga di visualizzazione.

---

## Combinazioni messaggio + scelte

I prefissi del messaggio (`[I]`, `[W]`, `[S]`, `[M]`) e i prefissi delle scelte (`[W]`, `[O]`, `[K]`) sono **indipendenti** e possono essere combinati liberamente.

```gcode
; Avvertimento con scelte HMI
M291 P"[W] Errore sensore filamento T0. Come procedere?" R"Errore filamento" S3 K"[O] Ignora e continua|[W] Pausa stampa|[K] Sostituisci filamento"

; Info con scelte standard
M291 P"[I] Fine pre-riscaldo. Pronto per caricare il filamento." R"Pronto" S3 K"Carica ora|Annulla"

; Successo senza scelte (solo OK)
M291 P"[S] Nozzle offset aggiornato correttamente." R"Calibrazione" S1
```

---

## Riepilogo visivo

```
┌─────────────────────────────────────────┐
│  TITOLO (MAIUSCOLO)                     │
│─── ← barra colore (se prefisso)        │
│                                         │
│         [icona]  (se prefisso)          │
│                                         │
│    Testo del messaggio centrato         │
│    su più righe se necessario           │
│                                         │
│  ┌──────────┐  ┌──────────┐            │ ← riga 1: glassmorphism
│  │  Scelta  │  │  Scelta  │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │ ← riga 2: HMI industriale
│  │[W] Azione│  │[O] Azione│            │   (solo se presenti prefissi)
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

---

## Note pratiche

- I prefissi sono **case-sensitive**: `[I]` funziona, `[i]` no.
- Lo spazio dopo il prefisso è opzionale: `[I]Testo` e `[I] Testo` sono equivalenti.
- Per preservare gli **a-capo** nel testo usare `\n` all'interno della stringa P: il renderer li rispetta.
- Il parametro `B1` mostra il pulsante di emergenza sovrapposto in alto a destra — utile per dialog persistenti dove si vuole sempre permettere uno stop.
- `M292` viene inviato automaticamente dall'interfaccia al click su qualsiasi pulsante. Nelle macro che attendono la risposta, il firmware si sblocca automaticamente.
