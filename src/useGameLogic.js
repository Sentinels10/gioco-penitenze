// useGameLogic.js - Custom hook for managing game state and logic
import { useState, useEffect } from 'react';
import translations from './translations';

/**
 * Custom hook for managing all game logic and state
 */
const useGameLogic = () => {
  // Stato per la lingua selezionata (default: italiano)
  const [language, setLanguage] = useState('it');
  // Riferimento alle traduzioni nella lingua corrente
  const t = translations[language];
  
  // Game states: 'welcome', 'playerSetup', 'roomSelection', 'playing', 'gameOver', 'paywall', 'languageSelection', 'leaderboard'
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
  
  // NUOVO: Sistema di punteggio
  const [playerPenalties, setPlayerPenalties] = useState({});
  
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
    
    // NUOVO: Inizializza i punteggi per tutti i giocatori a 0
    const initialPenalties = {};
    validPlayers.forEach(player => {
      initialPenalties[player] = 0;
    });
    setPlayerPenalties(initialPenalties);
    
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
        // Mescola le azioni di gruppo e seleziona fino a 15 per questa partita
        // (aumentato da 10 per garantire abbastanza azioni uniche)
        const shuffledGroupActions = [...backupActions.groupActions]
          .sort(() => Math.random() - 0.5)
          .slice(0, 15);
        
        setGroupActionsPool(shuffledGroupActions);
        
        // Determina in quali posizioni dovrebbero apparire le azioni di gruppo
        // Ora vogliamo 8 azioni di gruppo durante la partita
        const positions = [];
        
        // Dividiamo la partita in segmenti per distribuire le azioni di gruppo
        // Escludiamo le prime 2 azioni e le ultime 5 per non avere azioni di gruppo all'inizio o alla fine
        const startPosition = 2;
        const endPosition = MAX_ACTIONS_PER_GAME - 5;
        const availableRange = endPosition - startPosition;
        
        // Calcoliamo quante azioni normali dovrebbero esserci tra ogni azione di gruppo
        // Per avere 8 azioni di gruppo, avremo bisogno di 7 intervalli
        const interval = Math.floor(availableRange / 8);
        
        // Garantiamo almeno 2 azioni normali tra ogni azione di gruppo
        const minSpacing = 2;
        
        // Generiamo le 8 posizioni con un po' di randomicità ma mantenendo la distanza minima
        for (let i = 0; i < 8; i++) {
          // Base position nel suo segmento
          const basePosition = startPosition + (i * interval);
          
          // Aggiungiamo un po' di randomicità ma manteniamo la distanza minima
          // La randomicità è limitata per non sconfinare nel segmento successivo
          const maxOffset = Math.max(0, Math.min(interval - minSpacing, 3));
          const randomOffset = Math.floor(Math.random() * maxOffset);
          
          positions.push(basePosition + randomOffset);
        }
        
        setGroupActionPositions(positions);
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
        groupActionsShown < 8) {  // Modificato da 2 a 8
      
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
  
  // NUOVO: Funzione per gestire il pulsante "Fatto"
  const handleDone = () => {
    // Passa al turno successivo senza aggiungere penalità
    nextTurn();
  };
  
  // NUOVO: Funzione per gestire il pulsante "Paga"
  const handlePay = () => {
    // Aggiungi una penalità al giocatore corrente
    const currentPlayer = players[currentPlayerIndex];
    setPlayerPenalties(prev => ({
      ...prev,
      [currentPlayer]: (prev[currentPlayer] || 0) + 1
    }));
    
    // Passa al turno successivo
    nextTurn();
  };
  
  // Passa al turno successivo
  const nextTurn = (afterSpecialAction = false) => {
    const roomId = selectedRoom.id;
    
    // Verifica se il numero massimo di azioni è stato raggiunto
    if (actionsCounter >= MAX_ACTIONS_PER_GAME - 1) {
      // Segna che l'utente ha giocato la partita gratuita
      setHasPlayedFreeGame(true);
      localStorage.setItem('hasPlayedFreeGame', 'true');
      
      // NUOVO: Vai alla schermata della leaderboard invece che al game over
      setGameState('leaderboard');
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
  
  // NUOVO: Funzione per terminare il gioco dopo aver visualizzato la leaderboard
  const endGame = () => {
    // Vai alla schermata di game over
    setGameState('gameOver');
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
      case 'leaderboard': // NUOVO: Gestisci il ritorno dalla leaderboard
        setGameState('gameOver');
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
    
    // NUOVO: Resetta il contatore delle penalità
    setPlayerPenalties({});
    
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

  // NUOVO: Ottieni la leaderboard ordinata per numero di penalità
  const getLeaderboard = () => {
    return Object.entries(playerPenalties)
      .sort(([, penaltiesA], [, penaltiesB]) => penaltiesB - penaltiesA)
      .map(([player, penalties]) => ({ player, penalties }));
  };

  // Export everything that will be needed by the UI component
  return {
    // Constants
    MAX_ACTIONS_PER_GAME,
    MIN_ACTIONS_BETWEEN_SPECIAL_GAMES,
    
    // State
    language,
    t,
    gameState,
    players,
    inputPlayers,
    currentPlayerIndex,
    currentAction,
    selectedRoom,
    isLoading,
    loadingProgress,
    currentRoomIndex,
    activeSpecialGame,
    specialGamePlayer,
    debtList,
    hasPlayedFreeGame,
    hasPaid,
    selectedPaymentOption,
    isProcessingPayment,
    truthDarePlayers,
    currentTruthDareChoice,
    truthDareContent,
    truthDareState,
    cringeOrClassyState,
    cringeOrClassyResult,
    playerPenalties, // NUOVO: Espone il contatore delle penalità
    
    // Functions
    changeLanguage,
    openLanguageSelector,
    enterPlayerSetup,
    addPlayerInput,
    updatePlayerName,
    removePlayerInput,
    startGame,
    handleKeyPress,
    selectRoom,
    nextTurn,
    nextTurnAfterSpecialGame,
    handleTruthDareChoice,
    goBack,
    resetGame,
    selectPaymentOption,
    processPayment,
    resetPaywallState,
    getSpecialGameMessage,
    handleDone, // NUOVO: Funzione per il pulsante "Fatto"
    handlePay, // NUOVO: Funzione per il pulsante "Paga"
    getLeaderboard, // NUOVO: Funzione per ottenere la leaderboard
    endGame, // NUOVO: Funzione per terminare il gioco dopo la leaderboard
    
    // Additional state setters that need to be exposed
    setCurrentRoomIndex,
    setGameState
  };
};

export default useGameLogic;