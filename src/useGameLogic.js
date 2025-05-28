// useGameLogic.js - Custom hook per gestire lo stato e la logica del gioco
import { useState, useEffect, useRef } from 'react';
import translations from './translations';

/**
 * Custom hook per gestire tutta la logica e lo stato del gioco
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
  const timerIntervalRef = useRef(null);
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
  // Stato per tenere traccia di tutti i giochi speciali (RIMOSSI: bouncer, cringeOrClassy, ilPezzoGrosso)
  const SPECIAL_GAMES = ['pointFinger', 'infamata', 'truthOrDare', 'wouldYouRather', 'chatDetective', 'newRule', 'tuttoHaUnPrezzo', 'tuttiQuelliChe', 'penitenzeGruppo', 'penitenzaRandom', 'nonHoMai', 'chiEPiuProbabile', 'happyHour', 'oneVsOne', 'timerChallenge'];
  
  // Numerazione dei giochi speciali per una manutenzione più semplice (AGGIORNATA)
  const SPECIAL_GAME_TYPES = {
    POINT_FINGER: 0,
    INFAMATA: 1, 
    TRUTH_OR_DARE: 2,
    WOULD_YOU_RATHER: 3,
    CHAT_DETECTIVE: 4,
    NEW_RULE: 5,
    TUTTO_HA_UN_PREZZO: 6,
    TUTTI_QUELLI_CHE: 7,
    PENITENZE_GRUPPO: 8,
    PENITENZA_RANDOM: 9,
    NON_HO_MAI: 10,
    CHI_E_PIU_PROBABILE: 11,
    HAPPY_HOUR: 12,
    ONE_VS_ONE: 13,
    TIMER_CHALLENGE: 14
  };

  // Nuovi stati per il timer challenge
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [timerChallengeContent, setTimerChallengeContent] = useState(null);

  // Funzione che determina quali giochi speciali sono disponibili per ogni stanza
  const getAvailableSpecialGames = (roomId) => {
    switch(roomId) {
      case 'coppie':
        // Per la modalità "coppie" truth or dare, would you rather, chatDetective e newRule
        return [
            SPECIAL_GAME_TYPES.TRUTH_OR_DARE, 
            SPECIAL_GAME_TYPES.WOULD_YOU_RATHER, 
            SPECIAL_GAME_TYPES.CHAT_DETECTIVE, 
            SPECIAL_GAME_TYPES.NEW_RULE,
            SPECIAL_GAME_TYPES.CHI_E_PIU_PROBABILE,
            SPECIAL_GAME_TYPES.HAPPY_HOUR
        ];
      case 'redRoom':
        // Per la stanza rossa tutti i giochi (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
        return [
          SPECIAL_GAME_TYPES.POINT_FINGER,
          SPECIAL_GAME_TYPES.INFAMATA,
          SPECIAL_GAME_TYPES.TRUTH_OR_DARE,
          SPECIAL_GAME_TYPES.WOULD_YOU_RATHER,
          SPECIAL_GAME_TYPES.CHAT_DETECTIVE,
          SPECIAL_GAME_TYPES.NEW_RULE,
          SPECIAL_GAME_TYPES.TUTTO_HA_UN_PREZZO,
          SPECIAL_GAME_TYPES.TUTTI_QUELLI_CHE,
          SPECIAL_GAME_TYPES.PENITENZE_GRUPPO,
          SPECIAL_GAME_TYPES.PENITENZA_RANDOM,
          SPECIAL_GAME_TYPES.NON_HO_MAI,
          SPECIAL_GAME_TYPES.CHI_E_PIU_PROBABILE,
          SPECIAL_GAME_TYPES.HAPPY_HOUR,
          SPECIAL_GAME_TYPES.TIMER_CHALLENGE
        ];
      case 'darkRoom':
        // Per la dark room (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
        return [
          SPECIAL_GAME_TYPES.INFAMATA,
          SPECIAL_GAME_TYPES.TRUTH_OR_DARE,
          SPECIAL_GAME_TYPES.WOULD_YOU_RATHER,
          SPECIAL_GAME_TYPES.CHAT_DETECTIVE,
          SPECIAL_GAME_TYPES.NEW_RULE,
          SPECIAL_GAME_TYPES.TUTTI_QUELLI_CHE,
          SPECIAL_GAME_TYPES.PENITENZE_GRUPPO,
          SPECIAL_GAME_TYPES.PENITENZA_RANDOM,
          SPECIAL_GAME_TYPES.NON_HO_MAI,
          SPECIAL_GAME_TYPES.CHI_E_PIU_PROBABILE,
          SPECIAL_GAME_TYPES.HAPPY_HOUR,
          SPECIAL_GAME_TYPES.TIMER_CHALLENGE
        ];
      case 'party':
        // Per la party room (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
        return [
          SPECIAL_GAME_TYPES.POINT_FINGER,
          SPECIAL_GAME_TYPES.INFAMATA,
          SPECIAL_GAME_TYPES.TRUTH_OR_DARE,
          SPECIAL_GAME_TYPES.WOULD_YOU_RATHER,
          SPECIAL_GAME_TYPES.NEW_RULE,
          SPECIAL_GAME_TYPES.TUTTO_HA_UN_PREZZO,
          SPECIAL_GAME_TYPES.TUTTI_QUELLI_CHE,
          SPECIAL_GAME_TYPES.PENITENZE_GRUPPO,
          SPECIAL_GAME_TYPES.PENITENZA_RANDOM,
          SPECIAL_GAME_TYPES.NON_HO_MAI,
          SPECIAL_GAME_TYPES.CHI_E_PIU_PROBABILE,
          SPECIAL_GAME_TYPES.HAPPY_HOUR,
          SPECIAL_GAME_TYPES.ONE_VS_ONE,
          SPECIAL_GAME_TYPES.TIMER_CHALLENGE
        ];
      case 'neonRoulette':
      default:
        // Per la Neon Roulette e come default, tutti i giochi rimanenti
        return [
          SPECIAL_GAME_TYPES.POINT_FINGER,
          SPECIAL_GAME_TYPES.INFAMATA,
          SPECIAL_GAME_TYPES.TRUTH_OR_DARE,
          SPECIAL_GAME_TYPES.WOULD_YOU_RATHER,
          SPECIAL_GAME_TYPES.CHAT_DETECTIVE,
          SPECIAL_GAME_TYPES.NEW_RULE,
          SPECIAL_GAME_TYPES.TUTTO_HA_UN_PREZZO,
          SPECIAL_GAME_TYPES.TUTTI_QUELLI_CHE,
          SPECIAL_GAME_TYPES.PENITENZE_GRUPPO,
          SPECIAL_GAME_TYPES.PENITENZA_RANDOM,
          SPECIAL_GAME_TYPES.NON_HO_MAI,
          SPECIAL_GAME_TYPES.CHI_E_PIU_PROBABILE,
          SPECIAL_GAME_TYPES.HAPPY_HOUR,
          SPECIAL_GAME_TYPES.ONE_VS_ONE,
          SPECIAL_GAME_TYPES.TIMER_CHALLENGE
        ];
    }
  };
  
  // Stato per tracciare quali giochi sono stati usati (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
  const [specialGamesUsed, setSpecialGamesUsed] = useState({
    redRoom: { 
      pointFinger: false, 
      infamata: false, 
      truthOrDare: false, 
      wouldYouRather: false, 
      chatDetective: false, 
      newRule: false, 
      tuttoHaUnPrezzo: false, 
      tuttiQuelliChe: false, 
      penitenzeGruppo: false, 
      penitenzaRandom: false, 
      nonHoMai: false,
      chiEPiuProbabile: false,
      happyHour: false,
      oneVsOne: false,
      timerChallenge: false
    },
    darkRoom: { 
      pointFinger: false, 
      infamata: false, 
      truthOrDare: false, 
      wouldYouRather: false, 
      chatDetective: false, 
      newRule: false, 
      tuttoHaUnPrezzo: false, 
      tuttiQuelliChe: false, 
      penitenzeGruppo: false, 
      penitenzaRandom: false, 
      nonHoMai: false,
      chiEPiuProbabile: false,
      happyHour: false,
      oneVsOne: false,
      timerChallenge: false
    },
    coppie: { 
      pointFinger: false, 
      infamata: false, 
      truthOrDare: false, 
      wouldYouRather: false, 
      chatDetective: false, 
      newRule: false, 
      tuttoHaUnPrezzo: false, 
      tuttiQuelliChe: false, 
      penitenzeGruppo: false, 
      penitenzaRandom: false, 
      nonHoMai: false,
      chiEPiuProbabile: false,
      happyHour: false,
      oneVsOne: false,
      timerChallenge: false
    },
    party: { 
      pointFinger: false, 
      infamata: false, 
      truthOrDare: false, 
      wouldYouRather: false, 
      chatDetective: false, 
      newRule: false, 
      tuttoHaUnPrezzo: false, 
      tuttiQuelliChe: false, 
      penitenzeGruppo: false, 
      penitenzaRandom: false, 
      nonHoMai: false,
      chiEPiuProbabile: false,
      happyHour: false,
      oneVsOne: false,
      timerChallenge: false
    },
    neonRoulette: { 
      pointFinger: false, 
      infamata: false, 
      truthOrDare: false, 
      wouldYouRather: false, 
      chatDetective: false, 
      newRule: false, 
      tuttoHaUnPrezzo: false, 
      tuttiQuelliChe: false, 
      penitenzeGruppo: false, 
      penitenzaRandom: false, 
      nonHoMai: false,
      chiEPiuProbabile: false,
      happyHour: false,
      oneVsOne: false,
      timerChallenge: false
    }
  });
  
  // Stato per tracciare quando deve apparire ciascun gioco (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
  const [specialGamesRound, setSpecialGamesRound] = useState({
    redRoom: { 
      pointFinger: 30, 
      infamata: 20, 
      truthOrDare: 25, 
      wouldYouRather: 10, 
      chatDetective: 45, 
      newRule: 5, 
      tuttoHaUnPrezzo: 18, 
      tuttiQuelliChe: 22, 
      penitenzeGruppo: 13, 
      penitenzaRandom: 28, 
      nonHoMai: 33,
      chiEPiuProbabile: 24,
      happyHour: 38,
      oneVsOne: 42,
      timerChallenge: 16
    },
    darkRoom: { 
      pointFinger: 30, 
      infamata: 20, 
      truthOrDare: 25, 
      wouldYouRather: 10, 
      chatDetective: 45, 
      newRule: 5, 
      tuttoHaUnPrezzo: 18, 
      tuttiQuelliChe: 22, 
      penitenzeGruppo: 13, 
      penitenzaRandom: 28, 
      nonHoMai: 33,
      chiEPiuProbabile: 24,
      happyHour: 38,
      oneVsOne: 42,
      timerChallenge: 16
    },
    coppie: { 
      pointFinger: 30, 
      infamata: 20, 
      truthOrDare: 25, 
      wouldYouRather: 10, 
      chatDetective: 45, 
      newRule: 5, 
      tuttoHaUnPrezzo: 18, 
      tuttiQuelliChe: 22, 
      penitenzeGruppo: 13, 
      penitenzaRandom: 28, 
      nonHoMai: 33,
      chiEPiuProbabile: 24,
      happyHour: 38,
      oneVsOne: 42,
      timerChallenge: 16
    },
    party: { 
      pointFinger: 30, 
      infamata: 20, 
      truthOrDare: 25, 
      wouldYouRather: 10, 
      chatDetective: 45, 
      newRule: 5, 
      tuttoHaUnPrezzo: 18, 
      tuttiQuelliChe: 22, 
      penitenzeGruppo: 13, 
      penitenzaRandom: 28, 
      nonHoMai: 33,
      chiEPiuProbabile: 24,
      happyHour: 38,
      oneVsOne: 42,
      timerChallenge: 16
    },
    neonRoulette: { 
      pointFinger: 30, 
      infamata: 20, 
      truthOrDare: 25, 
      wouldYouRather: 10, 
      chatDetective: 45, 
      newRule: 5, 
      tuttoHaUnPrezzo: 18, 
      tuttiQuelliChe: 22, 
      penitenzeGruppo: 13, 
      penitenzaRandom: 28, 
      nonHoMai: 33,
      chiEPiuProbabile: 24,
      happyHour: 38,
      oneVsOne: 42,
      timerChallenge: 16
    }
  });
  
  // Stato per il gioco speciale attualmente in corso
  const [activeSpecialGame, setActiveSpecialGame] = useState(null);
  // Giocatore coinvolto nel gioco speciale (se presente)
  const [specialGamePlayer, setSpecialGamePlayer] = useState(null);
  
  // NUOVO: Contatore per tracciare l'ultima azione speciale
  const [lastSpecialGameRound, setLastSpecialGameRound] = useState({
    redRoom: 0,
    darkRoom: 0,
    coppie: 0,
    party: 0,
    neonRoulette: 0
  });
  
  // NUOVO: Lista dei debiti assegnati
  const [debtList, setDebtList] = useState([]);
  
  // NUOVO: Costante per l'intervallo minimo tra giochi speciali
  const MIN_ACTIONS_BETWEEN_SPECIAL_GAMES = 2;
  
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

  // Nuovo stato per il gioco "Preferiresti"
  const [wouldYouRatherContent, setWouldYouRatherContent] = useState(null);
  
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
      // Usa una flag per assicurarti che questo venga eseguito solo una volta
      const firstLoadFlag = 'firstActionLoaded_' + selectedRoom.id;
      if (!sessionStorage.getItem(firstLoadFlag)) {
        setTimeout(() => {
          updateCurrentAction();
          sessionStorage.setItem(firstLoadFlag, 'true');
        }, 100);
      }
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
      setWouldYouRatherContent(null);
      
      // Resetta lo stato del timer
      setIsTimerActive(false);
      setTimerSeconds(20);
      setTimerChallengeContent(null);
      
      // NUOVO: Resetta il contatore dell'ultima azione speciale
      setLastSpecialGameRound(prev => ({
        ...prev,
        [room.id]: 0
      }));
      
      // Distribuisci i giochi speciali in modo uniforme ma casuale
      const gamePositions = distributeSpecialGames(MAX_ACTIONS_PER_GAME, room.id);
      
      // Resetta tutti gli stati dei giochi speciali (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
      setSpecialGamesUsed(prev => ({
        ...prev,
        [room.id]: {
          pointFinger: false,
          infamata: false,
          truthOrDare: false,
          wouldYouRather: false,
          chatDetective: false,
          newRule: false,
          tuttoHaUnPrezzo: false,
          tuttiQuelliChe: false,
          penitenzeGruppo: false,
          penitenzaRandom: false,
          nonHoMai: false,
          chiEPiuProbabile: false,
          happyHour: false,
          oneVsOne: false,
          timerChallenge: false
        }
      }));
      
      // Imposta i round per ogni gioco speciale (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
      setSpecialGamesRound(prev => ({
        ...prev,
        [room.id]: {
          pointFinger: gamePositions.pointFinger || 30,
          infamata: gamePositions.infamata || 20,
          truthOrDare: gamePositions.truthOrDare || 25,
          wouldYouRather: gamePositions.wouldYouRather || 10,
          chatDetective: gamePositions.chatDetective || 45,
          newRule: gamePositions.newRule || 5,
          tuttoHaUnPrezzo: gamePositions.tuttoHaUnPrezzo || 18,
          tuttiQuelliChe: gamePositions.tuttiQuelliChe || 22,
          penitenzeGruppo: gamePositions.penitenzeGruppo || 13,
          penitenzaRandom: gamePositions.penitenzaRandom || 28,
          nonHoMai: gamePositions.nonHoMai || 33,
          chiEPiuProbabile: gamePositions.chiEPiuProbabile || 24,
          happyHour: gamePositions.happyHour || 38,
          oneVsOne: gamePositions.oneVsOne || 42,
          timerChallenge: gamePositions.timerChallenge || 16
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
        
        // MIGLIORAMENTO: Raccogliamo anche le azioni dai giochi speciali
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
  const distributeSpecialGames = (maxActions, roomId) => {
    // Distanza minima voluta tra i giochi
    const MIN_SPACING = 3; // Come richiesto
    
    // Otteniamo i giochi disponibili per questa stanza
    const availableGameTypes = getAvailableSpecialGames(roomId);
    
    // Convertiamo i tipi numerici nei nomi dei giochi
    const availableGames = availableGameTypes.map(gameType => SPECIAL_GAMES[gameType]);
    
    // Assicuriamoci che nella modalità Neon Roulette vengano inclusi tutti i giochi speciali
    let shuffledGames = [];
    if (roomId === 'neonRoulette') {
      // Per Neon Roulette, includiamo TUTTI i giochi speciali
      shuffledGames = [...SPECIAL_GAMES].sort(() => Math.random() - 0.5);
    } else {
      // Per le altre stanze, utilizziamo solo i giochi disponibili
      shuffledGames = [...availableGames].sort(() => Math.random() - 0.5);
    }
    
    // Range disponibile per la distribuzione dei giochi
    const minPosition = 5; // Iniziamo dopo le prime azioni
    const maxPosition = maxActions - 5; // Finiamo prima della fine
    const availableRange = maxPosition - minPosition;
    
    // Verifica se abbiamo abbastanza spazio per tutti i giochi con la distanza minima
    const minRequiredSpace = shuffledGames.length * (1 + MIN_SPACING) - MIN_SPACING;
    if (minRequiredSpace > availableRange) {
      console.warn(`Attenzione: non c'è abbastanza spazio per distribuire tutti i giochi con la distanza minima richiesta.`);
    }
    
    // Calcola la dimensione ottimale dei segmenti (garantendo la distanza minima se possibile)
    const segmentSize = Math.max(MIN_SPACING + 1, Math.floor(availableRange / shuffledGames.length));
    
    // Crea le posizioni con un po' di randomicità ma mantieni la distanza minima
    const positions = {};
    
    shuffledGames.forEach((game, index) => {
      // Base position nel suo segmento
      const segmentStart = minPosition + (index * segmentSize);
      // Il segmento finisce prima dell'inizio del prossimo segmento
      const segmentEnd = Math.min(maxPosition, segmentStart + segmentSize - 1);
      
      // Se è il primo gioco, non c'è un gioco precedente
      if (index === 0) {
        // Posiziona il primo gioco in una posizione casuale all'interno del suo segmento
        positions[game] = segmentStart + Math.floor(Math.random() * (segmentEnd - segmentStart + 1));
      } else {
        // Per i giochi successivi, verifica la distanza dal gioco precedente
        const prevGame = shuffledGames[index - 1];
        const prevPosition = positions[prevGame];
        
        // La posizione minima valida è prevPosition + MIN_SPACING
        const minValidPosition = prevPosition + MIN_SPACING;
        
        // Se la posizione minima valida è oltre la fine del segmento, usa quella
        if (minValidPosition > segmentEnd) {
          positions[game] = minValidPosition;
        } else {
          // Altrimenti, scegli una posizione casuale nel range valido
          positions[game] = minValidPosition + Math.floor(Math.random() * (segmentEnd - minValidPosition + 1));
        }
      }
    });
    
    // Per i giochi non disponibili in questa stanza, impostiamo una posizione
    // molto alta in modo che non vengano mai attivati
    SPECIAL_GAMES.forEach(game => {
      if (!positions[game]) {
        positions[game] = maxActions * 2; // Posizione irraggiungibile
      }
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
    
    // Ferma il timer se è attivo
    if (isTimerActive) {
      setIsTimerActive(false);
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
    setWouldYouRatherContent(null);
    setTimerChallengeContent(null);
    
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
  
  // Funzioni per gestire il timer
  const startTimer = () => {
    console.log("startTimer è stata chiamata!");
    
    // Resetta e avvia il timer
    setTimerSeconds(20);
    setIsTimerActive(true);
    
    // Cancella eventuali intervalli precedenti
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Crea un nuovo riferimento per l'intervallo
    const intervalId = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Salva il riferimento
    timerIntervalRef.current = intervalId;
  };
  
  // Assicurati di pulire l'intervallo quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);
  
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
    
    // Gestisci i vari tipi di gioco (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
    switch (gameType) {
      case "pointFinger":
      case "infamata":
      case "chatDetective":
      case "nonHoMai":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
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
        
        // Carica il pool di contenuti per verità e obblighi specifici per la stanza
        let truthPool = [];
        let darePool = [];

        if (backupActions.truthDareGame) {
          // Prima cerca contenuti specifici per la stanza
          if (backupActions.truthDareGame.truth && backupActions.truthDareGame.truth[roomId]) {
            truthPool = [...backupActions.truthDareGame.truth[roomId]];
          } 
          // Fallback sul pool generico
          else if (backupActions.truthDareGame.truth) {
            truthPool = [...backupActions.truthDareGame.truth];
          }
          
          if (backupActions.truthDareGame.dare && backupActions.truthDareGame.dare[roomId]) {
            darePool = [...backupActions.truthDareGame.dare[roomId]];
          } 
          // Fallback sul pool generico
          else if (backupActions.truthDareGame.dare) {
            darePool = [...backupActions.truthDareGame.dare];
          }
          
          // Per Neon Roulette, mescola contenuti da tutte le stanze
          if (roomId === 'neonRoulette') {
            truthPool = [];
            darePool = [];
            
            if (backupActions.truthDareGame.truth) {
              if (backupActions.truthDareGame.truth.party) truthPool.push(...backupActions.truthDareGame.truth.party);
              if (backupActions.truthDareGame.truth.redRoom) truthPool.push(...backupActions.truthDareGame.truth.redRoom);
              if (backupActions.truthDareGame.truth.darkRoom) truthPool.push(...backupActions.truthDareGame.truth.darkRoom);
              if (backupActions.truthDareGame.truth.coppie) truthPool.push(...backupActions.truthDareGame.truth.coppie);
            }
            
            if (backupActions.truthDareGame.dare) {
              if (backupActions.truthDareGame.dare.party) darePool.push(...backupActions.truthDareGame.dare.party);
              if (backupActions.truthDareGame.dare.redRoom) darePool.push(...backupActions.truthDareGame.dare.redRoom);
              if (backupActions.truthDareGame.dare.darkRoom) darePool.push(...backupActions.truthDareGame.dare.darkRoom);
              if (backupActions.truthDareGame.dare.coppie) darePool.push(...backupActions.truthDareGame.dare.coppie);
            }
            
            // Se non ci sono pool specifici, usa quelli generici
            if (truthPool.length === 0 && backupActions.truthDareGame.truth) {
              truthPool = [...backupActions.truthDareGame.truth];
            }
            if (darePool.length === 0 && backupActions.truthDareGame.dare) {
              darePool = [...backupActions.truthDareGame.dare];
            }
          }
          
          // Mescola i pool
          setTruthDareContentPool({
            truth: truthPool.sort(() => Math.random() - 0.5),
            dare: darePool.sort(() => Math.random() - 0.5)
          });
        }
        
        // Il giocatore corrente sarà il primo a giocare
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = t.truthDareIntro.replace('{player}', players[currentPlayerIndex]);
        break;
        
      case "wouldYouRather":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Seleziona una domanda tematizzata in base alla stanza corrente
        let wouldYouRatherQuestions = [];
        
        // Cerca prima le domande specifiche per la stanza
        if (backupActions.wouldYouRather && backupActions.wouldYouRather[roomId] && 
            backupActions.wouldYouRather[roomId].length > 0) {
          wouldYouRatherQuestions = backupActions.wouldYouRather[roomId];
        } 
        // Se non ci sono domande specifiche per la stanza o siamo in Neon Roulette, usa il pool generico
        else if (roomId === 'neonRoulette') {
          // Per Neon Roulette, raccogliamo domande da tutte le stanze
          const allQuestions = [];
          if (backupActions.wouldYouRather) {
            if (backupActions.wouldYouRather.party) allQuestions.push(...backupActions.wouldYouRather.party);
            if (backupActions.wouldYouRather.redRoom) allQuestions.push(...backupActions.wouldYouRather.redRoom);
            if (backupActions.wouldYouRather.darkRoom) allQuestions.push(...backupActions.wouldYouRather.darkRoom);
            if (backupActions.wouldYouRather.coppie) allQuestions.push(...backupActions.wouldYouRather.coppie);
          }
          wouldYouRatherQuestions = allQuestions.length > 0 ? allQuestions : (backupActions.wouldYouRather || []);
        }
        // Fallback al pool generico se non ci sono domande specifiche
        else if (backupActions.wouldYouRather && backupActions.wouldYouRather.length > 0) {
          wouldYouRatherQuestions = backupActions.wouldYouRather;
        }
        
        // Se abbiamo domande, seleziona una casualmente
        if (wouldYouRatherQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * wouldYouRatherQuestions.length);
          const question = wouldYouRatherQuestions[randomIndex].text;
          
          // Imposta la domanda per uso futuro
          setWouldYouRatherContent(question);
          
          // Aggiungi la domanda al testo dell'azione CON UN A CAPO
          actionText += "\n\n" + question;
        }
        break;
        
      case "newRule":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Seleziona una regola casuale, se disponibile nel backup
        if (backupActions.specialGames[gameType].rules && backupActions.specialGames[gameType].rules.length > 0) {
          const rules = backupActions.specialGames[gameType].rules;
          const randomRuleIndex = Math.floor(Math.random() * rules.length);
          const selectedRule = rules[randomRuleIndex];
          
          // Sostituisci [regola] con la regola selezionata
          actionText = actionText.replace(/\[regola\]/g, selectedRule);
        } else {
          // Fallback se non ci sono regole disponibili
          actionText = actionText.replace(/\[regola\]/g, "fare qualcosa di specifico");
        }
        break;
        
      case "tuttoHaUnPrezzo":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Selezioniamo una sfida appropriata in base alla stanza
        if (backupActions.specialGames && backupActions.specialGames.tuttoHaUnPrezzo) {
          let challenges = [];
          
          if (roomId === 'redRoom' && backupActions.specialGames.tuttoHaUnPrezzo.redRoom) {
            challenges = backupActions.specialGames.tuttoHaUnPrezzo.redRoom;
          } else if (roomId === 'party' && backupActions.specialGames.tuttoHaUnPrezzo.party) {
            challenges = backupActions.specialGames.tuttoHaUnPrezzo.party;
          } else if (roomId === 'neonRoulette') {
            // Per Neon Roulette, usa una combinazione di sfide da tutte le stanze disponibili
            const allChallenges = [];
            if (backupActions.specialGames.tuttoHaUnPrezzo.redRoom) 
              allChallenges.push(...backupActions.specialGames.tuttoHaUnPrezzo.redRoom);
            if (backupActions.specialGames.tuttoHaUnPrezzo.party) 
              allChallenges.push(...backupActions.specialGames.tuttoHaUnPrezzo.party);
            
            challenges = allChallenges;
          }
          
          if (challenges && challenges.length > 0) {
            // Seleziona una sfida casuale
            const randomIndex = Math.floor(Math.random() * challenges.length);
            const challenge = challenges[randomIndex];
            
            // Aggiungi la sfida al testo dell'azione
            actionText += "\n\n" + challenge;
          }
        }
        break;

      case "tuttiQuelliChe":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Selezioniamo una sfida appropriata in base alla stanza
        if (backupActions.specialGames && backupActions.specialGames.tuttiQuelliChe) {
          let challenges = [];
          
          if (roomId === 'redRoom' && backupActions.specialGames.tuttiQuelliChe.redRoom) {
            challenges = backupActions.specialGames.tuttiQuelliChe.redRoom;
          } else if (roomId === 'darkRoom' && backupActions.specialGames.tuttiQuelliChe.darkRoom) {
            challenges = backupActions.specialGames.tuttiQuelliChe.darkRoom;
          } else if (roomId === 'party' && backupActions.specialGames.tuttiQuelliChe.party) {
            challenges = backupActions.specialGames.tuttiQuelliChe.party;
          } else if (roomId === 'neonRoulette') {
            // Per Neon Roulette, usa una combinazione di sfide da tutte le stanze disponibili
            const allChallenges = [];
            if (backupActions.specialGames.tuttiQuelliChe.redRoom) 
              allChallenges.push(...backupActions.specialGames.tuttiQuelliChe.redRoom);
            if (backupActions.specialGames.tuttiQuelliChe.darkRoom) 
              allChallenges.push(...backupActions.specialGames.tuttiQuelliChe.darkRoom);
            if (backupActions.specialGames.tuttiQuelliChe.party)
              allChallenges.push(...backupActions.specialGames.tuttiQuelliChe.party);
            
            challenges = allChallenges;
          }
          
          if (challenges && challenges.length > 0) {
            // Seleziona una sfida casuale
            const randomIndex = Math.floor(Math.random() * challenges.length);
            const challenge = challenges[randomIndex];
            
            // Aggiungi la sfida al testo dell'azione
            actionText += "\n\n" + challenge;
          }
        }
        break;

      case "penitenzeGruppo":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Selezioniamo una sfida appropriata in base alla stanza
        if (backupActions.specialGames && backupActions.specialGames.penitenzeGruppo) {
          let challenges = [];
          
          if (roomId === 'redRoom' && backupActions.specialGames.penitenzeGruppo.redRoom) {
            challenges = backupActions.specialGames.penitenzeGruppo.redRoom;
          } else if (roomId === 'darkRoom' && backupActions.specialGames.penitenzeGruppo.darkRoom) {
            challenges = backupActions.specialGames.penitenzeGruppo.darkRoom;
          } else if (roomId === 'party' && backupActions.specialGames.penitenzeGruppo.party) {
            challenges = backupActions.specialGames.penitenzeGruppo.party;
          } else if (roomId === 'neonRoulette') {
            // Per Neon Roulette, usa una combinazione di sfide da tutte le stanze disponibili
            const allChallenges = [];
            if (backupActions.specialGames.penitenzeGruppo.redRoom) 
              allChallenges.push(...backupActions.specialGames.penitenzeGruppo.redRoom);
            if (backupActions.specialGames.penitenzeGruppo.darkRoom) 
              allChallenges.push(...backupActions.specialGames.penitenzeGruppo.darkRoom);
            if (backupActions.specialGames.penitenzeGruppo.party)
              allChallenges.push(...backupActions.specialGames.penitenzeGruppo.party);
            
            challenges = allChallenges;
          }
          
          if (challenges && challenges.length > 0) {
            // Seleziona una sfida casuale
            const randomIndex = Math.floor(Math.random() * challenges.length);
            const challenge = challenges[randomIndex];
            
            // Aggiungi la sfida al testo dell'azione
            actionText += "\n\n" + challenge;
          }
        }
        break;
        
      case "penitenzaRandom":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Selezioniamo una sfida appropriata in base alla stanza
        if (backupActions.specialGames && backupActions.specialGames.penitenzaRandom) {
          let challenges = [];
          
          if (roomId === 'redRoom' && backupActions.specialGames.penitenzaRandom.redRoom) {
            challenges = backupActions.specialGames.penitenzaRandom.redRoom;
          } else if (roomId === 'darkRoom' && backupActions.specialGames.penitenzaRandom.darkRoom) {
            challenges = backupActions.specialGames.penitenzaRandom.darkRoom;
          } else if (roomId === 'party' && backupActions.specialGames.penitenzaRandom.party) {
            challenges = backupActions.specialGames.penitenzaRandom.party;
          } else if (roomId === 'neonRoulette') {
            // Per Neon Roulette, usa una combinazione di sfide da tutte le stanze disponibili
            const allChallenges = [];
            if (backupActions.specialGames.penitenzaRandom.redRoom) 
              allChallenges.push(...backupActions.specialGames.penitenzaRandom.redRoom);
            if (backupActions.specialGames.penitenzaRandom.darkRoom) 
              allChallenges.push(...backupActions.specialGames.penitenzaRandom.darkRoom);
            if (backupActions.specialGames.penitenzaRandom.party)
              allChallenges.push(...backupActions.specialGames.penitenzaRandom.party);
            
            challenges = allChallenges;
          }
          
          if (challenges && challenges.length > 0) {
            // Seleziona una sfida casuale
            const randomIndex = Math.floor(Math.random() * challenges.length);
            const challenge = challenges[randomIndex];
            
            // Aggiungi la sfida al testo dell'azione
            actionText += "\n\n" + challenge;
          }
        }
        break;
        
      case "chiEPiuProbabile":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Seleziona una domanda tematizzata in base alla stanza corrente
        let chiEPiuProbabileQuestions = [];

        // Cerca prima le domande specifiche per la stanza
        if (backupActions.specialGames && backupActions.specialGames.chiEPiuProbabile) {
          if (backupActions.specialGames.chiEPiuProbabile[roomId] && 
              backupActions.specialGames.chiEPiuProbabile[roomId].length > 0) {
            chiEPiuProbabileQuestions = backupActions.specialGames.chiEPiuProbabile[roomId];
          } 
          // Per Neon Roulette, raccogliamo domande da tutte le stanze
          else if (roomId === 'neonRoulette') {
            const allQuestions = [];
            if (backupActions.specialGames.chiEPiuProbabile.party) 
              allQuestions.push(...backupActions.specialGames.chiEPiuProbabile.party);
            if (backupActions.specialGames.chiEPiuProbabile.redRoom) 
              allQuestions.push(...backupActions.specialGames.chiEPiuProbabile.redRoom);
            if (backupActions.specialGames.chiEPiuProbabile.darkRoom) 
              allQuestions.push(...backupActions.specialGames.chiEPiuProbabile.darkRoom);
            if (backupActions.specialGames.chiEPiuProbabile.coppie) 
              allQuestions.push(...backupActions.specialGames.chiEPiuProbabile.coppie);
            
            chiEPiuProbabileQuestions = allQuestions;
          }
          // Fallback alle actions generiche se non ci sono domande specifiche
          else if (backupActions.specialGames.chiEPiuProbabile.actions && 
                   backupActions.specialGames.chiEPiuProbabile.actions.length > 0) {
            chiEPiuProbabileQuestions = backupActions.specialGames.chiEPiuProbabile.actions;
          }
        }

        // Se abbiamo domande, seleziona una casualmente
        if (chiEPiuProbabileQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * chiEPiuProbabileQuestions.length);
          const question = chiEPiuProbabileQuestions[randomIndex];
          
          // Aggiungi la domanda all'azione con un a capo
          actionText += "\n\n" + question;
        }
        break;

      case "happyHour":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Genera un numero casuale di penalità tra 1 e 3
        const penaltyCount = Math.floor(Math.random() * 3) + 1;
        
        // Sostituisci {count} con il numero di penalità
        actionText = actionText.replace(/{count}/g, penaltyCount);
        
        // Applica le penalità a tutti i giocatori
        const updatedPenalties = {...playerPenalties};
        players.forEach(player => {
          updatedPenalties[player] = (updatedPenalties[player] || 0) + penaltyCount;
        });
        setPlayerPenalties(updatedPenalties);
        break;
        
      case "oneVsOne":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Seleziona un altro giocatore casuale per la sfida
        let opponentIndex;
        do {
          opponentIndex = Math.floor(Math.random() * players.length);
        } while (opponentIndex === currentPlayerIndex);
        
        // Sostituisci {opponent} con il nome dell'avversario
        actionText = actionText.replace(/{opponent}/g, players[opponentIndex]);
        break;
        
      case "timerChallenge":
        // Il giocatore corrente sarà il protagonista
        setSpecialGamePlayer(players[currentPlayerIndex]);
        
        // Sostituisci {player} con il nome del giocatore corrente
        actionText = actionText.replace(/{player}/g, players[currentPlayerIndex]);
        
        // Seleziona una sfida appropriata in base alla stanza
        if (backupActions.specialGames && backupActions.specialGames.timerChallenge) {
          let challenges = [];
          
          if (roomId === 'redRoom' && backupActions.specialGames.timerChallenge.redRoom) {
            challenges = backupActions.specialGames.timerChallenge.redRoom;
          } else if (roomId === 'darkRoom' && backupActions.specialGames.timerChallenge.darkRoom) {
            challenges = backupActions.specialGames.timerChallenge.darkRoom;
          } else if (roomId === 'party' && backupActions.specialGames.timerChallenge.party) {
            challenges = backupActions.specialGames.timerChallenge.party;
          } else if (roomId === 'neonRoulette') {
            // Per Neon Roulette, usa una combinazione di sfide da tutte le stanze disponibili
            const allChallenges = [];
            if (backupActions.specialGames.timerChallenge.redRoom) 
              allChallenges.push(...backupActions.specialGames.timerChallenge.redRoom);
            if (backupActions.specialGames.timerChallenge.darkRoom) 
              allChallenges.push(...backupActions.specialGames.timerChallenge.darkRoom);
            if (backupActions.specialGames.timerChallenge.party)
              allChallenges.push(...backupActions.specialGames.timerChallenge.party);
            
            challenges = allChallenges;
          }
          
          if (challenges && challenges.length > 0) {
            // Seleziona una sfida casuale
            const randomIndex = Math.floor(Math.random() * challenges.length);
            const challenge = challenges[randomIndex];
            
            // Salva il contenuto della sfida
            setTimerChallengeContent(challenge);
            
            // Aggiungi la sfida al testo dell'azione
            actionText += "\n\n" + challenge;
          }
        }
        
        // Reset del timer
        setTimerSeconds(20);
        setIsTimerActive(false);
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
      // Otteniamo i giochi disponibili per questa stanza
      const availableGameTypes = getAvailableSpecialGames(roomId);
      
      // Convertiamo i tipi numerici nei nomi dei giochi
      const availableGames = availableGameTypes.map(gameType => SPECIAL_GAMES[gameType]);
      
      // Per Neon Roulette, assicuriamoci che tutti i giochi siano considerati
      const gamesToCheck = roomId === 'neonRoulette' ? SPECIAL_GAMES : availableGames;
      
      // Trova il gioco non ancora usato con la posizione più vicina alla posizione attuale
      let nextGameToShow = null;
      let nextGamePosition = Infinity;
      
      for (const gameType of gamesToCheck) {
        const gamePosition = specialGamesRound[roomId][gameType];
        
        // Verifica se il gioco non è ancora stato usato e se è il momento giusto
        if (!specialGamesUsed[roomId][gameType] && actionsCounter >= gamePosition && gamePosition < nextGamePosition) {
          nextGameToShow = gameType;
          nextGamePosition = gamePosition;
        }
      }
      
      // Se abbiamo trovato un gioco da mostrare, mostralo
      if (nextGameToShow) {
        handleSpecialGame(nextGameToShow);
        return;
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
    setWouldYouRatherContent(null);
    
    // Resetta tutti gli stati di giochi usati e round (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
    const resetUsedGames = {};
    const resetGameRounds = {};
    
    // Resetta per ogni stanza e ogni tipo di gioco
    t.rooms.forEach(room => {
      resetUsedGames[room.id] = SPECIAL_GAMES.reduce((acc, game) => {
        acc[game] = false;
        return acc;
      }, {});
      
      resetGameRounds[room.id] = SPECIAL_GAMES.reduce((acc, game, index) => {
        // Valori di default se non abbiamo posizioni specifiche (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
        const defaultPositions = {
          pointFinger: 30,
          infamata: 20,
          truthOrDare: 25,
          wouldYouRather: 10,
          chatDetective: 45,
          newRule: 5,
          tuttoHaUnPrezzo: 18,
          tuttiQuelliChe: 22,
          penitenzeGruppo: 13,
          penitenzaRandom: 28,
          nonHoMai: 33,
          chiEPiuProbabile: 24,
          happyHour: 38,
          oneVsOne: 42,
          timerChallenge: 16
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
      coppie: 0,
      party: 0,
      neonRoulette: 0
    });
    
    // Resetta gli stati del gioco Obbligo Verità Debito
    setTruthDarePlayers([]);
    setCurrentTruthDareChoice(null);
    setTruthDareContent(null);
    setTruthDareState(null);
    
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
    
    // Messaggi per ciascun tipo di gioco (RIMOSSI bouncer, cringeOrClassy, ilPezzoGrosso)
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
    playerPenalties, // NUOVO: Espone il contatore delle penalità
    wouldYouRatherContent, // NUOVO: Contenuto del gioco "preferiresti"
    isTimerActive,
    timerSeconds,
    timerChallengeContent,
    
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
    startTimer,
    
    // Additional state setters that need to be exposed
    setCurrentRoomIndex,
    setGameState
  };
};

export default useGameLogic;