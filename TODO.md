# TODO — DuetWebControl branch 3.6_it_modbosch

## Prossimi miglioramenti

### M292 / Consenso
- [ ] Aggiungere effetto pulse/animazione alla campanella quando il messaggio è attivo (stile "notifica viva")
- [ ] Valutare se mostrare la campanella anche in modalità portrait touch (attualmente il dialog fullscreen ha già i suoi pulsanti)
- [ ] Mostrare un badge con il titolo del messaggio in attesa nel tooltip

### Filamento
- [ ] Aggiungere voce "Filamento non presente" anche quando il filamento NON è caricato (ramo `v-else` in ToolRows.vue — link diretto senza dropdown)
- [ ] Aggiungere dialog di conferma prima di eseguire `clearFilament` (per evitare click accidentali)
- [ ] Supporto multi-tool: pulsante bulk "azzera tutti i filamenti" per reset rapido dopo cambio configurazione

### Porta / Interblocco
- [ ] Aggiungere feedback visivo (colore / lampeggio) sull'icona porta quando l'interblocco scatta durante la stampa
- [ ] Separare l'icona porta dall'icona piano in un pannello dedicato in modalità portrait

### Generale UI
- [ ] Revisione breakpoint `portraitTouch`: verificare comportamento su risoluzioni intermedie (es. tablet 768px landscape)
- [ ] Aggiungere tasto rapido "Home All" nella toolbar portrait (attualmente accessibile solo dalla pagina Control)
- [ ] Valutare dark/light mode toggle nella toolbar

### JobCarouselPanel
- [ ] Tab "Speed": aggiungere controllo override feedrate con slider
- [ ] Memorizzare l'ultimo tab attivo nel localStorage per riaprirlo al refresh
