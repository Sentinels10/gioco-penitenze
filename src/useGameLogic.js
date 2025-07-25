// useGameLogic.js - Custom hook per gestire lo stato e la logica del gioco
import { useState, useEffect, useRef } from 'react';
import translations from './translations';
import useSpecialGames from './useSpecialGames';

/**
 * Custom hook per gestire tutta la logica e lo stato del gioco
 */
const useGameLogic = () => {
  // Stato per la lingua selezionata (default: italiano)
  const [language, setLanguage] = useState('it');
  // Riferimento alle traduzioni nella lingua corrente
  const t = translations[language];
  
  // Game states: 'welcome', 'gameSelection', 'playerSetup', 'roomSelection', 'playing', 'gameOver', 'paywall', 'languageSelection'
  const [gameState, setGameState] = useState('welcome');
  const [players, setPlayers] = useState([]);
  const [inputPlayers, setInputPlayers] = useState([{ id: 1, name: '' }]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [previousAction, setPreviousAction] = useState(null);
  
  // Stati per la selezione giochi (usati quando si entra nella stanza "giochi")
  const [selectedGames, setSelectedGames] = useState({
    truthOrDare: false,
    wouldYouRather: false,
    nonHoMai: false
  });
  
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
    giochi: [], // Nuovo pool per la stanza giochi
    neonRoulette: []
  });
  
  // Current index for tracking which action to use from the pool
  const [currentActionIndex, setCurrentActionIndex] = useState({
    redRoom: 0,
    darkRoom: 0,
    coppie: 0,
    party: 0,
    giochi: 0,
    neonRoulette: 0
  });
  
  // Stato per le azioni di gruppo
  const [groupActionsPool, setGroupActionsPool] = useState([]);
  // Indici per quando devono apparire le azioni di gruppo
  const [groupActionPositions, setGroupActionPositions] = useState([]);
  // Contatore per le azioni di gruppo mostrate
  const [groupActionsShown, setGroupActionsShown] = useState(0);
  
  // Nuovi stati per il paywall
  const [hasPlayedFreeGame, setHasPlayedFreeGame] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Flag per controllare se è stata caricata la prima azione
  const [isFirstActionLoaded, setIsFirstActionLoaded] = useState(false);
  
  // Inizializza lo hook per i giochi speciali
  const specialGames = useSpecialGames({
    t,
    players,
    selectedRoom,
    currentPlayerIndex,
    actionsCounter,
    setCurrentAction,
    loadBackupActions,
    MAX_ACTIONS_PER_GAME,
    gameMode: selectedRoom?.id === 'giochi' ? 'games' : 'rooms',
    selectedGames
  });
  
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
    if (gameState === 'playing' && selectedRoom && !isFirstActionLoaded) {
      console.log("=== DEBUG useEffect for first action ===");
      console.log("gameState:", gameState);
      console.log("selectedRoom:", selectedRoom?.id);
      console.log("isFirstActionLoaded:", isFirstActionLoaded);
      
      const poolKey = selectedRoom.id;
      console.log("poolKey:", poolKey);
      console.log("roomActionsPool for key:", roomActionsPool[poolKey]?.length);
      
      // Verifica che il pool di azioni sia caricato prima di procedere
      if (roomActionsPool[poolKey] && roomActionsPool[poolKey].length > 0) {
        console.log("Pool is ready, loading first action");
        setTimeout(() => {
          updateCurrentAction();
          setIsFirstActionLoaded(true);
        }, 100);
      } else {
        console.log("Pool not ready yet, waiting...");
        // Se il pool non è ancora pronto, riprova dopo un breve delay
        const retryTimeout = setTimeout(() => {
          if (roomActionsPool[poolKey] && roomActionsPool[poolKey].length > 0) {
            console.log("Pool ready on retry, loading first action");
            updateCurrentAction();
            setIsFirstActionLoaded(true);
          }
        }, 300);
        
        return () => clearTimeout(retryTimeout);
      }
    }
  }, [gameState, selectedRoom, isFirstActionLoaded, roomActionsPool]);
  
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
  
  // Funzioni per gestire la selezione dei giochi (per la stanza "giochi")
  const toggleGameSelection = (gameType) => {
    setSelectedGames(prev => ({
      ...prev,
      [gameType]: !prev[gameType]
    }));
  };
  
  const proceedWithSelectedGames = () => {
    // Verifica che almeno un gioco sia selezionato
    const hasSelectedGames = Object.values(selectedGames).some(selected => selected);
    
    if (!hasSelectedGames) {
      alert(t.gameSelection.noGamesSelectedError);
      return;
    }
    
    // Avvia la modalità giochi con i giochi selezionati
    startGamesMode();
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
    
    // Vai alla selezione stanze
    setGameState('roomSelection');
  };
  
  // Avvia la modalità giochi selezionati
  const startGamesMode = async () => {
    console.log("=== DEBUG startGamesMode ===");
    console.log("selectedGames:", selectedGames);
    
    setIsLoading(true);
    setIsFirstActionLoaded(false);
    
    try {
      // Simulazione caricamento
      for (let i = 0; i <= 100; i += 10) {
        setLoadingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Resetta il contatore delle azioni
      setActionsCounter(0);
      
      // Inizializza gli stati per i giochi speciali
      specialGames.initializeSpecialGames('giochi');
      
      // Prepara il pool di azioni per la modalità giochi
      await prepareGamesPool();
      
      // Resetta l'indice delle azioni
      setCurrentActionIndex(prev => ({
        ...prev,
        giochi: 0
      }));
      
      // Resetta l'azione precedente
      setPreviousAction(null);
      
      // Seleziona un giocatore casuale per iniziare
      const randomPlayerIndex = Math.floor(Math.random() * players.length);
      setCurrentPlayerIndex(randomPlayerIndex);
      
      // Attendiamo un momento per assicurarci che gli stati siano aggiornati
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Vai alla schermata di gioco
      setGameState('playing');
      
      // Carica immediatamente la prima azione
      setTimeout(() => {
        console.log("=== Loading first action for games mode ===");
        updateCurrentAction();
        setIsFirstActionLoaded(true);
      }, 200);
      
    } catch (error) {
      console.error('Errore nell\'avvio modalità giochi:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prepara il pool di azioni per la modalità giochi
  const prepareGamesPool = async () => {
    const backupActions = await loadBackupActions();
    const gamesPool = [];
    
    // Conta quanti giochi sono selezionati
    const selectedGamesCount = Object.values(selectedGames).filter(selected => selected).length;
    
    console.log("Games mode - adding ONLY selected games");
    
    // Calcola quante istanze di ogni gioco aggiungere per riempire la partita
    const totalInstances = 50; // Abbastanza per una lunga partita
    const instancesPerGame = Math.floor(totalInstances / selectedGamesCount);
    const extraInstances = totalInstances % selectedGamesCount;
    
    let gameIndex = 0;
    
    if (selectedGames.truthOrDare) {
      const instances = instancesPerGame + (gameIndex < extraInstances ? 1 : 0);
      for (let i = 0; i < instances; i++) {
        gamesPool.push({ text: "SPECIAL_GAME:truthOrDare" });
      }
      gameIndex++;
    }
    
    if (selectedGames.wouldYouRather) {
      const instances = instancesPerGame + (gameIndex < extraInstances ? 1 : 0);
      for (let i = 0; i < instances; i++) {
        gamesPool.push({ text: "SPECIAL_GAME:wouldYouRather" });
      }
      gameIndex++;
    }
    
    if (selectedGames.nonHoMai) {
      const instances = instancesPerGame + (gameIndex < extraInstances ? 1 : 0);
      for (let i = 0; i < instances; i++) {
        gamesPool.push({ text: "SPECIAL_GAME:nonHoMai" });
      }
      gameIndex++;
    }
    
    // Mescola il pool per randomizzare l'ordine dei giochi
    const finalPool = gamesPool.sort(() => Math.random() - 0.5);
    
    // Aggiorna il pool
    setRoomActionsPool(prev => ({
      ...prev,
      giochi: finalPool
    }));
    
    console.log("Games pool prepared with", finalPool.length, "actions");
    console.log("Selected games count:", selectedGamesCount);
    console.log("Special games instances:", finalPool.filter(a => a.text.startsWith("SPECIAL_GAME:")).length);
    console.log("Normal actions:", finalPool.filter(a => !a.text.startsWith("SPECIAL_GAME:")).length);
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
  async function loadBackupActions() {
    try {
      // Determina il nome del file in base alla lingua corrente
      const backupActionsFileName = `backupActions_${language}.json`;
      let backupActionsModule;
      
      // Prima tenta di caricare dalla cartella actions
      try {
        // Importa il file dalla cartella actions
        backupActionsModule = await import(`./actions/${backupActionsFileName}`);
        console.log(`Caricato con successo: ./actions/${backupActionsFileName}`);
        return backupActionsModule.default;
      } catch (error) {
        console.warn(`Errore nel caricamento di ./actions/${backupActionsFileName}:`, error);
        
        // Se non riesce, prova con la lingua inglese come fallback
        try {
          backupActionsModule = await import('./actions/backupActions_en.json');
          console.log('Fallback: Caricato backupActions_en.json');
          return backupActionsModule.default;
        } catch (enError) {
          console.warn('Errore nel caricamento del fallback inglese:', enError);
          
          // Ultimo tentativo: italiano
          try {
            backupActionsModule = await import('./actions/backupActions_it.json');
            console.log('Fallback: Caricato backupActions_it.json');
            return backupActionsModule.default;
          } catch (itError) {
            console.error('Impossibile caricare qualsiasi file di backup:', itError);
            return {}; // Restituisce un oggetto vuoto se tutti i tentativi falliscono
          }
        }
      }
    } catch (error) {
      console.error('Errore generale nel caricamento dei file backupActions:', error);
      return {}; // Restituisce un oggetto vuoto in caso di errore generale
    }
  }
  
  // Seleziona una stanza e prepara il gioco
  const selectRoom = async (room) => {
    console.log("=== DEBUG selectRoom ===");
    console.log("Selected room:", room.id);
    
    setSelectedRoom(room);
    
    // Se la stanza selezionata è "giochi", mostra la schermata di selezione giochi
    if (room.id === 'giochi') {
      // Reset della selezione dei giochi
      setSelectedGames({
        truthOrDare: false,
        wouldYouRather: false,
        nonHoMai: false
      });
      setGameState('gameSelection');
      return;
    }
    
    setIsLoading(true);
    setIsFirstActionLoaded(false);
    
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
      
      // Inizializza gli stati per i giochi speciali
      specialGames.initializeSpecialGames(room.id);
      
      // Carica le azioni di gruppo dal backup
      if (backupActions.groupActions && backupActions.groupActions.length > 0) {
        // Mescola le azioni di gruppo e seleziona fino a 15 per questa partita
        const shuffledGroupActions = [...backupActions.groupActions]
          .sort(() => Math.random() - 0.5)
          .slice(0, 15);
        
        setGroupActionsPool(shuffledGroupActions);
        
        // Determina in quali posizioni dovrebbero apparire le azioni di gruppo
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
      
      // Creiamo una variabile temporanea per il nuovo pool di azioni
      let newRoomActionsPool = {};
      
      // Se è la modalità Neon Roulette, combina azioni da tutte le altre stanze
      if (room.id === 'neonRoulette') {
        // Preparazione degli array per le azioni da ciascuna stanza
        let redRoomActions = [];
        let darkRoomActions = [];
        let coppieActions = [];
        let partyActions = [];
        let specialGameActions = [];
        
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
        
        // Raccogliamo anche le azioni dai giochi speciali
        if (backupActions.specialGames) {
          // Raccogliamo tutte le azioni dei giochi speciali
          Object.values(backupActions.specialGames).forEach(gameData => {
            if (typeof gameData === 'object' && gameData.text) {
              specialGameActions.push({ text: gameData.text });
            }
            
            // Per i giochi con sottosezioni (come tuttoHaUnPrezzo o tuttiQuelliChe)
            if (typeof gameData === 'object') {
              if (gameData.redRoom && Array.isArray(gameData.redRoom)) {
                specialGameActions = [...specialGameActions, ...gameData.redRoom.map(text => ({ text }))];
              }
              if (gameData.darkRoom && Array.isArray(gameData.darkRoom)) {
                specialGameActions = [...specialGameActions, ...gameData.darkRoom.map(text => ({ text }))];
              }
              if (gameData.party && Array.isArray(gameData.party)) {
                specialGameActions = [...specialGameActions, ...gameData.party.map(text => ({ text }))];
              }
              if (gameData.rules && Array.isArray(gameData.rules)) {
                specialGameActions = [...specialGameActions, ...gameData.rules.map(text => ({ text }))];
              }
              if (gameData.actions && Array.isArray(gameData.actions)) {
                specialGameActions = [...specialGameActions, ...gameData.actions.map(text => ({ text }))];
              }
            }
          });
        }
        
        // Se qualche categoria ha poche o nessuna azione, usa il fallback
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
        specialGameActions = specialGameActions.sort(() => Math.random() - 0.5);
        
        // Calcola quante azioni prendere da ciascuna categoria per un totale di circa 100
        const maxPerCategory = 20; // 20 azioni per categoria per fare spazio ai giochi speciali
        
        // Prendi un numero bilanciato di azioni da ciascuna categoria
        const selectedRedRoomActions = redRoomActions.slice(0, Math.min(maxPerCategory, redRoomActions.length));
        const selectedDarkRoomActions = darkRoomActions.slice(0, Math.min(maxPerCategory, darkRoomActions.length));
        const selectedCoppieActions = coppieActions.slice(0, Math.min(maxPerCategory, coppieActions.length));
        const selectedPartyActions = partyActions.slice(0, Math.min(maxPerCategory, partyActions.length));
        const selectedSpecialGameActions = specialGameActions.slice(0, Math.min(maxPerCategory, specialGameActions.length));
        
        // Combina tutte le azioni selezionate
        const combinedActions = [
          ...selectedRedRoomActions,
          ...selectedDarkRoomActions,
          ...selectedCoppieActions,
          ...selectedPartyActions,
          ...selectedSpecialGameActions
        ];
        
        // Mescola le azioni combinate
        const shuffledActions = combinedActions.sort(() => Math.random() - 0.5);
        
        console.log(t.logMessages.neonRouletteStats);
        console.log(t.logMessages.redRoomStats.replace('{count}', selectedRedRoomActions.length));
        console.log(t.logMessages.darkRoomStats.replace('{count}', selectedDarkRoomActions.length));
        console.log(t.logMessages.coppieStats.replace('{count}', selectedCoppieActions.length));
        console.log(t.logMessages.partyStats.replace('{count}', selectedPartyActions.length));
        console.log("Special Games: " + selectedSpecialGameActions.length + " azioni");
        console.log(t.logMessages.totalStats.replace('{count}', shuffledActions.length));
        
        newRoomActionsPool = {
          ...roomActionsPool,
          neonRoulette: shuffledActions
        };
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
          
          newRoomActionsPool = {
            ...roomActionsPool,
            [room.id]: shuffledBackupActions
          };
        } else {
          // Se non ci sono azioni nel backup, almeno inizializza con un array vuoto
          newRoomActionsPool = {
            ...roomActionsPool,
            [room.id]: []
          };
        }
      }
      
      console.log("=== DEBUG newRoomActionsPool ===");
      console.log("Room:", room.id);
      console.log("Actions count:", newRoomActionsPool[room.id]?.length);
      console.log("First action:", newRoomActionsPool[room.id]?.[0]?.text?.substring(0, 50));
      
      // Aggiorna tutti gli stati necessari in una sola operazione
      setRoomActionsPool(newRoomActionsPool);
      
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
      
      // Attendiamo un momento per assicurarci che gli stati siano aggiornati
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Vai alla schermata di gioco
      setGameState('playing');
      
      // Carica immediatamente la prima azione dopo aver impostato lo stato
      setTimeout(() => {
        console.log("=== Loading first action directly ===");
        console.log("Pool ready:", newRoomActionsPool[room.id]?.length);
        if (newRoomActionsPool[room.id] && newRoomActionsPool[room.id].length > 0) {
          console.log("Calling updateCurrentAction directly");
          updateCurrentActionWithPool(newRoomActionsPool);
          setIsFirstActionLoaded(true);
        }
      }, 200);
      
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Versione di updateCurrentAction che accetta il pool come parametro
  const updateCurrentActionWithPool = async (poolToUse = null) => {
    const actualPool = poolToUse || roomActionsPool;
    const roomId = selectedRoom?.id;
    
    if (!roomId) return;
    
    console.log("=== DEBUG updateCurrentActionWithPool ===");
    console.log("roomId:", roomId);
    console.log("actionsCounter:", actionsCounter);
    console.log("poolToUse provided:", !!poolToUse);
    console.log("actualPool for room:", actualPool[roomId]?.length);
    
    // Carica le azioni dal file di backup
    const backupActions = await loadBackupActions();

    // In modalità giochi, mostra solo i giochi speciali selezionati
    if (roomId === 'giochi') {
      const currentPool = actualPool[roomId];
      let index = currentActionIndex[roomId];
      
      if (!currentPool || currentPool.length === 0) {
        setCurrentAction({ text: t.noActionAvailable });
        setActionsCounter(prev => prev + 1);
        return;
      }
      
      // Se abbiamo esaurito le azioni, ricomincia dal primo
      let adjustedIndex = index % currentPool.length;
      
      // Ottieni l'azione
      const currentPoolAction = currentPool[adjustedIndex];
      let actionText = currentPoolAction.text;
      
      // Controlla se è un gioco speciale
      if (actionText.startsWith("SPECIAL_GAME:")) {
        const gameType = actionText.replace("SPECIAL_GAME:", "");
        console.log("Triggering special game from games mode:", gameType);
        
        // Attiva il gioco speciale
        await specialGames.handleSpecialGame(gameType);
        return;
      }
      
      // Gestisci il segnaposto playerB per azioni normali
      if (actionText.includes("{playerB}")) {
        const currentPlayer = players[currentPlayerIndex];
        let otherPlayers = players.filter(player => player !== currentPlayer);
        
        if (otherPlayers.length > 0) {
          const randomPlayerIndex = Math.floor(Math.random() * otherPlayers.length);
          const randomPlayerName = otherPlayers[randomPlayerIndex];
          actionText = actionText.replace(/{playerB}/g, randomPlayerName);
        } else {
          actionText = actionText.replace(/{playerB}/g, "qualcun altro");
        }
      }
      
      // Salva l'azione corrente per confrontarla la prossima volta
      setPreviousAction(currentPoolAction.text);
      
      // Imposta l'azione corrente
      setCurrentAction({ text: actionText });
      
      // Incrementa il contatore delle azioni
      setActionsCounter(prev => prev + 1);
      
      return;
    }

    // Codice originale per modalità stanze...
    // Verifica se è il momento di mostrare un'azione di gruppo
    if (groupActionsPool.length > 0 && 
        groupActionPositions.includes(actionsCounter) && 
        groupActionsShown < 8) {
      
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
    
    // Verifica se è il momento di mostrare un gioco speciale
    console.log("Checking for special game...");
    if (specialGames.shouldShowSpecialGame(actionsCounter, roomId)) {
      console.log("Should show special game!");
      
      // Trova il prossimo gioco da mostrare
      const nextGameToShow = specialGames.findNextSpecialGame(actionsCounter, roomId);
      console.log("Next game to show:", nextGameToShow);
      
      // Se abbiamo trovato un gioco da mostrare, mostralo
      if (nextGameToShow) {
        console.log("Handling special game:", nextGameToShow);
        await specialGames.handleSpecialGame(nextGameToShow);
        return;
      }
    }
    
    const currentPool = actualPool[roomId];
    let index = currentActionIndex[roomId];
    
    console.log("=== DEBUG normal action selection ===");
    console.log("currentPool length:", currentPool?.length);
    console.log("index:", index);
    
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
    
    console.log("=== DEBUG selected action ===");
    console.log("adjustedIndex:", adjustedIndex);
    console.log("actionText:", actionText?.substring(0, 100));
    
    // Gestisci il segnaposto playerB
    if (actionText.includes("{playerB}")) {
      // Ottieni il nome del giocatore corrente
      const currentPlayer = players[currentPlayerIndex];
      
      // Crea una lista di tutti gli altri giocatori (escluso quello corrente)
      let otherPlayers = players.filter(player => player !== currentPlayer);
      
      if (otherPlayers.length > 0) {
        // Seleziona un giocatore casuale tra gli altri
        const randomPlayerIndex = Math.floor(Math.random() * otherPlayers.length);
        const randomPlayerName = otherPlayers[randomPlayerIndex];
        
        // Sostituisci il segnaposto con il nome del giocatore scelto
        actionText = actionText.replace(/{playerB}/g, randomPlayerName);
      } else {
        // Fallback se non ci sono altri giocatori
        actionText = actionText.replace(/{playerB}/g, "qualcun altro");
      }
    }
    
    // Controlla prima se la frase contiene un punto interrogativo
    if (actionText.includes("?")) {
      // Espressione regolare per catturare domande con penalità alla fine
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
    
    console.log("=== DEBUG final action set ===");
    console.log("Final actionText:", actionText?.substring(0, 100));
    
    // Incrementa il contatore delle azioni
    setActionsCounter(prev => prev + 1);
  };
  
  // Funzione dedicata per aggiornare l'azione corrente (versione originale per i turni successivi)
  const updateCurrentAction = () => updateCurrentActionWithPool(null);
  
  // Passa al turno successivo
  const nextTurn = (afterSpecialAction = false) => {
    const roomId = selectedRoom?.id;
    
    console.log("=== DEBUG nextTurn ===");
    console.log("afterSpecialAction:", afterSpecialAction);
    console.log("activeSpecialGame:", specialGames.activeSpecialGame);
    console.log("actionsCounter:", actionsCounter);
    console.log("roomId:", roomId);
    
    // Verifica se il numero massimo di azioni è stato raggiunto
    if (actionsCounter >= MAX_ACTIONS_PER_GAME - 1) {
      // Segna che l'utente ha giocato la partita gratuita
      setHasPlayedFreeGame(true);
      localStorage.setItem('hasPlayedFreeGame', 'true');
      
      // Vai direttamente al game over
      setGameState('gameOver');
      return;
    }
    
    // Incrementa l'indice per la prossima volta, ma solo se non siamo in una fase speciale
    if (!specialGames.activeSpecialGame || afterSpecialAction) {
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
    if (!specialGames.activeSpecialGame || afterSpecialAction) {
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
  
  // Funzione per continuare dopo un'azione speciale
  const nextTurnAfterSpecialGame = () => {
    specialGames.nextTurnAfterSpecialGame(nextTurn);
  };
  
  // Navigazione tra le schermate
  const goBack = () => {
    switch (gameState) {
      case 'gameSelection':
        setGameState('roomSelection');
        break;
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
    setIsFirstActionLoaded(false);
    setSelectedGames({
      truthOrDare: false,
      wouldYouRather: false,
      nonHoMai: false
    });
    
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
      
      // Vai alla schermata iniziale
      setGameState('welcome');
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

  // Export everything that will be needed by the UI component
  return {
    // Constants
    MAX_ACTIONS_PER_GAME,
    MIN_ACTIONS_BETWEEN_SPECIAL_GAMES: specialGames.MIN_ACTIONS_BETWEEN_SPECIAL_GAMES,
    
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
    hasPlayedFreeGame,
    hasPaid,
    selectedPaymentOption,
    isProcessingPayment,
    actionsCounter,
    
    // Stati per la selezione giochi (della stanza giochi)
    selectedGames,
    
    // Stati dai giochi speciali
    activeSpecialGame: specialGames.activeSpecialGame,
    specialGamePlayer: specialGames.specialGamePlayer,
    debtList: specialGames.debtList,
    truthDarePlayers: specialGames.truthDarePlayers,
    currentTruthDareChoice: specialGames.currentTruthDareChoice,
    truthDareContent: specialGames.truthDareContent,
    truthDareState: specialGames.truthDareState,
    wouldYouRatherContent: specialGames.wouldYouRatherContent,
    isTimerActive: specialGames.isTimerActive,
    timerSeconds: specialGames.timerSeconds,
    timerChallengeContent: specialGames.timerChallengeContent,
    
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
    goBack,
    resetGame,
    selectPaymentOption,
    processPayment,
    resetPaywallState,
    
    // Funzioni per la selezione giochi (della stanza giochi)
    toggleGameSelection,
    proceedWithSelectedGames,
    
    // Funzioni dai giochi speciali
    handleTruthDareChoice: specialGames.handleTruthDareChoice,
    getSpecialGameMessage: specialGames.getSpecialGameMessage,
    startTimer: specialGames.startTimer,
    
    // Additional state setters che devono essere esposti
    setCurrentRoomIndex,
    setGameState
  };
};

export default useGameLogic;