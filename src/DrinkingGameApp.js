import React, { useState, useEffect } from 'react';
import './App.css';
import translations from './translations';

// Importa l'immagine del guanto che punta
import pointingGlove from './assets/pointing-glove.png';

const DrinkingGameApp = () => {
  // Stato per la lingua selezionata (default: italiano)
  const [language, setLanguage] = useState('it');
  // Riferimento alle traduzioni nella lingua corrente
  const t = translations[language];
  
  // Game states: 'welcome', 'playerSetup', 'roomSelection', 'playing', 'gameOver', 'paywall', 'languageSelection'
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
    coppie: [],
    party: [],
    neonRoulette: []
  });
  
  // Current index for tracking which action to use from the pool
  const [currentActionIndex, setCurrentActionIndex] = useState({
    redRoom: 0,
    darkRoom: 0,
    coppie: 0,
    party: 0,
    neonRoulette: 0
  });
  
  // Stato per le azioni di gruppo
  const [groupActionsPool, setGroupActionsPool] = useState([]);
  // Indici per quando devono apparire le azioni di gruppo
  const [groupActionPositions, setGroupActionPositions] = useState([]);
  // Contatore per le azioni di gruppo mostrate
  const [groupActionsShown, setGroupActionsShown] = useState(0);
  
  // ======== GIOCHI SPECIALI - STATO UNIFICATO ========
  // Stato per tenere traccia di tutti i giochi speciali
  const SPECIAL_GAMES = ['bouncer', 'pointFinger', 'infamata', 'truthOrDare', 'ilPezzoGrosso', 'cringeOrClassy'];
  
  // Stato per tracciare quali giochi sono stati usati
  const [specialGamesUsed, setSpecialGamesUsed] = useState({
    redRoom: { bouncer: false, pointFinger: false, infamata: false, truthOrDare: false, ilPezzoGrosso: false, cringeOrClassy: false },
    darkRoom: { bouncer: false, pointFinger: false, infamata: false, truthOrDare: false, ilPezzoGrosso: false, cringeOrClassy: false },
    coppie: { bouncer: false, pointFinger: false, infamata: false, truthOrDare: false, ilPezzoGrosso: false, cringeOrClassy: false },
    party: { bouncer: false, pointFinger: false, infamata: false, truthOrDare: false, ilPezzoGrosso: false, cringeOrClassy: false },
    neonRoulette: { bouncer: false, pointFinger: false, infamata: false, truthOrDare: false, ilPezzoGrosso: false, cringeOrClassy: false }
  });
  
  // Stato per tracciare quando deve apparire ciascun gioco
  const [specialGamesRound, setSpecialGamesRound] = useState({
    redRoom: { bouncer: 15, pointFinger: 30, infamata: 20, truthOrDare: 25, ilPezzoGrosso: 35, cringeOrClassy: 40 },
    darkRoom: { bouncer: 15, pointFinger: 30, infamata: 20, truthOrDare: 25, ilPezzoGrosso: 35, cringeOrClassy: 40 },
    coppie: { bouncer: 15, pointFinger: 30, infamata: 20, truthOrDare: 25, ilPezzoGrosso: 35, cringeOrClassy: 40 },
    party: { bouncer: 15, pointFinger: 30, infamata: 20, truthOrDare: 25, ilPezzoGrosso: 35, cringeOrClassy: 40 },
    neonRoulette: { bouncer: 15, pointFinger: 30, infamata: 20, truthOrDare: 25, ilPezzoGrosso: 35, cringeOrClassy: 40 }
  });
  
  // Stato per il gioco speciale attualmente in corso
  const [activeSpecialGame, setActiveSpecialGame] = useState(null);
  // Giocatore coinvolto nel gioco speciale (se presente)
  const [specialGamePlayer, setSpecialGamePlayer] = useState(null);
  
  // NUOVO: Contatore per tracciare l'ultima azione speciale
  const [lastSpecialGameRound, setLastSpecialGameRound] = useState({
    redRoom: 0,
    darkRoom: 0,
    clash: 0,
    party: 0,
    neonRoulette: 0
  });
  
  // NUOVO: Lista dei debiti assegnati
  const [debtList, setDebtList] = useState([]);
  
  // NUOVO: Costante per l'intervallo minimo tra giochi speciali
  const MIN_ACTIONS_BETWEEN_SPECIAL_GAMES = 5;
  
  // Nuovi stati per il paywall
  const [hasPlayedFreeGame, setHasPlayedFreeGame] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Nuovi stati per il gioco Obbligo Verità Debito
  const [truthDarePlayers, setTruthDarePlayers] = useState([]);
  const [currentTruthDareChoice, setCurrentTruthDareChoice] = useState(null);
  const [truthDareContent, setTruthDareContent] = useState(null);
  const [truthDareState, setTruthDareState] = useState(null); // "choosing", "executing", "completed"
  const [truthDareContentPool, setTruthDareContentPool] = useState({
    truth: [],
    dare: []
  });
  
  // Nuovo stato per il gioco Cringe or Classy
  const [cringeOrClassyState, setCringeOrClassyState] = useState(null); // "voting", "result"
  const [cringeOrClassyResult, setCringeOrClassyResult] = useState(null);
  
  // Verifica lo stato del paywall quando il componente si monta
  useEffect(() => {
    // Recupera lo stato del pagamento da localStorage
    const storedHasPaid = localStorage.getItem('hasPaid') === 'true';
    const storedHasPlayedFreeGame = localStorage.getItem('hasPlayedFreeGame') === 'true';
    const storedLanguage = localStorage.getItem('language');
    
    if (storedHasPaid) {
      setHasPaid(true);
    }
    
    if (storedHasPlayedFreeGame) {
      setHasPlayedFreeGame(true);
    }
    
    if (storedLanguage && translations[storedLanguage]) {
      setLanguage(storedLanguage);
    }
  }, []);
  
  // Effetto per caricare la prima domanda quando lo stato è 'playing'
  useEffect(() => {
    if (gameState === 'playing' && selectedRoom) {
      // Breve timeout per assicurarsi che lo stato sia aggiornato
      setTimeout(() => {
        updateCurrentAction();
      }, 100);
    }
  }, [gameState, selectedRoom]);
  
  // Funzione per cambiare la lingua dell'app
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
      
      // Se si stava visualizzando una stanza, aggiorna la selezione
      if (selectedRoom && currentRoomIndex >= 0) {
        // Trova l'indice della stanza con lo stesso ID nella nuova lingua
        const roomId = selectedRoom.id;
        const newRooms = translations[newLanguage].rooms;
        const newRoomIndex = newRooms.findIndex(room => room.id === roomId);
        
        if (newRoomIndex >= 0) {
          setCurrentRoomIndex(newRoomIndex);
          setSelectedRoom(newRooms[newRoomIndex]);
        }
      }
    }
  };
  
  // Funzione per aprire il selettore di lingua
  const openLanguageSelector = () => {
    setGameState('languageSelection');
  };
  
  // Mostra la schermata di setup giocatori
  const enterPlayerSetup = () => {
    // Verifica se l'utente ha già giocato la partita gratuita e non ha pagato
    if (hasPlayedFreeGame && !hasPaid) {
      setGameState('paywall');
    } else {
      setGameState('playerSetup');
    }
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
      alert(t.notEnoughPlayersError);
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
  
  // Carica il file backupActions nella lingua corrente
  const loadBackupActions = async () => {
    try {
      // Determina il nome del file in base alla lingua corrente
      const backupActionsFileName = `backupActions_${language}.json`;
      
      // Percorso alla cartella che contiene i file backupActions
      const folderPath = './actions'; // Sostituisci 'data' con il nome della tua cartella
      
      // Carica dinamicamente il file corretto in base alla lingua
      let backupActionsModule;
      
      // Gestione dei diversi percorsi in base alla lingua
      if (language === 'it') {
        backupActionsModule = await import(`${folderPath}/backupActions_it.json`);
      } else {
        // Default to English if the language is not Italian
        backupActionsModule = await import(`${folderPath}/backupActions_en.json`);
      }
      
      console.log(`Caricato con successo: ${folderPath}/${backupActionsFileName}`);
      return backupActionsModule.default;
    } catch (error) {
      console.error(`Errore nel caricamento del file backupActions_${language}.json:`, error);
      console.log('Tentativo di caricare il file di backup dalla directory principale...');
      
      // Fallback: prova a caricare dalla directory principale
      try {
        const backupActionsModule = await import(`./backupActions.json`);
        return backupActionsModule.default;
      } catch (fallbackError) {
        console.error('Errore anche nel caricamento del file di fallback:', fallbackError);
        return {}; // Restituisce un oggetto vuoto se non può caricare nessun file
      }
    }
  };
  
  // Seleziona una stanza e prepara il gioco
  const selectRoom = async (room) => {
    setSelectedRoom(room);
    setIsLoading(true);
    
    try {
      // Carica il file backupActions nella lingua corrente
      const backupActions = await loadBackupActions();
      
      // Simulazione caricamento
      for (let i = 0; i <= 100; i += 10) {
        setLoadingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Resetta il contatore delle azioni
      setActionsCounter(0);
      
      // Resetta lo stato dei giochi speciali
      setActiveSpecialGame(null);
      setSpecialGamePlayer(null);
      setCringeOrClassyState(null);
      setCringeOrClassyResult(null);
      
      // NUOVO: Resetta il contatore dell'ultima azione speciale
      setLastSpecialGameRound(prev => ({
        ...prev,
        [room.id]: 0
      }));
      
      // Distribuisci i giochi speciali in modo uniforme ma casuale
      const gamePositions = distributeSpecialGames(MAX_ACTIONS_PER_GAME);
      
      // Resetta tutti gli stati dei giochi speciali
      setSpecialGamesUsed(prev => ({
        ...prev,
        [room.id]: {
          bouncer: false,
          pointFinger: false,
          infamata: false,
          truthOrDare: false,
          ilPezzoGrosso: false,
          cringeOrClassy: false
        }
      }));
      
      // Imposta i round per ogni gioco speciale
      setSpecialGamesRound(prev => ({
        ...prev,
        [room.id]: {
          bouncer: gamePositions.bouncer || 15,
          pointFinger: gamePositions.pointFinger || 30,
          infamata: gamePositions.infamata || 20,
          truthOrDare: gamePositions.truthOrDare || 25,
          ilPezzoGrosso: gamePositions.ilPezzoGrosso || 35,
          cringeOrClassy: gamePositions.cringeOrClassy || 40
        }
      }));
      
      // Resetta la lista dei debiti quando si inizia una nuova stanza
      if (room.id !== selectedRoom?.id) {
        setDebtList([]);
      }
      
      // Carica le azioni di gruppo dal backup
      if (backupActions.groupActions && backupActions.groupActions.length > 0) {
        // Mescola le azioni di gruppo e seleziona fino a 10 per questa partita
        const shuffledGroupActions = [...backupActions.groupActions]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        
        setGroupActionsPool(shuffledGroupActions);
        
        // Determina in quali posizioni dovrebbero apparire le azioni di gruppo
        // Garantisce che almeno 2 azioni di gruppo appaiano durante la partita
        const maxPosition = MAX_ACTIONS_PER_GAME - 5; // Evita che appaiano alla fine
        
        // Posizione per la prima azione di gruppo (tra il 20% e il 40% delle azioni)
        const firstPosition = Math.floor(MAX_ACTIONS_PER_GAME * 0.2) + 
                             Math.floor(Math.random() * (MAX_ACTIONS_PER_GAME * 0.2));
        
        // Posizione per la seconda azione di gruppo (tra il 60% e l'80% delle azioni)
        const secondPosition = Math.floor(MAX_ACTIONS_PER_GAME * 0.6) + 
                              Math.floor(Math.random() * (MAX_ACTIONS_PER_GAME * 0.2));
        
        setGroupActionPositions([firstPosition, secondPosition]);
        setGroupActionsShown(0);
      }
      
      // Se è la modalità Neon Roulette, combina azioni da tutte le altre stanze
      if (room.id === 'neonRoulette') {
        // Preparazione degli array per le azioni da ciascuna stanza
        let redRoomActions = [];
        let darkRoomActions = [];
        let coppieActions = [];
        let partyActions = [];
        
        // Raccogli azioni dal file backup per ogni stanza
        if (backupActions.redRoom && backupActions.redRoom.length > 0) {
          redRoomActions = [...backupActions.redRoom];
        }
        
        if (backupActions.darkRoom && backupActions.darkRoom.length > 0) {
          darkRoomActions = [...backupActions.darkRoom];
        }
        
        if (backupActions.coppie && backupActions.coppie.length > 0) {
          coppieActions = [...backupActions.coppie];
        }
        
        if (backupActions.party && backupActions.party.length > 0) {
          partyActions = [...backupActions.party];
        }
        
        // Se qualche categoria ha poche o nessuna azione, usa il fallback
        // Nota: Il roomContent è ora sostituito con traduzioni
        const roomContent = {
          redRoom: { text: t.noActionAvailable },
          darkRoom: { text: t.noActionAvailable },
          coppie: { text: t.noActionAvailable },
          party: { text: t.noActionAvailable }
        };
        
        if (redRoomActions.length < 5 && roomContent.redRoom) {
          redRoomActions = [...redRoomActions, ...roomContent.redRoom];
        }
        
        if (darkRoomActions.length < 5 && roomContent.darkRoom) {
          darkRoomActions = [...darkRoomActions, ...roomContent.darkRoom];
        }
        
        if (coppieActions.length < 5 && roomContent.coppie) {
          coppieActions = [...coppieActions, ...roomContent.coppie];
        }
        
        if (partyActions.length < 5 && roomContent.party) {
          partyActions = [...partyActions, ...roomContent.party];
        }
        
        // Mescola ciascun gruppo di azioni separatamente
        redRoomActions = redRoomActions.sort(() => Math.random() - 0.5);
        darkRoomActions = darkRoomActions.sort(() => Math.random() - 0.5);
        coppieActions = coppieActions.sort(() => Math.random() - 0.5);
        partyActions = partyActions.sort(() => Math.random() - 0.5);
        
        // Calcola quante azioni prendere da ciascuna categoria per un totale di circa 100
        const maxPerCategory = 25; // 25 azioni per categoria = 100 totali
        
        // Prendi un numero bilanciato di azioni da ciascuna categoria
        const selectedRedRoomActions = redRoomActions.slice(0, Math.min(maxPerCategory, redRoomActions.length));
        const selectedDarkRoomActions = darkRoomActions.slice(0, Math.min(maxPerCategory, darkRoomActions.length));
        const selectedCoppieActions = coppieActions.slice(0, Math.min(maxPerCategory, coppieActions.length));
        const selectedPartyActions = partyActions.slice(0, Math.min(maxPerCategory, partyActions.length));
        
        // Combina tutte le azioni selezionate
        const combinedActions = [
          ...selectedRedRoomActions,
          ...selectedDarkRoomActions,
          ...selectedCoppieActions,
          ...selectedPartyActions
        ];
        
        // Mescola le azioni combinate
        const shuffledActions = combinedActions.sort(() => Math.random() - 0.5);
        
        console.log(t.logMessages.neonRouletteStats);
        console.log(t.logMessages.redRoomStats.replace('{count}', selectedRedRoomActions.length));
        console.log(t.logMessages.darkRoomStats.replace('{count}', selectedDarkRoomActions.length));
        console.log(t.logMessages.coppieStats.replace('{count}', selectedCoppieActions.length));
        console.log(t.logMessages.partyStats.replace('{count}', selectedPartyActions.length));
        console.log(t.logMessages.totalStats.replace('{count}', shuffledActions.length));
        
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
  
  // NUOVO: Funzione per distribuire i giochi speciali nella partita
  const distributeSpecialGames = (maxActions) => {
    const MIN_SPACING = 5; // Distanza minima tra i giochi speciali
    
    // Mescola l'array dei giochi per un ordine casuale
    const shuffledGames = [...SPECIAL_GAMES].sort(() => Math.random() - 0.5);
    
    // Range disponibile per la distribuzione dei giochi
    const minPosition = 10; // Iniziamo un po' dopo l'inizio della partita
    const maxPosition = maxActions - 10; // Finiamo un po' prima della fine
    const availableRange = maxPosition - minPosition;
    
    // Calcola la distribuzione ideale
    const segmentSize = Math.floor(availableRange / SPECIAL_GAMES.length);
    
    // Crea le posizioni con un po' di randomicità ma mantieni la distanza minima
    const positions = {};
    
    shuffledGames.forEach((game, index) => {
      // Base position nel suo segmento
      const segmentStart = minPosition + (index * segmentSize);
      const segmentEnd = segmentStart + segmentSize - MIN_SPACING;
      
      // Aggiungi randomicità all'interno del segmento
      positions[game] = segmentStart + Math.floor(Math.random() * (segmentEnd - segmentStart));
    });
    
    return positions;
  };
  
  // Funzione per continuare dopo un'azione speciale
  const nextTurnAfterSpecialGame = () => {
    if (!selectedRoom) return;
    const roomId = selectedRoom.id;
    
    // Se è in corso il gioco Obbligo Verità Debito
    if (activeSpecialGame === "truthOrDare") {
      // Rimuovi il primo giocatore dalla lista (quello che ha appena giocato)
      if (truthDarePlayers.length > 0) {
        const updatedPlayers = [...truthDarePlayers];
        updatedPlayers.shift();
        setTruthDarePlayers(updatedPlayers);
        
        // Se ci sono ancora giocatori da processare
        if (updatedPlayers.length > 0) {
          const nextPlayerIndex = updatedPlayers[0];
          setSpecialGamePlayer(players[nextPlayerIndex]);
          setCurrentTruthDareChoice(null);
          setTruthDareContent(null);
          setTruthDareState("choosing");
          setCurrentAction({ 
            text: t.truthDareNextPlayerIntro.replace('{player}', players[nextPlayerIndex])
          });
          return;
        }
      }
      
      // Se tutti i giocatori hanno giocato, termina il gioco speciale
      setTruthDareState("completed");
    }
    
    // Aggiorna il contatore dell'ultima azione speciale
    setLastSpecialGameRound(prev => ({
      ...prev,
      [roomId]: actionsCounter
    }));
    
    // Resetta gli stati del gioco speciale
    setActiveSpecialGame(null);
    setSpecialGamePlayer(null);
    setTruthDarePlayers([]);
    setCurrentTruthDareChoice(null);
    setTruthDareContent(null);
    setTruthDareState(null);
    setCringeOrClassyState(null);
    setCringeOrClassyResult(null);
    
    // Prosegui con il turno normale
    nextTurn(true); // true indica che stiamo proseguendo dopo un'azione speciale
  };
  
  // Nuova funzione per gestire la scelta di Obbligo/Verità/Debito
  const handleTruthDareChoice = (choice) => {
    setCurrentTruthDareChoice(choice);
    
    if (choice === "truth" || choice === "dare") {
      // Seleziona un contenuto casuale dal pool appropriato
      const pool = truthDareContentPool[choice];
      if (pool && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const content = pool[randomIndex];
        setTruthDareContent(content);
      } else {
        // Fallback in caso di pool vuoto
        setTruthDareContent(choice === "truth" 
          ? "Rispondi a una domanda personale che ti verrà fatta dal gruppo"
          : "Esegui un'azione che ti verrà assegnata dal gruppo");
      }
    } else {
      // Per "debt" non mostriamo contenuto
      setTruthDareContent(null);
      
      // Opzionale: aggiungi il debito alla lista dei debiti
      const newDebt = {
        player: specialGamePlayer,
        status: 'active',
        description: t.debts.debtDescription
      };
      setDebtList([...debtList, newDebt]);
    }
    
    // Cambia lo stato del gioco
    setTruthDareState("executing");
  };
  
  // NUOVO: Funzione helper per gestire i giochi speciali
  const handleSpecialGame = async (gameType) => {
    if (!selectedRoom) return;
    const roomId = selectedRoom.id;
    
    // Carica le azioni dal file corretto
    const backupActions = await loadBackupActions();
    
    // Verifica che esista la sezione specialGames nel backupActions
    if (!backupActions.specialGames || !backupActions.specialGames[gameType]) {
      console.error(t.logMessages.missingSpecialGame.replace('{type}', gameType));
      // Continua con il prossimo turno normale in caso di errore
      nextTurn();
      return;
    }
    
    // Ottieni il testo del gioco dal backup
    let actionText = backupActions.specialGames[gameType].text;
    
    // Gestisci i vari tipi di gioco
    switch (gameType) {
      case "bouncer":
        // Scegli un giocatore diverso da quello corrente
        let specialPlayerIndex;
        do {
          specialPlayerIndex = Math.floor(Math.random() * players.length);
        } while (specialPlayerIndex === currentPlayerIndex);
        
        setSpecialGamePlayer(players[specialPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore
        actionText = actionText.replace(/{player}/g, players[specialPlayerIndex]);
        break;
        
      case "pointFinger":
      case "infamata":
      case "ilPezzoGrosso":
      case "cringeOrClassy":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Imposta direttamente il risultato casuale senza fase di votazione
        const isClassy = Math.random() > 0.5;
        setCringeOrClassyResult(isClassy ? 'classy' : 'cringe');
        setCringeOrClassyState("result"); // Passa direttamente allo stato result
        break;
      
      case "truthOrDare":
        // Crea una lista di tutti gli indici dei giocatori da processare
        const playerIndices = Array.from({ length: players.length }, (_, i) => i);
        
        // Imposta il giocatore corrente come primo e poi mescola il resto
        const currentFirst = [currentPlayerIndex];
        const remainingPlayers = playerIndices.filter(idx => idx !== currentPlayerIndex);
        const shuffledRemaining = remainingPlayers.sort(() => Math.random() - 0.5);
        
        // Combina per avere il giocatore attuale per primo e poi tutti gli altri
        setTruthDarePlayers([...currentFirst, ...shuffledRemaining]);
        
        // Imposta lo stato iniziale del gioco
        setTruthDareState("choosing");
        setCurrentTruthDareChoice(null);
        setTruthDareContent(null);
        
        // Carica il pool di contenuti per verità e obblighi
        if (backupActions.truthDareGame) {
          setTruthDareContentPool({
            truth: [...backupActions.truthDareGame.truth || []].sort(() => Math.random() - 0.5),
            dare: [...backupActions.truthDareGame.dare || []].sort(() => Math.random() - 0.5)
          });
        }
        
        // Il giocatore corrente sarà il primo a giocare
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = t.truthDareIntro.replace('{player}', players[currentPlayerIndex]);
        break;
    }
    
    // Imposta il gioco speciale attivo
    setActiveSpecialGame(gameType);
    
    // Marca il gioco come usato
    setSpecialGamesUsed(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [gameType]: true
      }
    }));
    
    // Imposta l'azione corrente
    setCurrentAction({ text: actionText });
    
    // Aggiorna il contatore dell'ultima azione speciale
    setLastSpecialGameRound(prev => ({
      ...prev,
      [roomId]: actionsCounter
    }));
  };
  
  // Funzione dedicata per aggiornare l'azione corrente
  const updateCurrentAction = async () => {
    if (!selectedRoom) return;
    
    const roomId = selectedRoom.id;
    
    // Carica le azioni dal file di backup
    const backupActions = await loadBackupActions();

    // Verifica se è il momento di mostrare un'azione di gruppo
    if (groupActionsPool.length > 0 && 
        groupActionPositions.includes(actionsCounter) && 
        groupActionsShown < 2) {
      
      // Seleziona un'azione di gruppo casuale
      const randomIndex = Math.floor(Math.random() * groupActionsPool.length);
      const groupAction = groupActionsPool[randomIndex];
      
      // Rimuovi questa azione dal pool per evitare duplicati
      const updatedPool = [...groupActionsPool];
      updatedPool.splice(randomIndex, 1);
      setGroupActionsPool(updatedPool);
      
      // Imposta l'azione di gruppo come azione corrente
      setCurrentAction({ text: groupAction.text });
      
      // Incrementa il contatore di azioni di gruppo mostrate
      setGroupActionsShown(prev => prev + 1);
      
      // Incrementa il contatore delle azioni
      setActionsCounter(prev => prev + 1);
      
      return;
    }
    
    // Verifica se ci sono abbastanza azioni dall'ultima azione speciale
    const actionsSinceLastSpecial = actionsCounter - lastSpecialGameRound[roomId];
    const canShowSpecialGame = actionsSinceLastSpecial >= MIN_ACTIONS_BETWEEN_SPECIAL_GAMES;
    
    // Controlla se è il momento di mostrare un gioco speciale
    if (canShowSpecialGame && actionsCounter < MAX_ACTIONS_PER_GAME - 1) {
      // Verifica ogni tipo di gioco speciale
      for (const gameType of SPECIAL_GAMES) {
        // Verifica solo se il gioco non è già stato usato e se è il momento giusto
        if (!specialGamesUsed[roomId][gameType] && actionsCounter >= specialGamesRound[roomId][gameType]) {
          handleSpecialGame(gameType);
          return;
        }
      }
    }
    
    const currentPool = roomActionsPool[roomId];
    let index = currentActionIndex[roomId];
    
    // Se non ci sono azioni nel pool, usa quelle predefinite
    if (!currentPool || currentPool.length === 0) {
      console.log(t.logMessages.noActionsInPool);
      
      // Per Neon Roulette, raccogliamo azioni dal fallback di tutte le stanze in modo bilanciato
      if (roomId === 'neonRoulette') {
        // Crea un pool di fallback per ogni stanza
        const fallbackTexts = [
          { text: t.noActionAvailable },
          { text: t.noActionAvailable },
          { text: t.noActionAvailable }
        ];
        
        if (fallbackTexts.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackTexts.length);
          setCurrentAction({ text: fallbackTexts[randomIndex].text });
        } else {
          setCurrentAction({ text: t.noActionAvailable });
        }
      } 
      // Per altre stanze, usa il fallback normale
      else {
        setCurrentAction({ text: t.noActionAvailable });
      }
      
      // Incrementa il contatore delle azioni (anche per il fallback)
      setActionsCounter(prev => prev + 1);
      
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
        
        // Scegli una formulazione casuale
        const randomQuestionAlt = t.penaltyAlternatives.questions[
          Math.floor(Math.random() * t.penaltyAlternatives.questions.length)
        ].replace('{count}', penaltyCount);
        
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
        
        // Scegli una formulazione casuale
        const randomAlt = t.penaltyAlternatives.statements[
          Math.floor(Math.random() * t.penaltyAlternatives.statements.length)
        ].replace('{count}', penaltyCount);
        
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
      // Segna che l'utente ha giocato la partita gratuita
      setHasPlayedFreeGame(true);
      localStorage.setItem('hasPlayedFreeGame', 'true');
      
      // Vai alla schermata di fine partita
      setGameState('gameOver');
      return;
    }
    
    // Incrementa l'indice per la prossima volta, ma solo se non siamo in una fase speciale
    if (!activeSpecialGame || afterSpecialAction) {
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
    if (!activeSpecialGame || afterSpecialAction) {
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
        // Se l'utente ha già giocato e non ha pagato, mostra il paywall
        if (hasPlayedFreeGame && !hasPaid) {
          setGameState('paywall');
        } else {
          setGameState('roomSelection');
        }
        break;
      case 'paywall':
        setGameState('welcome');
        break;
      case 'languageSelection':
        setGameState('welcome');
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
    
    // Resetta gli stati dei giochi speciali
    setActiveSpecialGame(null);
    setSpecialGamePlayer(null);
    
    // Resetta tutti gli stati di giochi usati e round
    const resetUsedGames = {};
    const resetGameRounds = {};
    
    // Resetta per ogni stanza e ogni tipo di gioco
    t.rooms.forEach(room => {
      resetUsedGames[room.id] = SPECIAL_GAMES.reduce((acc, game) => {
        acc[game] = false;
        return acc;
      }, {});
      
      resetGameRounds[room.id] = SPECIAL_GAMES.reduce((acc, game, index) => {
        // Valori di default se non abbiamo posizioni specifiche
        const defaultPositions = {
          bouncer: 15,
          pointFinger: 30,
          infamata: 20,
          truthOrDare: 25,
          ilPezzoGrosso: 35,
          cringeOrClassy: 40
        };
        acc[game] = defaultPositions[game] || 10 + (index * 10);
        return acc;
      }, {});
    });
    
    setSpecialGamesUsed(resetUsedGames);
    setSpecialGamesRound(resetGameRounds);
    
    // Resetta la lista dei debiti
    setDebtList([]);
    
    // NUOVO: Resetta il contatore dell'ultima azione speciale
    setLastSpecialGameRound({
      redRoom: 0,
      darkRoom: 0,
      clash: 0,
      party: 0,
      neonRoulette: 0
    });
    
    // Resetta gli stati del gioco Obbligo Verità Debito
    setTruthDarePlayers([]);
    setCurrentTruthDareChoice(null);
    setTruthDareContent(null);
    setTruthDareState(null);
    
    // Resetta gli stati del gioco Cringe or Classy
    setCringeOrClassyState(null);
    setCringeOrClassyResult(null);
    
    // Resetta le azioni di gruppo
    setGroupActionsPool([]);
    setGroupActionPositions([]);
    setGroupActionsShown(0);
  };
  
  // Seleziona un'opzione di pagamento
  const selectPaymentOption = (option) => {
    setSelectedPaymentOption(option);
  };
  
  // Processa il pagamento
  const processPayment = () => {
    if (!selectedPaymentOption) return;
    
    setIsProcessingPayment(true);
    
    // Simulazione del processo di pagamento
    setTimeout(() => {
      // Imposta hasPaid a true e salva in localStorage
      setHasPaid(true);
      localStorage.setItem('hasPaid', 'true');
      
      setIsProcessingPayment(false);
      setSelectedPaymentOption(null);
      
      // Vai alla schermata di setup giocatori
      setGameState('playerSetup');
    }, 2000);
  };
  
  // Reimposta lo stato di gioco per test
  const resetPaywallState = () => {
    localStorage.removeItem('hasPaid');
    localStorage.removeItem('hasPlayedFreeGame');
    setHasPaid(false);
    setHasPlayedFreeGame(false);
    resetGame();
  };
  
  // Funzione helper per ottenere il messaggio appropriato per il gioco speciale corrente
  const getSpecialGameMessage = () => {
    if (!activeSpecialGame || !specialGamePlayer) return null;
    
    // Messaggi per ciascun tipo di gioco
    if (activeSpecialGame === "truthOrDare") {
      if (truthDareState === "choosing") {
        return t.specialGames.truthOrDare.choosing.replace('{player}', specialGamePlayer);
      } else {
        const choiceKey = currentTruthDareChoice || 'truth';
        return t.specialGames.truthOrDare[choiceKey].replace('{player}', specialGamePlayer);
      }
    }
    
    // Per gli altri giochi
    return t.specialGames[activeSpecialGame]?.replace('{player}', specialGamePlayer) || null;
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
            }}>{t.appName}</h1>
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '40px',
              color: '#CCCCCC',
              lineHeight: '1.5'
            }}>{t.appDescription}</p>
            
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
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              {t.startButton}
            </button>
            
            <button 
              onClick={openLanguageSelector}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1px solid #3498db',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {language === 'it' ? '🇮🇹 Italiano' : '🇬🇧 English'} - {language === 'it' ? 'Cambia lingua' : 'Change language'}
            </button>
            
            {/* Pulsante nascosto per reset (solo per testing) */}
            <div style={{ marginTop: '20px', opacity: 0.5 }}>
              <button
                onClick={resetPaywallState}
                style={{
                  background: 'none',
                  border: '1px solid #555',
                  color: '#888',
                  padding: '8px 16px',
                  fontSize: '12px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {t.resetButton}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Language Selection Screen */}
      {gameState === 'languageSelection' && (
        <div className="screen language-selection-screen" style={{ 
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
              {language === 'it' ? 'LINGUA' : 'LANGUAGE'}
            </h1>
            
            <div></div>
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '20px'
            }}>
              <button 
                onClick={() => changeLanguage('it')}
                style={{
                  backgroundColor: language === 'it' ? '#3498db' : '#2A2A2A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>🇮🇹</span>
                <div style={{
                  textAlign: 'left',
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '5px'
                  }}>
                    Italiano
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#AAAAAA',
                    margin: 0
                  }}>
                    Gioca in Italiano
                  </p>
                </div>
                {language === 'it' && (
                  <span style={{ fontSize: '24px', color: '#FFFFFF' }}>✓</span>
                )}
              </button>
              
              <button 
                onClick={() => changeLanguage('en')}
                style={{
                  backgroundColor: language === 'en' ? '#3498db' : '#2A2A2A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>🇬🇧</span>
                <div style={{
                  textAlign: 'left',
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '5px'
                  }}>
                    English
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#AAAAAA',
                    margin: 0
                  }}>
                    Play in English
                  </p>
                </div>
                {language === 'en' && (
                  <span style={{ fontSize: '24px', color: '#FFFFFF' }}>✓</span>
                )}
              </button>
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
              onClick={goBack}
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
              {language === 'it' ? 'CONFERMA' : 'CONFIRM'}
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
              {t.playersScreenTitle}
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
                  placeholder={t.playerInputPlaceholder}
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
              <span style={{ fontSize: '20px' }}>⊕</span> {t.addPlayerLabel}
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
              <span style={{ fontSize: '20px' }}>▶</span> {t.startGameButton}
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
          height: '100vh',
          overflowY: 'auto'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '10px'
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
              {t.roomsScreenTitle}
            </h1>
            
            <div></div>
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px',
            minHeight: '450px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '300px',
              height: 'auto',
              minHeight: '300px',
              maxHeight: '70vh',
              backgroundColor: t.rooms[currentRoomIndex].color,
              borderRadius: '15px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '30px',
              marginBottom: '15px'
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: t.rooms[currentRoomIndex].color === '#1F2937' || 
                        t.rooms[currentRoomIndex].color === '#DC2626' || 
                        t.rooms[currentRoomIndex].color === '#D946EF' ? '#FFFFFF' : '#000000'
                }}>
                  {t.rooms[currentRoomIndex].name}
                </h2>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => selectRoom(t.rooms[currentRoomIndex])}
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
                  {t.enterButton}
                </button>
              </div>
              
              <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                <p style={{
                  fontSize: '16px',
                  textAlign: 'center',
                  color: t.rooms[currentRoomIndex].color === '#1F2937' ? '#9CA3AF' :
                        t.rooms[currentRoomIndex].color === '#DC2626' ? 'rgba(255,255,255,0.8)' :
                        t.rooms[currentRoomIndex].color === '#D946EF' ? '#f5d0fe' : 
                        'rgba(0,0,0,0.7)'
                }}>
                  {t.rooms[currentRoomIndex].description}
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <button 
                onClick={() => setCurrentRoomIndex((prev) => (prev === 0 ? t.rooms.length - 1 : prev - 1))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#AAAAAA',
                  fontSize: '36px',
                  cursor: 'pointer',
                  padding: '10px'
                }}
              >
                ‹
              </button>
              
              <div style={{ 
                display: 'flex',
                gap: '8px'
              }}>
                {t.rooms.map((_, index) => (
                  <div 
                    key={index}
                    onClick={() => setCurrentRoomIndex(index)}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: index === currentRoomIndex ? '#FFFFFF' : '#555555',
                      cursor: 'pointer'
                    }}
                  ></div>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentRoomIndex((prev) => (prev === t.rooms.length - 1 ? 0 : prev + 1))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#AAAAAA',
                  fontSize: '36px',
                  cursor: 'pointer',
                  padding: '10px'
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
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '10px 0 30px 0'
            }}>
              {activeSpecialGame ? t.specialGamesTitles[activeSpecialGame] : players[currentPlayerIndex]}
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
              
              {/* Messaggio unificato per i giochi speciali attivi */}
              {activeSpecialGame && (
                <p style={{ 
                  marginTop: '15px', 
                  fontSize: '16px', 
                  color: '#AAAAAA',
                  textAlign: 'center'
                }}>
                  {getSpecialGameMessage()}
                </p>
              )}
              
              {/* Pulsanti per la scelta Obbligo/Verità/Debito */}
              {activeSpecialGame === "truthOrDare" && truthDareState === "choosing" && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px',
                  marginTop: '20px'
                }}>
                  <p style={{ fontSize: '16px', color: '#AAAAAA' }}>
                    {t.truthDareOptions.selectOption}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => handleTruthDareChoice("truth")}
                      style={{
                        backgroundColor: '#E74C3C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {t.truthDareOptions.truth}
                    </button>
                    <button
                      onClick={() => handleTruthDareChoice("dare")}
                      style={{
                        backgroundColor: '#3498DB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {t.truthDareOptions.dare}
                    </button>
                    <button
                      onClick={() => handleTruthDareChoice("debt")}
                      style={{
                        backgroundColor: '#2ECC71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {t.truthDareOptions.debt}
                    </button>
                  </div>
                </div>
              )}

              {/* Mostra il contenuto della scelta */}
              {activeSpecialGame === "truthOrDare" && truthDareState === "executing" && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: currentTruthDareChoice === "truth" ? '#E74C3C20' :
                                currentTruthDareChoice === "dare" ? '#3498DB20' :
                                '#2ECC7120',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    marginBottom: '10px',
                    color: currentTruthDareChoice === "truth" ? '#E74C3C' :
                        currentTruthDareChoice === "dare" ? '#3498DB' :
                        '#2ECC71'
                  }}>
                    {currentTruthDareChoice === "truth" ? t.truthDareOptions.truth :
                    currentTruthDareChoice === "dare" ? t.truthDareOptions.dare :
                    t.truthDareOptions.debt}
                  </h3>
                  
                  {truthDareContent && (
                    <p style={{ fontSize: '18px' }}>
                      {truthDareContent}
                    </p>
                  )}
                  
                  {currentTruthDareChoice === "debt" && (
                    <p style={{ fontSize: '16px', color: '#AAAAAA', marginTop: '10px' }}>
                      {t.truthDareOptions.debtExplanation}
                    </p>
                  )}
                </div>
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
                if (activeSpecialGame === "truthOrDare") {
                  if (truthDareState === "choosing") {
                    // Se il giocatore non ha fatto una scelta, non fare nulla
                    return;
                  } else if (truthDareState === "executing") {
                    // Prosegui al prossimo giocatore o termina il gioco
                    nextTurnAfterSpecialGame();
                  }
                } else if (activeSpecialGame === "cringeOrClassy") {
                  // Prosegui al prossimo turno
                  nextTurnAfterSpecialGame();
                } else if (activeSpecialGame) {
                  nextTurnAfterSpecialGame();
                } else {
                  nextTurn();
                }
              }}
              style={{
                width: '100%',
                backgroundColor: 
                  (activeSpecialGame === "truthOrDare" && truthDareState === "choosing")
                    ? '#AAAAAA' // disabilitato visivamente se il gioco è in corso
                    : '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 
                  (activeSpecialGame === "truthOrDare" && truthDareState === "choosing")
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  (activeSpecialGame === "truthOrDare" && truthDareState === "choosing")
                    ? 0.5
                    : 1
              }}
            >
              {activeSpecialGame === "truthOrDare" && truthDareState === "choosing" 
                ? t.truthDareOptions.chooseOption
                : t.nextButton}
            </button>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div 
          className="screen game-over-screen" 
          onClick={() => {
            // Se l'utente ha già giocato la partita gratuita e non ha pagato, mostra il paywall
            if (hasPlayedFreeGame && !hasPaid) {
              setGameState('paywall');
            } else {
              setGameState('roomSelection');
            }
          }}
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
              {t.gameOverMessage}
            </h1>
            
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '50px',
              color: '#CCCCCC',
              lineHeight: '1.5'
            }}>
              {t.actionsCompletedMessage.replace('{count}', MAX_ACTIONS_PER_GAME)}
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
              {t.tapToContinueMessage.replace(
                '{action}', 
                hasPlayedFreeGame && !hasPaid 
                  ? t.unlockMoreGamesMessage 
                  : t.returnToRoomsMessage
              )}
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
      
      {/* Paywall Screen */}
      {gameState === 'paywall' && (
        <div className="screen paywall-screen" style={{ 
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
              {t.unlockGameTitle}
            </h1>
            
            <div></div> {/* Colonna vuota a destra per equilibrio */}
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px'
          }}>
            <div style={{
              backgroundColor: '#1A1A1A',
              borderRadius: '15px',
              padding: '25px 20px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                {t.freeGameEndedTitle}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#CCCCCC',
                lineHeight: '1.5',
                marginBottom: '20px'
              }}>
                {t.freeGameEndedMessage}
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                marginTop: '25px'
              }}>
                {t.paymentOptions.map(option => (
                  <div 
                    key={option.id}
                    onClick={() => selectPaymentOption(option)}
                    style={{
                      backgroundColor: selectedPaymentOption?.id === option.id ? '#3498db20' : '#2A2A2A',
                      border: selectedPaymentOption?.id === option.id ? '2px solid #3498db' : '2px solid transparent',
                      borderRadius: '10px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {option.name}
                      </h3>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#3498db'
                      }}>
                        €{option.price}
                      </div>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#AAAAAA',
                      textAlign: 'left'
                    }}>
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
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
              onClick={processPayment}
              disabled={!selectedPaymentOption || isProcessingPayment}
              style={{
                width: '100%',
                backgroundColor: selectedPaymentOption ? '#3498db' : '#555555',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: selectedPaymentOption ? 'pointer' : 'not-allowed',
                opacity: isProcessingPayment ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {isProcessingPayment ? t.processingPayment : t.purchaseButton}
            </button>
          </div>
        </div>
      )}
      
      {/* Interfaccia per i debiti */}
      {gameState === 'playing' && debtList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          right: '20px',
          zIndex: 100
        }}>
          <button
            onClick={() => alert(`${t.debts.activeDebtsTitle}\n${debtList.filter(d => d.status === 'active').map(d => `- ${d.player}: ${d.description}`).join('\n')}`)}
            style={{
              backgroundColor: '#EAB308',
              color: 'black',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
          >
            {t.debts.buttonLabel}
          </button>
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
            }}>{t.loadingMessage}</p>
            
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