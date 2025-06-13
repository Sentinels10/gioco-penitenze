// useSpecialGames.js - Custom hook per gestire i giochi speciali (con supporto modalità giochi)
import { useState, useEffect } from 'react';

/**
 * Custom hook per gestire i giochi speciali
 * @param {Object} props - Props passate dal componente principale
 */
const useSpecialGames = (props) => {
  const {
    t,
    players,
    selectedRoom,
    currentPlayerIndex,
    actionsCounter,
    setCurrentAction,
    loadBackupActions,
    MAX_ACTIONS_PER_GAME,
    gameMode,
    selectedGames
  } = props;

  // Intervallo minimo di azioni tra un gioco speciale e l'altro
  const MIN_ACTIONS_BETWEEN_SPECIAL_GAMES = 3; // Ridotto per modalità giochi

  // Stati per i giochi speciali
  const [activeSpecialGame, setActiveSpecialGame] = useState(null);
  const [specialGamePlayer, setSpecialGamePlayer] = useState(null);
  const [specialGamePositions, setSpecialGamePositions] = useState([]);
  const [specialGamesShown, setSpecialGamesShown] = useState(0);
  
  // Stati per gioco 'Truth or Dare'
  const [truthDarePlayers, setTruthDarePlayers] = useState([]);
  const [currentTruthDareIndex, setCurrentTruthDareIndex] = useState(0);
  const [currentTruthDareChoice, setCurrentTruthDareChoice] = useState(null);
  const [truthDareContent, setTruthDareContent] = useState(null);
  const [truthDareState, setTruthDareState] = useState("choosing"); // "choosing" o "executing"
  
  // Stati per evitare domande duplicate
  const [usedTruthQuestions, setUsedTruthQuestions] = useState([]);
  const [usedDareQuestions, setUsedDareQuestions] = useState([]);
  
  // Stati per il gioco "preferiresti"
  const [wouldYouRatherContent, setWouldYouRatherContent] = useState(null);
  
  // Stati per il gioco "Questo o Quello"
  const [questoOQuelloContent, setQuestoOQuelloContent] = useState(null);
  
  // Stati per timer challenge
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [timerChallengeContent, setTimerChallengeContent] = useState(null);
  
  // Debiti per Truth or Dare
  const [debtList, setDebtList] = useState([]);
  
  // Inizializza i giochi speciali all'inizio di una nuova partita
  const initializeSpecialGames = async (roomId) => {
    console.log("=== DEBUG initializeSpecialGames ===");
    console.log("roomId:", roomId);
    console.log("gameMode:", gameMode);
    console.log("selectedGames:", selectedGames);
    
    setActiveSpecialGame(null);
    setSpecialGamePlayer(null);
    setTruthDarePlayers([]);
    setCurrentTruthDareIndex(0);
    setCurrentTruthDareChoice(null);
    setTruthDareContent(null);
    setTruthDareState("choosing");
    setDebtList([]);
    setWouldYouRatherContent(null);
    setQuestoOQuelloContent(null);
    setIsTimerActive(false);
    setTimerSeconds(20);
    setTimerChallengeContent(null);
    setSpecialGamesShown(0);
    
    // Reset delle domande utilizzate
    setUsedTruthQuestions([]);
    setUsedDareQuestions([]);
    
    // Determina le posizioni in cui dovrebbero apparire i giochi speciali
    const positions = [];
    
    // Se siamo in modalità giochi, usa solo i giochi selezionati
    if (gameMode === 'games') {
      const validSpecialGames = getValidSpecialGamesForGameMode();
      
      if (validSpecialGames.length === 0) {
        console.log("No games selected for games mode");
        setSpecialGamePositions([]);
        return;
      }
      
      // In modalità giochi, mostriamo i giochi speciali più frequentemente
      const numSpecialGames = Math.min(20, validSpecialGames.length * 7); // Più giochi speciali
      
      // Distribuiamo i giochi speciali in modo più frequente
      const startPosition = 1; // Iniziamo quasi subito
      const endPosition = MAX_ACTIONS_PER_GAME - 2;
      const availableRange = endPosition - startPosition;
      
      // Intervallo più piccolo tra i giochi speciali
      const interval = Math.max(2, Math.floor(availableRange / numSpecialGames));
      
      for (let i = 0; i < numSpecialGames; i++) {
        const basePosition = startPosition + (i * interval);
        const randomOffset = Math.floor(Math.random() * 2); // Meno randomicità
        
        // Cicla attraverso i giochi selezionati
        const gameType = validSpecialGames[i % validSpecialGames.length];
        
        positions.push({
          position: basePosition + randomOffset,
          gameType: gameType
        });
      }
    } else {
      // Logica originale per modalità stanze
      const validSpecialGames = getValidSpecialGames(roomId);
      const numSpecialGames = Math.min(10, validSpecialGames.length);
      
      const startPosition = 5;
      const endPosition = MAX_ACTIONS_PER_GAME - 5;
      const availableRange = endPosition - startPosition;
      const interval = Math.floor(availableRange / numSpecialGames);
      const minSpacing = MIN_ACTIONS_BETWEEN_SPECIAL_GAMES;
      
      for (let i = 0; i < numSpecialGames; i++) {
        const basePosition = startPosition + (i * interval);
        const maxOffset = Math.max(0, Math.min(interval - minSpacing, 3));
        const randomOffset = Math.floor(Math.random() * maxOffset);
        
        positions.push({
          position: basePosition + randomOffset,
          gameType: validSpecialGames[i % validSpecialGames.length]
        });
      }
    }
    
    console.log("Generated special game positions:", positions);
    setSpecialGamePositions(positions);
  };
  
  // Ottiene i giochi speciali validi per la modalità giochi
  const getValidSpecialGamesForGameMode = () => {
    if (!selectedGames) return [];
    
    const validGames = [];
    
    if (selectedGames.truthOrDare) {
      validGames.push("truthOrDare");
    }
    
    if (selectedGames.wouldYouRather) {
      validGames.push("wouldYouRather");
    }
    
    if (selectedGames.nonHoMai) {
      validGames.push("nonHoMai");
    }
    
    console.log("Valid games for game mode:", validGames);
    return validGames;
  };
  
  // Ottiene i giochi speciali validi per la stanza corrente (logica originale)
  const getValidSpecialGames = (roomId) => {
    // Default giochi per tutte le stanze
    const commonGames = [
      "truthOrDare",
      "wouldYouRather",
      "questoOQuello",
      "timerChallenge"
    ];
    
    // Giochi specifici per ogni stanza
    const roomSpecificGames = {
      redRoom: [
        "infamata",
        "tuttoHaUnPrezzo",
        "tuttiQuelliChe",
        "penitenzaRandom"
      ],
      darkRoom: [
        "pointFinger",
        "nonHoMai",
        "chiEPiuProbabile"
      ],
      party: [
        "chatDetective",
        "penitenzeGruppo",
        "happyHour",
        "newRule"
      ],
      coppie: [
        "oneVsOne"
      ],
      neonRoulette: [
        "infamata",
        "pointFinger",
        "chatDetective",
        "tuttoHaUnPrezzo",
        "tuttiQuelliChe",
        "penitenzeGruppo",
        "nonHoMai",
        "chiEPiuProbabile",
        "happyHour",
        "oneVsOne",
        "penitenzaRandom",
        "newRule"
      ]
    };
    
    // Combina i giochi comuni con quelli specifici della stanza
    const validGames = [
      ...commonGames,
      ...(roomSpecificGames[roomId] || [])
    ];
    
    // Mescola l'array per avere un ordine casuale
    return validGames.sort(() => Math.random() - 0.5);
  };
  
  // Verifica se è il momento di mostrare un gioco speciale
  const shouldShowSpecialGame = (counter, roomId) => {
    console.log("=== DEBUG shouldShowSpecialGame ===");
    console.log("counter:", counter);
    console.log("roomId:", roomId);
    console.log("gameMode:", gameMode);
    console.log("activeSpecialGame:", activeSpecialGame);
    console.log("specialGamePositions:", specialGamePositions);
    
    if (!roomId || activeSpecialGame) {
      console.log("Returning false - no roomId or activeSpecialGame already set");
      return false;
    }
    
    // Cerca se c'è un gioco speciale programmato per questo contatore
    const matchingPosition = specialGamePositions.find(
      pos => pos.position === counter
    );
    
    console.log("matchingPosition:", matchingPosition);
    
    return !!matchingPosition;
  };
  
  // Trova il prossimo gioco speciale da mostrare
  const findNextSpecialGame = (counter, roomId) => {
    console.log("=== DEBUG findNextSpecialGame ===");
    console.log("counter:", counter);
    console.log("roomId:", roomId);
    console.log("gameMode:", gameMode);
    
    if (!roomId) return null;
    
    // Cerca se c'è un gioco speciale programmato per questo contatore
    const matchingPosition = specialGamePositions.find(
      pos => pos.position === counter
    );
    
    console.log("findNextSpecialGame matchingPosition:", matchingPosition);
    
    return matchingPosition ? matchingPosition.gameType : null;
  };
  
  // Gestisce l'attivazione di un gioco speciale
  const handleSpecialGame = async (gameType) => {
    console.log("=== DEBUG handleSpecialGame ===");
    console.log("gameType:", gameType);
    console.log("gameMode:", gameMode);
    console.log("Current activeSpecialGame:", activeSpecialGame);
    
    // Se c'è già un gioco speciale attivo, non fare nulla
    if (activeSpecialGame) {
      console.log("Special game already active, returning");
      return;
    }
    
    // Carica il file backupActions nella lingua corrente
    const backupActions = await loadBackupActions();
    
    // Verifica se il tipo di gioco speciale esiste nel file di backup
    if (!backupActions.specialGames || !backupActions.specialGames[gameType]) {
      console.error(`${t.logMessages.missingSpecialGame.replace('{type}', gameType)}`);
      return;
    }
    
    // Seleziona un giocatore casuale per il gioco speciale
    // (potrebbe essere diverso dal giocatore corrente)
    const randomPlayerIndex = Math.floor(Math.random() * players.length);
    setSpecialGamePlayer(players[randomPlayerIndex]);
    
    // Imposta il gioco speciale attivo
    setActiveSpecialGame(gameType);
    
    // Incrementa il contatore dei giochi speciali mostrati
    setSpecialGamesShown(prev => prev + 1);
    
    console.log("Setting activeSpecialGame to:", gameType);
    console.log("specialGamePlayer set to:", players[randomPlayerIndex]);
    
    // Gestisci la logica specifica per ogni tipo di gioco
    switch (gameType) {
      case "truthOrDare":
        // Prepara il gioco Truth or Dare
        handleTruthOrDareGame(randomPlayerIndex, backupActions);
        break;
      
      case "wouldYouRather":
        // Prepara il gioco "Preferiresti"
        handleWouldYouRatherGame(backupActions, randomPlayerIndex);
        break;
        
      case "questoOQuello":
        // Prepara il gioco "Questo o Quello"
        handleQuestoOQuelloGame(backupActions, randomPlayerIndex);
        break;
        
      case "timerChallenge":
        // Prepara il gioco "Timer Challenge"
        handleTimerChallengeGame(backupActions, randomPlayerIndex);
        break;
        
      case "nonHoMai":
        // Prepara il gioco "Non ho mai"
        handleNonHoMaiGame(backupActions, randomPlayerIndex);
        break;
        
      default:
        // Per gli altri giochi speciali, mostra semplicemente il messaggio
        const gameText = backupActions.specialGames[gameType].text;
        
        // Sostituisce {player} con il nome del giocatore selezionato casualmente
        const playerName = players[randomPlayerIndex];
        const formattedText = gameText.replace(/{player}/g, playerName);
        
        // Sostituisci {count} con un numero casuale da 1 a 5 (per giochi che lo richiedono)
        const randomCount = Math.floor(Math.random() * 5) + 1;
        const finalText = formattedText.replace(/{count}/g, randomCount);
        
        // Imposta l'azione corrente
        setCurrentAction({ text: finalText });
        break;
    }
  };
  
  // Funzione per gestire il gioco "Truth or Dare"
  const handleTruthOrDareGame = (playerIndex, backupActions) => {
    console.log("=== DEBUG handleTruthOrDareGame ===");
    console.log("playerIndex:", playerIndex);
    
    // Seleziona tutti i giocatori nell'ordine in cui giocheranno
    const allPlayers = [...players];
    const startIndex = playerIndex;
    
    // Organizziamo i giocatori in ordine, a partire dal giocatore selezionato
    const orderedPlayers = [
      ...allPlayers.slice(startIndex),
      ...allPlayers.slice(0, startIndex)
    ];
    
    // Imposta l'elenco dei giocatori per Truth or Dare
    setTruthDarePlayers(orderedPlayers);
    setCurrentTruthDareIndex(0);
    setCurrentTruthDareChoice(null);
    setTruthDareContent(null);
    setTruthDareState("choosing");
    
    // Reset delle domande utilizzate quando inizia un nuovo gioco Truth or Dare
    setUsedTruthQuestions([]);
    setUsedDareQuestions([]);
    
    console.log("truthDarePlayers set to:", orderedPlayers);
    console.log("Reset used questions arrays");
    
    // Ottieni il testo introduttivo dal file di backup o usa uno predefinito
    const introText = t.truthDareIntro.replace('{player}', orderedPlayers[0]);
    
    // Imposta l'azione corrente
    setCurrentAction({ text: introText });
  };
  
  // Funzione per gestire il gioco "Non ho mai"
  const handleNonHoMaiGame = (backupActions, randomPlayerIndex) => {
    // Usa il testo dal backup actions o da specialGames
    const gameText = t.specialGames.nonHoMai;
    const playerName = players[randomPlayerIndex];
    const formattedText = gameText.replace(/{player}/g, playerName);
    
    // Imposta l'azione corrente
    setCurrentAction({ text: formattedText });
  };
  
  // Funzione helper per selezionare una domanda non utilizzata
  const selectUnusedQuestion = (allOptions, usedQuestions) => {
    console.log("=== DEBUG selectUnusedQuestion ===");
    console.log("Total options:", allOptions.length);
    console.log("Used questions:", usedQuestions.length);
    
    // Filtra le opzioni escludendo quelle già utilizzate
    const availableOptions = allOptions.filter(option => 
      !usedQuestions.includes(option)
    );
    
    console.log("Available options:", availableOptions.length);
    
    // Se tutte le domande sono state utilizzate, resetta l'array e usa tutte le opzioni
    if (availableOptions.length === 0) {
      console.log("All questions used, resetting...");
      return {
        selectedContent: allOptions[Math.floor(Math.random() * allOptions.length)],
        shouldResetUsedList: true
      };
    }
    
    // Seleziona una domanda casuale tra quelle disponibili
    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    const selectedContent = availableOptions[randomIndex];
    
    console.log("Selected question:", selectedContent.substring(0, 50) + "...");
    
    return {
      selectedContent,
      shouldResetUsedList: false
    };
  };
  
  // Funzione per gestire la scelta in Truth or Dare
  const handleTruthDareChoice = async (choice) => {
    console.log("=== DEBUG handleTruthDareChoice ===");
    console.log("choice:", choice);
    console.log("currentTruthDareIndex:", currentTruthDareIndex);
    
    setCurrentTruthDareChoice(choice);
    setTruthDareState("executing");
    
    // Carica il file backupActions nella lingua corrente
    const backupActions = await loadBackupActions();
    
    // Se la scelta è "debt", gestisci un debito
    if (choice === "debt") {
      // Aggiungi il giocatore alla lista dei debiti
      const currentPlayer = truthDarePlayers[currentTruthDareIndex];
      
      // Aggiungi un nuovo debito alla lista
      setDebtList(prev => [
        ...prev,
        {
          player: currentPlayer,
          description: t.debts.debtDescription,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
      
      // Imposta un messaggio specifico per il debito
      setTruthDareContent(t.truthDareOptions.debtExplanation);
      
      // Aggiorna l'azione corrente per riflettere la scelta
      const debtText = t.specialGames.truthOrDare.debt.replace('{player}', currentPlayer);
      setCurrentAction({ text: debtText });
      
      return;
    }
    
    // Altrimenti, gestisci truth o dare
    // In modalità giochi usa sempre 'party' come fallback
    const selectedRoomId = gameMode === 'games' ? 'party' : (selectedRoom?.id || 'party');
    
    // Verifica se la stanza corrente ha contenuti truth/dare specifici
    if (backupActions.truthDareGame && 
        backupActions.truthDareGame[choice] && 
        backupActions.truthDareGame[choice][selectedRoomId]) {
      
      // Seleziona una domanda evitando duplicati
      const allOptions = backupActions.truthDareGame[choice][selectedRoomId];
      const currentUsedQuestions = choice === "truth" ? usedTruthQuestions : usedDareQuestions;
      
      const { selectedContent, shouldResetUsedList } = selectUnusedQuestion(allOptions, currentUsedQuestions);
      
      // Aggiorna l'array delle domande utilizzate
      if (choice === "truth") {
        if (shouldResetUsedList) {
          setUsedTruthQuestions([selectedContent]);
        } else {
          setUsedTruthQuestions(prev => [...prev, selectedContent]);
        }
      } else {
        if (shouldResetUsedList) {
          setUsedDareQuestions([selectedContent]);
        } else {
          setUsedDareQuestions(prev => [...prev, selectedContent]);
        }
      }
      
      // Imposta il contenuto scelto
      setTruthDareContent(selectedContent);
      
      // Aggiorna l'azione corrente per riflettere la scelta
      const choiceText = choice === "truth" 
        ? t.specialGames.truthOrDare.truth
        : t.specialGames.truthOrDare.dare;
      
      const currentPlayer = truthDarePlayers[currentTruthDareIndex];
      const formattedText = choiceText.replace('{player}', currentPlayer);
      setCurrentAction({ text: formattedText });
    } else {
      // Fallback se non ci sono contenuti specifici per la stanza
      setTruthDareContent("Contenuto non disponibile per questa stanza");
    }
  };
  
  // Funzione per gestire il gioco "Preferiresti"
  const handleWouldYouRatherGame = (backupActions, randomPlayerIndex) => {
    // Verifica se ci sono domande disponibili per la stanza corrente
    // In modalità giochi usa sempre 'party' come fallback
    const roomId = gameMode === 'games' ? 'party' : (selectedRoom?.id || 'party');
    
    if (backupActions.wouldYouRather && 
        backupActions.wouldYouRather[roomId]) {
      
      // Seleziona una domanda casuale per la stanza corrente
      const options = backupActions.wouldYouRather[roomId];
      const randomIndex = Math.floor(Math.random() * options.length);
      const selectedContent = options[randomIndex].text;
      
      // Imposta il contenuto selezionato
      setWouldYouRatherContent(selectedContent);
      
      // Ottieni il messaggio per il gioco "Preferiresti"
      const playerName = players[randomPlayerIndex];
      let gameText = t.specialGames.wouldYouRather.replace('{player}', playerName);
      
      // Imposta l'azione corrente
      setCurrentAction({ 
        text: `${gameText}\n\n${selectedContent}\n\n${t.wouldYouRatherExplanation}` 
      });
    } else {
      // Fallback se non ci sono domande per questa stanza
      setWouldYouRatherContent("Domanda non disponibile per questa stanza");
      setCurrentAction({ text: t.specialGames.wouldYouRather.replace('{player}', players[randomPlayerIndex]) });
    }
  };
  
  // Funzione per gestire il gioco "Questo o Quello"
  const handleQuestoOQuelloGame = (backupActions, randomPlayerIndex) => {
    // Verifica se ci sono domande disponibili per la stanza corrente
    const roomId = gameMode === 'games' ? 'party' : (selectedRoom?.id || 'party');
    
    if (backupActions.specialGames && 
        backupActions.specialGames.questoOQuello &&
        backupActions.specialGames.questoOQuello[roomId]) {
      
      // Seleziona una domanda casuale per la stanza corrente
      const options = backupActions.specialGames.questoOQuello[roomId];
      const randomIndex = Math.floor(Math.random() * options.length);
      const selectedContent = options[randomIndex];
      
      // Imposta il contenuto selezionato
      setQuestoOQuelloContent(selectedContent);
      
      // Ottieni il messaggio introduttivo dal file di backup
      const introText = backupActions.specialGames.questoOQuello.text || "QUESTO o QUELLO!";
      
      // Sostituisci {player} con il nome del giocatore selezionato casualmente
      const playerName = players[randomPlayerIndex];
      const formattedText = introText.replace(/{player}/g, playerName);
      
      // Imposta l'azione corrente
      setCurrentAction({ 
        text: `${formattedText}\n\n${selectedContent}` 
      });
    } else {
      // Fallback se non ci sono domande per questa stanza
      const introText = backupActions.specialGames.questoOQuello.text || "QUESTO o QUELLO!";
      const playerName = players[randomPlayerIndex];
      const formattedText = introText.replace(/{player}/g, playerName);
      
      setQuestoOQuelloContent("Domanda non disponibile per questa stanza");
      setCurrentAction({ text: formattedText });
    }
  };
  
  // Funzione per gestire il gioco "Timer Challenge"
  const handleTimerChallengeGame = (backupActions, randomPlayerIndex) => {
    // Verifica se ci sono sfide disponibili per la stanza corrente
    const roomId = gameMode === 'games' ? 'party' : (selectedRoom?.id || 'party');
    
    if (backupActions.specialGames && 
        backupActions.specialGames.timerChallenge &&
        backupActions.specialGames.timerChallenge[roomId]) {
      
      // Seleziona una sfida casuale per la stanza corrente
      const options = backupActions.specialGames.timerChallenge[roomId];
      const randomIndex = Math.floor(Math.random() * options.length);
      const selectedContent = options[randomIndex];
      
      // Imposta il contenuto selezionato
      setTimerChallengeContent(selectedContent);
      setIsTimerActive(false);
      setTimerSeconds(20);
      
      // Ottieni il messaggio introduttivo dal file di backup
      const introText = backupActions.specialGames.timerChallenge.text;
      
      // Sostituisci {player} con il nome del giocatore selezionato casualmente
      const playerName = players[randomPlayerIndex];
      const formattedText = introText.replace(/{player}/g, playerName);
      
      // Imposta l'azione corrente
      setCurrentAction({ text: formattedText });
    } else {
      // Fallback se non ci sono sfide per questa stanza
      setTimerChallengeContent("Sfida non disponibile per questa stanza");
      const fallbackText = t.specialGames.timerChallenge.replace('{player}', players[randomPlayerIndex]);
      setCurrentAction({ text: fallbackText });
    }
  };
  
  // Funzione per avviare il timer
  const startTimer = () => {
    setIsTimerActive(true);
    setTimerSeconds(20);
    
    // Avvia il timer
    const timer = setInterval(() => {
      setTimerSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };
  
  // Funzione per ottenere un messaggio appropriato per il gioco speciale attivo
  const getSpecialGameMessage = () => {
    if (!activeSpecialGame) return "";
    
    switch (activeSpecialGame) {
      case "truthOrDare":
        if (truthDareState === "choosing") {
          return t.specialGames.truthOrDare.choosing.replace('{player}', truthDarePlayers[currentTruthDareIndex]);
        } else {
          return currentTruthDareChoice === "truth" 
            ? t.specialGames.truthOrDare.truth.replace('{player}', truthDarePlayers[currentTruthDareIndex])
            : currentTruthDareChoice === "dare"
              ? t.specialGames.truthOrDare.dare.replace('{player}', truthDarePlayers[currentTruthDareIndex])
              : t.specialGames.truthOrDare.debt.replace('{player}', truthDarePlayers[currentTruthDareIndex]);
        }
        
      case "wouldYouRather":
        return t.specialGames.wouldYouRather.replace('{player}', specialGamePlayer);
        
      case "questoOQuello":
        return t.specialGames.questoOQuello.replace('{player}', specialGamePlayer);
        
      case "timerChallenge":
        return t.specialGames.timerChallenge.replace('{player}', specialGamePlayer);
        
      case "nonHoMai":
        return t.specialGames.nonHoMai.replace('{player}', specialGamePlayer);
        
      default:
        if (t.specialGames[activeSpecialGame]) {
          return t.specialGames[activeSpecialGame].replace('{player}', specialGamePlayer);
        }
        return "";
    }
  };
  
  // Passa al turno successivo dopo un gioco speciale
  const nextTurnAfterSpecialGame = (nextTurnCallback) => {
    console.log("=== DEBUG nextTurnAfterSpecialGame ===");
    console.log("Current activeSpecialGame:", activeSpecialGame);
    console.log("truthDareState:", truthDareState);
    console.log("currentTruthDareIndex:", currentTruthDareIndex);
    console.log("truthDarePlayers length:", truthDarePlayers.length);
    console.log("gameMode:", gameMode);
    
    // Logica specifica per ogni tipo di gioco
    if (activeSpecialGame === "truthOrDare") {
      // In modalità giochi, Truth or Dare non gira tra tutti i giocatori
      // ma fa solo una domanda per volta
      if (gameMode === 'games') {
        console.log("Games mode - ending truth or dare after one question");
        // Termina subito il gioco speciale - il reset avverrà dopo
      } else {
        // Modalità stanze - comportamento originale
        if (currentTruthDareIndex < truthDarePlayers.length - 1) {
          console.log("Moving to next truth/dare player");
          // Passa al giocatore successivo
          setCurrentTruthDareIndex(prev => prev + 1);
          setCurrentTruthDareChoice(null);
          setTruthDareContent(null);
          setTruthDareState("choosing");
          
          // Aggiorna il messaggio per il prossimo giocatore
          const nextPlayer = truthDarePlayers[currentTruthDareIndex + 1];
          const nextIntroText = t.truthDareNextPlayerIntro.replace('{player}', nextPlayer);
          setCurrentAction({ text: nextIntroText });
          
          return;
        }
      }
    }
    
    console.log("Ending special game, resetting states");
    
    // Per tutti gli altri giochi speciali o per terminare Truth or Dare
    setActiveSpecialGame(null);
    setSpecialGamePlayer(null);
    setCurrentTruthDareChoice(null);
    setTruthDareContent(null);
    setTruthDareState("choosing");
    setWouldYouRatherContent(null);
    setQuestoOQuelloContent(null);
    setIsTimerActive(false);
    setTimerSeconds(20);
    setTimerChallengeContent(null);
    
    // Reset delle domande utilizzate quando il gioco Truth or Dare finisce completamente
    if (activeSpecialGame === "truthOrDare") {
      setUsedTruthQuestions([]);
      setUsedDareQuestions([]);
      console.log("Reset used questions arrays after Truth or Dare game ended");
    }
    
    console.log("Calling nextTurnCallback with true");
    
    // Passa al turno successivo utilizzando il callback fornito
    if (nextTurnCallback) {
      nextTurnCallback(true);
    }
  };
  
  return {
    // Costanti
    MIN_ACTIONS_BETWEEN_SPECIAL_GAMES,
    
    // Stati dei giochi speciali
    activeSpecialGame,
    specialGamePlayer,
    debtList,
    truthDarePlayers,
    currentTruthDareChoice,
    truthDareContent,
    truthDareState,
    wouldYouRatherContent,
    questoOQuelloContent,
    isTimerActive,
    timerSeconds,
    timerChallengeContent,
    specialGamePositions,
    
    // Stati per domande utilizzate (per debug se necessario)
    usedTruthQuestions,
    usedDareQuestions,
    
    // Funzioni
    initializeSpecialGames,
    shouldShowSpecialGame,
    findNextSpecialGame,
    handleSpecialGame,
    handleTruthDareChoice,
    getSpecialGameMessage,
    nextTurnAfterSpecialGame,
    startTimer
  };
};

export default useSpecialGames;