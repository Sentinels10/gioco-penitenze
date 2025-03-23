import React, { useState, useEffect } from 'react';
import './App.css';
import backupActions from './backupActions.json';
// Importa l'immagine del guanto che punta
import pointingGlove from './assets/pointing-glove.png';

const DrinkingGameApp = () => {
  // Game states: 'welcome', 'playerSetup', 'roomSelection', 'playing', 'gameOver'
  const [gameState, setGameState] = useState('welcome');
  const [players, setPlayers] = useState([]);
  const [inputPlayers, setInputPlayers] = useState([{ id: 1, name: '' }]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [previousAction, setPreviousAction] = useState(null);
  // Contatore per le azioni giocate in una partita (nascosto dall'UI)
  const [actionsCounter, setActionsCounter] = useState(0);
  // Costante per il numero massimo di azioni per partita
  const MAX_ACTIONS_PER_GAME = 50;
  
  // State for the loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // State for selected room index (for swiper)
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  
  // Generated actions for each room
  const [roomActionsPool, setRoomActionsPool] = useState({
    redRoom: [],
    darkRoom: [],
    clash: [],
    lounge: [],
    neonRoulette: []
  });
  
  // Current index for tracking which action to use from the pool
  const [currentActionIndex, setCurrentActionIndex] = useState({
    redRoom: 0,
    darkRoom: 0,
    clash: 0,
    lounge: 0,
    neonRoulette: 0
  });
  
  // Stato per la funzionalità del buttafuori
  const [bouncerUsed, setBouncerUsed] = useState({
    redRoom: false,
    darkRoom: false,
    clash: false,
    lounge: false,
    neonRoulette: false
  });
  const [bouncerRound, setBouncerRound] = useState({
    redRoom: Math.floor(Math.random() * 10) + 15, // Tra 15 e 25 round
    darkRoom: Math.floor(Math.random() * 10) + 15,
    clash: Math.floor(Math.random() * 10) + 15,
    lounge: Math.floor(Math.random() * 10) + 15,
    neonRoulette: Math.floor(Math.random() * 10) + 15
  });
  const [showBouncerAction, setShowBouncerAction] = useState(false);
  const [bouncerPlayer, setBouncerPlayer] = useState(null);
  
  // Stato per la funzionalità del dito della verità
  const [truthFingerUsed, setTruthFingerUsed] = useState({
    redRoom: false,
    darkRoom: false,
    clash: false,
    lounge: false,
    neonRoulette: false
  });
  const [truthFingerRound, setTruthFingerRound] = useState({
    redRoom: Math.floor(Math.random() * 10) + 30, // Tra 30 e 40 round
    darkRoom: Math.floor(Math.random() * 10) + 30,
    clash: Math.floor(Math.random() * 10) + 30,
    lounge: Math.floor(Math.random() * 10) + 30,
    neonRoulette: Math.floor(Math.random() * 10) + 30
  });
  const [showTruthFingerAction, setShowTruthFingerAction] = useState(false);
  const [truthFingerPlayer, setTruthFingerPlayer] = useState(null);
  
  // App name and description
  const appName = "Furry Bones Club";
  const appDescription = "Questo club è gestito da un AI. Lei formulerà domande sempre nuove e inaspettate.";
  
  // Room definitions with their content types
  const rooms = [
    { 
      id: 'redRoom', 
      name: 'Red Room', 
      description: 'Domande piccanti e provocanti',
      color: '#DC2626'
    },
    { 
      id: 'darkRoom', 
      name: 'Dark Room', 
      description: 'Non entrare se hai qualcosa da nascondere',
      color: '#1F2937'
    },
    { 
      id: 'clash', 
      name: 'Sfide', 
      description: 'Sfide uno contro uno',
      color: '#EAB308'
    },
    { 
      id: 'lounge', 
      name: 'Lounge', 
      description: 'Domande leggere e rilassanti',
      color: '#2563EB'
    },
    { 
      id: 'neonRoulette', 
      name: 'Neon Roulette', 
      description: 'Mix casuale di tutte le modalità',
      color: '#D946EF'  // Colore viola/magenta per un effetto neon
    }
  ];
  
  // Fallback room content
  const roomContent = {
    redRoom: [
      { text: "Raccontaci la tua più grande fantasia sessuale oppure 5 penalità" },
      { text: "Indica chi è la persona più attraente in questa stanza e spiega perché oppure 4 penalità" },
      { text: "Racconta la cosa più intima che hai fatto in un luogo pubblico oppure 3 penalità" }
    ],
    darkRoom: [
      { text: "Rivela un segreto oscuro che non hai mai detto a nessuno oppure 5 penalità" },
      { text: "Confessa la cosa peggiore che hai fatto di nascosto oppure 6 penalità" },
      { text: "Mostra l'ultimo messaggio privato che hai inviato oppure 5 penalità" }
    ],
    clash: [
      { text: "Sfida: Tu e il giocatore alla tua destra dovete mantenere il contatto visivo per 30 secondi senza ridere. Se perdete, entrambi fate 5 penalità" },
      { text: "Sfida: Chi riesce a stare più a lungo in equilibrio su una gamba sola tra te e un giocatore a scelta. Il perdente fa 6 penalità" }
    ],
    lounge: [
      { text: "Racconta qual è il tuo film preferito e perché oppure 2 penalità" },
      { text: "Condividi un ricordo d'infanzia felice oppure 3 penalità" },
      { text: "Se potessi viaggiare ovunque, dove andresti? Oppure 2 penalità" }
    ],
    neonRoulette: [] // Sarà popolato con azioni da tutte le altre stanze
  };
  
  // Effetto per caricare la prima domanda quando lo stato è 'playing'
  useEffect(() => {
    if (gameState === 'playing' && selectedRoom) {
      // Breve timeout per assicurarsi che lo stato sia aggiornato
      setTimeout(() => {
        updateCurrentAction();
      }, 100);
    }
  }, [gameState, selectedRoom]);
  
  // Enter the player setup screen
  const enterPlayerSetup = () => {
    setGameState('playerSetup');
  };
  
  // Aggiunge un nuovo input box per un giocatore
  const addPlayerInput = () => {
    if (inputPlayers.length < 15) {
      const newId = inputPlayers.length > 0 
        ? Math.max(...inputPlayers.map(p => p.id)) + 1 
        : 1;
      setInputPlayers([...inputPlayers, { id: newId, name: '' }]);
    }
  };
  
  // Aggiorna il nome di un giocatore negli input
  const updatePlayerName = (id, name) => {
    setInputPlayers(
      inputPlayers.map(input => 
        input.id === id ? { ...input, name } : input
      )
    );
  };
  
  // Rimuove un input di giocatore
  const removePlayerInput = (id) => {
    if (inputPlayers.length > 1) {
      setInputPlayers(inputPlayers.filter(input => input.id !== id));
    }
  };
  
  // Avvia una nuova partita
  const startGame = () => {
    // Verifica che ci siano almeno 2 giocatori validi
    const validPlayers = inputPlayers
      .filter(input => input.name.trim() !== '')
      .map(input => input.name.trim());
    
    if (validPlayers.length < 2) {
      alert("Inserisci almeno 2 giocatori per iniziare!");
      return;
    }
    
    setPlayers(validPlayers);
    setGameState('roomSelection');
  };
  
  // Gestisce il tasto Enter negli input dei giocatori
  const handleKeyPress = (e, id, index) => {
    if (e.key === 'Enter') {
      if (index === inputPlayers.length - 1) {
        // Se siamo sull'ultimo input, aggiungiamo un nuovo campo
        addPlayerInput();
      } else {
        // Altrimenti spostiamo il focus al campo successivo
        const nextInput = document.getElementById(`player-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };
  
  // Seleziona una stanza e prepara il gioco
  const selectRoom = async (room) => {
    setSelectedRoom(room);
    setIsLoading(true);
    
    try {
      // Simulazione caricamento
      for (let i = 0; i <= 100; i += 10) {
        setLoadingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Resetta il contatore delle azioni
      setActionsCounter(0);
      
      // Resetta gli stati del buttafuori per la nuova partita
      setBouncerUsed(prev => ({
        ...prev,
        [room.id]: false
      }));
      
      setBouncerRound(prev => ({
        ...prev,
        [room.id]: Math.floor(Math.random() * 10) + 15 // Tra 15 e 25 round
      }));
      
      setShowBouncerAction(false);
      setBouncerPlayer(null);
      
      // Resetta gli stati del dito della verità per la nuova partita
      setTruthFingerUsed(prev => ({
        ...prev,
        [room.id]: false
      }));
      
      setTruthFingerRound(prev => ({
        ...prev,
        [room.id]: Math.floor(Math.random() * 10) + 30 // Tra 30 e 40 round
      }));
      
      setShowTruthFingerAction(false);
      setTruthFingerPlayer(null);
      
      // Se è la modalità Neon Roulette, combina azioni da tutte le altre stanze
      if (room.id === 'neonRoulette') {
        // Preparazione degli array per le azioni da ciascuna stanza
        let redRoomActions = [];
        let darkRoomActions = [];
        let clashActions = [];
        let loungeActions = [];
        
        // Raccogli azioni dal file backup per ogni stanza
        if (backupActions.redRoom && backupActions.redRoom.length > 0) {
          redRoomActions = [...backupActions.redRoom];
        }
        
        if (backupActions.darkRoom && backupActions.darkRoom.length > 0) {
          darkRoomActions = [...backupActions.darkRoom];
        }
        
        if (backupActions.clash && backupActions.clash.length > 0) {
          clashActions = [...backupActions.clash];
        }
        
        if (backupActions.lounge && backupActions.lounge.length > 0) {
          loungeActions = [...backupActions.lounge];
        }
        
        // Se qualche categoria ha poche o nessuna azione, usa il fallback
        if (redRoomActions.length < 5 && roomContent.redRoom) {
          redRoomActions = [...redRoomActions, ...roomContent.redRoom];
        }
        
        if (darkRoomActions.length < 5 && roomContent.darkRoom) {
          darkRoomActions = [...darkRoomActions, ...roomContent.darkRoom];
        }
        
        if (clashActions.length < 5 && roomContent.clash) {
          clashActions = [...clashActions, ...roomContent.clash];
        }
        
        if (loungeActions.length < 5 && roomContent.lounge) {
          loungeActions = [...loungeActions, ...roomContent.lounge];
        }
        
        // Mescola ciascun gruppo di azioni separatamente
        redRoomActions = redRoomActions.sort(() => Math.random() - 0.5);
        darkRoomActions = darkRoomActions.sort(() => Math.random() - 0.5);
        clashActions = clashActions.sort(() => Math.random() - 0.5);
        loungeActions = loungeActions.sort(() => Math.random() - 0.5);
        
        // Calcola quante azioni prendere da ciascuna categoria per un totale di circa 100
        const maxPerCategory = 25; // 25 azioni per categoria = 100 totali
        
        // Prendi un numero bilanciato di azioni da ciascuna categoria
        const selectedRedRoomActions = redRoomActions.slice(0, Math.min(maxPerCategory, redRoomActions.length));
        const selectedDarkRoomActions = darkRoomActions.slice(0, Math.min(maxPerCategory, darkRoomActions.length));
        const selectedClashActions = clashActions.slice(0, Math.min(maxPerCategory, clashActions.length));
        const selectedLoungeActions = loungeActions.slice(0, Math.min(maxPerCategory, loungeActions.length));
        
        // Combina tutte le azioni selezionate
        const combinedActions = [
          ...selectedRedRoomActions,
          ...selectedDarkRoomActions,
          ...selectedClashActions,
          ...selectedLoungeActions
        ];
        
        // Mescola le azioni combinate
        const shuffledActions = combinedActions.sort(() => Math.random() - 0.5);
        
        console.log("Neon Roulette stats:");
        console.log(`Red Room: ${selectedRedRoomActions.length} azioni`);
        console.log(`Dark Room: ${selectedDarkRoomActions.length} azioni`);
        console.log(`Clash: ${selectedClashActions.length} azioni`);
        console.log(`Lounge: ${selectedLoungeActions.length} azioni`);
        console.log(`Totale: ${shuffledActions.length} azioni`);
        
        // Aggiorna il pool di azioni per la Neon Roulette
        setRoomActionsPool(prev => ({
          ...prev,
          neonRoulette: shuffledActions
        }));
      } 
      // Altrimenti, carica le azioni normali della stanza
      else {
        // Ottieni azioni dal backup file
        const backupActionsForRoom = backupActions[room.id] || [];
        
        if (backupActionsForRoom.length > 0) {
          // Mescola e seleziona azioni casuali
          const shuffledBackupActions = [...backupActionsForRoom]
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.max(MAX_ACTIONS_PER_GAME * 2, 50));
          
          // Aggiorna le azioni disponibili
          setRoomActionsPool(prev => ({
            ...prev,
            [room.id]: shuffledBackupActions
          }));
        }
      }
      
      // Resetta l'indice delle azioni
      setCurrentActionIndex(prev => ({
        ...prev,
        [room.id]: 0
      }));
      
      // Resetta l'azione precedente
      setPreviousAction(null);
      
      // Seleziona un giocatore casuale per iniziare
      const randomPlayerIndex = Math.floor(Math.random() * players.length);
      setCurrentPlayerIndex(randomPlayerIndex);
      
      // Vai alla schermata di gioco
      setGameState('playing');
      
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funzione semplificata per continuare dopo l'azione del buttafuori
  const nextTurnAfterBouncer = () => {
    setShowBouncerAction(false);
    setBouncerPlayer(null);
    
    // Prosegui con il turno normale
    nextTurn(true); // true indica che stiamo proseguendo dopo l'azione del buttafuori
  };
  
  // Funzione semplificata per continuare dopo l'azione del dito della verità
  const nextTurnAfterTruthFinger = () => {
    setShowTruthFingerAction(false);
    setTruthFingerPlayer(null);
    
    // Prosegui con il turno normale
    nextTurn(true); // true indica che stiamo proseguendo dopo un'azione speciale
  };
  
  // Funzione dedicata per aggiornare l'azione corrente
  const updateCurrentAction = () => {
    if (!selectedRoom) return;
    
    const roomId = selectedRoom.id;
    
    // Verifica se è tempo per l'azione del dito della verità
    if (!truthFingerUsed[roomId] && actionsCounter >= truthFingerRound[roomId] && actionsCounter < MAX_ACTIONS_PER_GAME - 1) {
      // È il momento di attivare l'azione del dito della verità
      setTruthFingerUsed(prev => ({
        ...prev,
        [roomId]: true
      }));
      
      // Il giocatore corrente sarà il giudice
      setTruthFingerPlayer(players[currentPlayerIndex]);
      setShowTruthFingerAction(true);
      
      // Imposta un'azione speciale per il dito della verità
      setCurrentAction({ 
        text: `${players[currentPlayerIndex]} inizia il gioco del DITO DELLA VERITÀ! Deve scegliere una caratteristica (es. "il più tirchio", "il più divertente") e tutti indicheranno un giocatore. Chi riceve più voti fa una penalità!` 
      });
      
      return;
    }
    
    // Verifica se è tempo per l'azione del buttafuori
    if (!bouncerUsed[roomId] && actionsCounter >= bouncerRound[roomId] && actionsCounter < MAX_ACTIONS_PER_GAME - 1) {
      // È il momento di attivare l'azione del buttafuori
      setBouncerUsed(prev => ({
        ...prev,
        [roomId]: true
      }));
      
      // Scegli casualmente un giocatore diverso da quello corrente come buttafuori
      let bouncerIndex;
      do {
        bouncerIndex = Math.floor(Math.random() * players.length);
      } while (bouncerIndex === currentPlayerIndex);
      
      setBouncerPlayer(players[bouncerIndex]);
      setShowBouncerAction(true);
      
      // Imposta un'azione speciale per il buttafuori
      setCurrentAction({ 
        text: `${players[bouncerIndex]} è stato scelto come BUTTAFUORI del club! Può decidere se "lasciar passare" la prossima penitenza o far fare una penalità extra a un altro giocatore.` 
      });
      
      return;
    }
    
    const currentPool = roomActionsPool[roomId];
    let index = currentActionIndex[roomId];
    
    // Se non ci sono azioni nel pool, usa quelle predefinite
    if (!currentPool || currentPool.length === 0) {
      console.log("Nessuna azione nel pool, uso il fallback");
      
      // Per Neon Roulette, raccogliamo azioni dal fallback di tutte le stanze in modo bilanciato
      if (roomId === 'neonRoulette') {
        let redRoomFallback = roomContent.redRoom || [];
        let darkRoomFallback = roomContent.darkRoom || [];
        let clashFallback = roomContent.clash || [];
        let loungeFallback = roomContent.lounge || [];
        
        // Prendi fino a 5 azioni da ciascuna categoria
        const maxPerCategory = 5;
        redRoomFallback = redRoomFallback.slice(0, Math.min(maxPerCategory, redRoomFallback.length));
        darkRoomFallback = darkRoomFallback.slice(0, Math.min(maxPerCategory, darkRoomFallback.length));
        clashFallback = clashFallback.slice(0, Math.min(maxPerCategory, clashFallback.length));
        loungeFallback = loungeFallback.slice(0, Math.min(maxPerCategory, loungeFallback.length));
        
        // Combina e mescola
        const fallbackPool = [
          ...redRoomFallback, 
          ...darkRoomFallback, 
          ...clashFallback, 
          ...loungeFallback
        ].sort(() => Math.random() - 0.5);
        
        if (fallbackPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackPool.length);
          setCurrentAction({ text: fallbackPool[randomIndex].text });
        } else {
          setCurrentAction({ text: "Nessuna azione disponibile" });
        }
      } 
      // Per altre stanze, usa il fallback normale
      else {
        const fallbackPool = roomContent[roomId] || [];
        if (fallbackPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackPool.length);
          setCurrentAction({ text: fallbackPool[randomIndex].text });
        } else {
          setCurrentAction({ text: "Nessuna azione disponibile" });
        }
      }
      return;
    }
    
    // Se abbiamo esaurito le azioni, ricomincia
    let adjustedIndex = index % currentPool.length;
    
    // Verifica se è la stessa dell'azione precedente ed evita duplicati
    if (previousAction !== null) {
      // Prova fino a 5 volte a trovare un'azione diversa (per evitare loop infiniti)
      let attempts = 0;
      let tempAction = currentPool[adjustedIndex].text;
      
      while (tempAction === previousAction && attempts < 5 && currentPool.length > 1) {
        // Incrementa l'indice e prova con un'altra azione
        index = (index + 1) % currentPool.length;
        adjustedIndex = index;
        tempAction = currentPool[adjustedIndex].text;
        attempts++;
      }
      
      // Aggiorna l'indice se è stato cambiato
      if (adjustedIndex !== currentActionIndex[roomId]) {
        setCurrentActionIndex(prev => ({
          ...prev,
          [roomId]: adjustedIndex
        }));
      }
    }
    
    // Ottieni l'azione
    let actionText = currentPool[adjustedIndex].text;
    
    // Gestisci il segnaposto playerB
    if (actionText.includes("{playerB}")) {
      let otherPlayers = players.filter((_, idx) => idx !== currentPlayerIndex);
      
      if (otherPlayers.length > 0) {
        const randomPlayerIndex = Math.floor(Math.random() * otherPlayers.length);
        const randomPlayerName = otherPlayers[randomPlayerIndex];
        
        actionText = actionText.replace(/{playerB}/g, randomPlayerName);
      } else {
        actionText = actionText.replace(/{playerB}/g, "qualcun altro");
      }
    }
    
    // Controlla prima se la frase contiene un punto interrogativo
    if (actionText.includes("?")) {
      // Espressione regolare per catturare domande con penalità alla fine
      // Questa è più flessibile e dovrebbe catturare varie forme
      const questionPenaltyRegex = /\?.*?(\d+)\s*penal(i|i)t(à|a)/i;
      const match = actionText.match(questionPenaltyRegex);
      
      if (match) {
        const penaltyCount = match[1];
        
        // Array di possibili formulazioni per domande
        const questionAlternatives = [
          `? Se non rispondi ${penaltyCount} penalità`,
          `? Se eviti la domanda ${penaltyCount} penalità`,
          `? Se non osi rispondere ${penaltyCount} penalità`,
          `? Il silenzio costa ${penaltyCount} penalità`,
          `? Eludere la risposta comporta ${penaltyCount} penalità`
        ];
        
        // Scegli una formulazione casuale
        const randomQuestionAlt = questionAlternatives[Math.floor(Math.random() * questionAlternatives.length)];
        
        // Sostituisci tutto ciò che viene dopo ? fino a "penalità" con la nuova formulazione
        actionText = actionText.replace(/\?(.*?)(\d+)\s*penal(i|i)t(à|a)/i, randomQuestionAlt);
      }
    }
    // Se non è una domanda, controlla se termina con "oppure X penalità"
    else {
      const penaltyRegex = /\s(oppure|o saranno|o)\s*(\d+)\s*penal(i|i)t(à|a)$/i;
      const match = actionText.match(penaltyRegex);
      
      if (match) {
        const penaltyCount = match[2]; // Il secondo gruppo è il numero
        
        // Array di possibili formulazioni
        const alternatives = [
          `se ti rifiuti ${penaltyCount} penalità`,
          `se non lo fai ${penaltyCount} penalità`,
          `altrimenti sono ${penaltyCount} penalità`,
          `in caso contrario ${penaltyCount} penalità`,
          `o saranno ${penaltyCount} penalità`,
          `o riceverai ${penaltyCount} penalità`,
          `se non hai coraggio ${penaltyCount} penalità`,
          `o dovrai fare ${penaltyCount} penalità`,
          `rifiutare costa ${penaltyCount} penalità`
        ];
        
        // Scegli una formulazione casuale
        const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
        
        // Sostituisci "oppure X penalità" con la nuova formulazione
        actionText = actionText.replace(penaltyRegex, ` ${randomAlt}`);
      }
    }
    
    // Salva l'azione corrente per confrontarla la prossima volta
    setPreviousAction(currentPool[adjustedIndex].text);
    
    // Imposta l'azione corrente
    setCurrentAction({ text: actionText });
    
    // Incrementa il contatore delle azioni
    setActionsCounter(prev => prev + 1);
  };
  
  // Passa al turno successivo
  const nextTurn = (afterSpecialAction = false) => {
    const roomId = selectedRoom.id;
    
    // Verifica se il numero massimo di azioni è stato raggiunto
    if (actionsCounter >= MAX_ACTIONS_PER_GAME - 1) {
      // Vai alla schermata di fine partita invece che direttamente alla selezione della stanza
      setGameState('gameOver');
      return;
    }
    
    // Incrementa l'indice per la prossima volta, ma solo se non siamo in una fase speciale
    if (!showBouncerAction && !showTruthFingerAction || afterSpecialAction) {
      setCurrentActionIndex(prev => ({
        ...prev,
        [roomId]: prev[roomId] + 1
      }));
    }
    
    // Se c'è solo un giocatore, non cambia
    if (players.length <= 1) {
      setTimeout(() => {
        updateCurrentAction();
      }, 50);
      return;
    }
    
    // Se non siamo in un turno speciale o stiamo procedendo dopo un'azione speciale,
    // seleziona un nuovo giocatore casuale
    if ((!showBouncerAction && !showTruthFingerAction) || afterSpecialAction) {
      // Seleziona un giocatore casuale diverso da quello attuale
      let nextPlayerIndex;
      do {
        nextPlayerIndex = Math.floor(Math.random() * players.length);
      } while (nextPlayerIndex === currentPlayerIndex);
      
      setCurrentPlayerIndex(nextPlayerIndex);
    }
    
    // Piccolo timeout per assicurarsi che l'indice sia aggiornato prima di chiamare updateCurrentAction
    setTimeout(() => {
      updateCurrentAction();
    }, 50);
  };
  
  // Navigazione tra le schermate
  const goBack = () => {
    switch (gameState) {
      case 'playerSetup':
        setGameState('welcome');
        break;
      case 'roomSelection':
        setGameState('playerSetup');
        break;
      case 'playing':
        setGameState('roomSelection');
        break;
      case 'gameOver':
        setGameState('roomSelection');
        break;
      default:
        break;
    }
  };
  
  // Resetta il gioco
  const resetGame = () => {
    setGameState('welcome');
    setPlayers([]);
    setInputPlayers([{ id: 1, name: '' }]);
    setCurrentPlayerIndex(0);
    setCurrentAction(null);
    setSelectedRoom(null);
    setPreviousAction(null);
    setActionsCounter(0);
    
    // Resetta anche gli stati del buttafuori
    setBouncerUsed({
      redRoom: false,
      darkRoom: false,
      clash: false,
      lounge: false,
      neonRoulette: false
    });
    setBouncerRound({
      redRoom: Math.floor(Math.random() * 10) + 15,
      darkRoom: Math.floor(Math.random() * 10) + 15,
      clash: Math.floor(Math.random() * 10) + 15,
      lounge: Math.floor(Math.random() * 10) + 15,
      neonRoulette: Math.floor(Math.random() * 10) + 15
    });
    setShowBouncerAction(false);
    setBouncerPlayer(null);
    
    // Resetta anche gli stati del dito della verità
    setTruthFingerUsed({
      redRoom: false,
      darkRoom: false,
      clash: false,
      lounge: false,
      neonRoulette: false
    });
    setTruthFingerRound({
      redRoom: Math.floor(Math.random() * 10) + 30,
      darkRoom: Math.floor(Math.random() * 10) + 30,
      clash: Math.floor(Math.random() * 10) + 30,
      lounge: Math.floor(Math.random() * 10) + 30,
      neonRoulette: Math.floor(Math.random() * 10) + 30
    });
    setShowTruthFingerAction(false);
    setTruthFingerPlayer(null);
  };
  
  return (
    <div className="app-container">
      {/* Welcome Screen */}
      {gameState === 'welcome' && (
        <div className="screen welcome-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '340px'
          }}>
            <h1 style={{ 
              fontSize: '36px', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>{appName}</h1>
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '40px',
              color: '#CCCCCC',
              lineHeight: '1.5'
            }}>{appDescription}</p>
            
            <button 
              onClick={enterPlayerSetup}
              style={{
                width: '100%',
                backgroundColor: '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              INIZIA
            </button>
          </div>
        </div>
      )}
      
      {/* Player Setup Screen */}
      {gameState === 'playerSetup' && (
        <div className="screen player-setup-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              PLAYERS
            </h1>
            
            <div></div> {/* Colonna vuota a destra per equilibrio */}
          </div>
          
          <div style={{ 
            flex: 1,
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
            marginBottom: '80px'
          }}>
            {inputPlayers.map((input, index) => (
              <div key={input.id} style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                maxWidth: '340px',
                marginBottom: '16px',
                padding: '0 20px'
              }}>
                <input
                  id={`player-input-${index}`}
                  type="text"
                  value={input.name}
                  onChange={(e) => updatePlayerName(input.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, input.id, index)}
                  placeholder="Enter player name"
                  style={{
                    flex: 1,
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    fontSize: '16px',
                  }}
                />
                <button 
                  onClick={() => removePlayerInput(input.id)}
                  disabled={inputPlayers.length <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#808080',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '10px',
                    opacity: inputPlayers.length <= 1 ? 0.5 : 1
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <button 
              onClick={addPlayerInput}
              disabled={inputPlayers.length >= 15}
              style={{
                margin: '5px 0 20px 0',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1px dashed #808080',
                borderRadius: '10px',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                width: '340px'
              }}
            >
              <span style={{ fontSize: '20px' }}>⊕</span> Add Player
            </button>
          </div>
          
          <div style={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent'
          }}>
            <button 
              onClick={startGame}
              style={{
                width: '100%',
                backgroundColor: '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '20px' }}>▶</span> START
            </button>
          </div>
        </div>
      )}
      
      {/* Room Selection Screen */}
      {gameState === 'roomSelection' && (
        <div className="screen room-selection-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              ROOMS
            </h1>
            
            <div></div> {/* Colonna vuota a destra per equilibrio */}
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px'
          }}>
            <div style={{
              width: '300px',  // Larghezza fissa
              height: '400px', // Altezza fissa
              backgroundColor: rooms[currentRoomIndex].color,
              borderRadius: '15px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '30px',
              marginBottom: '25px'
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: rooms[currentRoomIndex].color === '#1F2937' || 
                         rooms[currentRoomIndex].color === '#DC2626' || 
                         rooms[currentRoomIndex].color === '#D946EF' ? '#FFFFFF' : '#000000'
                }}>
                  {rooms[currentRoomIndex].name}
                </h2>
              </div>
              
              <div style={{ marginBottom: '40px' }}>
                <button 
                  onClick={() => selectRoom(rooms[currentRoomIndex])}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px 40px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ENTRA
                </button>
              </div>
              
              <div style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
                <p style={{
                  fontSize: '16px',
                  textAlign: 'center',
                  color: rooms[currentRoomIndex].color === '#1F2937' ? '#9CA3AF' :
                         rooms[currentRoomIndex].color === '#DC2626' ? 'rgba(255,255,255,0.8)' :
                         rooms[currentRoomIndex].color === '#D946EF' ? '#f5d0fe' : 
                         'rgba(0,0,0,0.7)'
                }}>
                  {rooms[currentRoomIndex].description}
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <button 
                onClick={() => setCurrentRoomIndex((prev) => (prev === 0 ? rooms.length - 1 : prev - 1))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#AAAAAA',
                  fontSize: '36px',
                  cursor: 'pointer'
                }}
              >
                ‹
              </button>
              
              <div style={{ 
                display: 'flex',
                gap: '8px'
              }}>
                {rooms.map((_, index) => (
                  <div 
                    key={index}
                    onClick={() => setCurrentRoomIndex(index)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === currentRoomIndex ? '#FFFFFF' : '#555555',
                      cursor: 'pointer'
                    }}
                  ></div>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentRoomIndex((prev) => (prev === rooms.length - 1 ? 0 : prev + 1))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#AAAAAA',
                  fontSize: '36px',
                  cursor: 'pointer'
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Playing Screen */}
      {gameState === 'playing' && selectedRoom && (
        <div className="screen playing-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '20px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              {selectedRoom.name.toUpperCase()}
            </h1>
            
            <div></div> {/* Colonna vuota a destra per equilibrio */}
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px',
            marginBottom: '80px' // Spazio per il pulsante fisso in basso
          }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '10px 0 30px 0'
            }}>
              {players[currentPlayerIndex]}
            </h2>
            
            <div style={{
              backgroundColor: '#1A1A1A',
              borderRadius: '15px',
              padding: '30px 20px',
              marginBottom: '30px',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {currentAction && (
                <p style={{
                  fontSize: '20px',
                  lineHeight: '1.4',
                  textAlign: 'center'
                }}>
                  {currentAction.text}
                </p>
              )}
              
              {/* Messaggio semplificato quando appare il buttafuori */}
              {showBouncerAction && bouncerPlayer && (
                <p style={{ 
                  marginTop: '15px', 
                  fontSize: '16px', 
                  color: '#AAAAAA',
                  textAlign: 'center'
                }}>
                  {bouncerPlayer} è il buttafuori e sta decidendo...
                </p>
              )}
              
              {/* Messaggio semplificato quando appare il dito della verità */}
              {showTruthFingerAction && truthFingerPlayer && (
                <p style={{ 
                  marginTop: '15px', 
                  fontSize: '16px', 
                  color: '#AAAAAA',
                  textAlign: 'center'
                }}>
                  {truthFingerPlayer} sta scegliendo una caratteristica e tutti voteranno...
                </p>
              )}
            </div>
          </div>
          
          <div style={{ 
            padding: '0',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            zIndex: 10
          }}>
            <button 
              onClick={() => {
                if (showBouncerAction) {
                  nextTurnAfterBouncer();
                } else if (showTruthFingerAction) {
                  nextTurnAfterTruthFinger();
                } else {
                  nextTurn();
                }
              }}
              style={{
                width: '100%',
                backgroundColor: '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              NEXT
            </button>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div 
          className="screen game-over-screen" 
          onClick={() => setGameState('roomSelection')}
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            textAlign: 'center',
            maxWidth: '340px'
          }}>
            <h1 style={{ 
              fontSize: '36px', 
              marginBottom: '30px',
              fontWeight: 'bold'
            }}>
              PARTITA FINITA!
            </h1>
            
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '50px',
              color: '#CCCCCC',
              lineHeight: '1.5'
            }}>
              Avete completato {MAX_ACTIONS_PER_GAME} azioni!
            </p>
            
            <div style={{ 
              width: '120px',
              height: '120px',
              margin: '0 auto 40px',
              animation: 'float 2s infinite ease-in-out'
            }}>
              <img 
                src={pointingGlove} 
                alt="Guanto che punta" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
              />
            </div>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#3498db'
            }}>
              Tocca per tornare alla selezione delle stanze
            </p>
          </div>
          
          {/* Add CSS animation for the floating effect */}
          <style jsx="true">{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
          `}</style>
        </div>
      )}
      
      {/* Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#FFFFFF'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#FFFFFF',
              animation: 'spin 1s ease-in-out infinite',
              marginBottom: '15px'
            }}></div>
            <p style={{
              fontSize: '16px'
            }}>Caricamento in corso...</p>
            
            <style jsx="true">{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrinkingGameApp;