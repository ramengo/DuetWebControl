# Guida colori popup e pulsanti nelle macro

## Comando M291 — sintassi base

```gcode
M291 P"messaggio" R"titolo" S[modalità] T[timeout_secondi]
```

| Param | Significato |
|---|---|
| `P"..."` | Corpo del messaggio |
| `R"..."` | Titolo del popup |
| `S0` | Solo messaggio, scompare da solo (non bloccante) |
| `S1` | Solo OK |
| `S2` | OK + Annulla |
| `S3` | Solo chiudi (persistente) |
| `S4` | Scelte multiple (usa `K`) |
| `T`  | Secondi prima di chiusura automatica (0 = mai) |

---

## Colore bordo sinistro del popup

Aggiungi il prefisso al testo del messaggio (`P"..."`):

| Prefisso | Colore bordo | Icona | Uso tipico |
|---|---|---|---|
| `[I]` | Arancione `#f38321` | ℹ️ informazione | messaggi informativi |
| `[W]` | Rosso `#f44336` | ⚠️ attenzione | avvertimenti, errori |
| `[S]` | Verde `#4caf50` | ✅ successo | operazione completata |
| `[M]` | Ciano `#13cccf` | ↕️ movimento | operazioni asse/jog |

Il prefisso viene rimosso automaticamente dal testo visualizzato.

```gcode
; Popup informativo (bordo arancione)
M291 P"[I] Caricamento filamento completato" R"Info" S1

; Popup avviso (bordo rosso)
M291 P"[W] Temperatura ugello troppo bassa" R"Attenzione" S2

; Popup successo (bordo verde)
M291 P"[S] Calibrazione completata" R"OK" S1

; Popup movimento (bordo ciano)
M291 P"[M] Posizionare la testa sulla vite" R"Calibrazione" S2
```

---

## Colore pulsanti nelle scelte multiple (S4)

Con `S4` e `K"scelta1","scelta2"` puoi avere due righe di pulsanti con stili diversi.

### Riga 1 — stile glassmorphism (sfondo trasparente, bordo bianco)

Pulsanti **senza prefisso** nel testo della scelta:

```gcode
M291 P"Scegli materiale" R"Materiale" K"PLA","PETG","ABS" S4
```

### Riga 2 — stile HMI industriale (sfondo scuro, bordo colorato)

Pulsanti **con prefisso** nel testo della scelta:

| Prefisso | Colore bordo | Uso tipico |
|---|---|---|
| `[W]` | Arancio-rosso `#ff5722` | azione pericolosa / stop |
| `[O]` | Verde `#4caf50` | azione positiva / conferma |
| `[K]` | Viola `#7c4dff` | azione secondaria / info |

Il prefisso viene rimosso dal testo del pulsante.

```gcode
; Mix riga 1 (normale) + riga 2 (colorati)
M291 P"Scegli azione" R"Azione" K"Info","[O] Avvia","[W] Stop","[K] Dettagli" S4
```

→ "Info" finisce in riga 1 (glassmorphism)  
→ "Avvia" in riga 2, bordo verde  
→ "Stop" in riga 2, bordo arancio-rosso  
→ "Dettagli" in riga 2, bordo viola  

---

## Recuperare la scelta dell'utente

```gcode
M291 P"Procedi?" R"Conferma" K"[O] Sì","[W] No" S4
M292 ; attende risposta
; result in {input} — indice 0-based della scelta
if input == 0
    ; ha scelto "Sì"
else
    ; ha scelto "No"
```

---

## Esempi pratici

### Avviso porta aperta

```gcode
M291 P"[W] Chiudere la porta prima di avviare la stampa" R"Porta aperta" S2 T30
```

### Conferma caricamento filamento

```gcode
M291 P"[M] Inserire il filamento nell'estrusore" R"Caricamento" K"[O] Fatto","[W] Annulla" S4
M292
if input == 0
    G1 E50 F300  ; estrusione
```

### Fine stampa con scelte

```gcode
M291 P"[S] Stampa completata!" R"Fine stampa" K"[O] Nuovo lavoro","Lascia fermo","[W] Spegni" S4
M292
if input == 0
    M0              ; home e attendi
elif input == 2
    M81             ; spegni alimentazione
```

### Input numerico

```gcode
; S6 = input intero, S7 = input float
M291 P"Temperatura ugello" R"Imposta temp" S6 F180 L300
M292
G10 P0 S{input}  ; imposta temperatura tool 0
```

---

## Tabella riassuntiva prefissi

| Contesto | Prefisso | Effetto |
|---|---|---|
| Messaggio `P` | `[I]` | bordo arancione + icona info |
| Messaggio `P` | `[W]` | bordo rosso + icona alert |
| Messaggio `P` | `[S]` | bordo verde + icona check |
| Messaggio `P` | `[M]` | bordo ciano + icona freccia |
| Scelta `K` | *(nessuno)* | pulsante riga 1, stile glass |
| Scelta `K` | `[W]` | pulsante riga 2, bordo rosso |
| Scelta `K` | `[O]` | pulsante riga 2, bordo verde |
| Scelta `K` | `[K]` | pulsante riga 2, bordo viola |
