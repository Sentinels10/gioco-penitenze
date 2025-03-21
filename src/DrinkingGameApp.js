import React, { useState, useEffect } from 'react';
import './App.css';
import backupActions from './backupActions.json';
// Importa l'immagine del guanto che punta
// Nota: Dovrai salvare l'immagine nella cartella src/assets con questo nome
import pointingGlove from './assets/pointing-glove.png';

const DrinkingGameApp = () => {
  // Game states: 'welcome', 'playerSetup', 'roomSelection', 'playing', 'gameOver'
  const [gameState, setGameState] = useState('welcome');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState(null);
  const [playerName, setPlayerName] = useState('');
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
  
  // Go to room selection after player setup
  const goToRoomSelection = () => {
    if (players.length < 2) {
      alert("Inserisci almeno 2 giocatori per iniziare!");
      return;
    }
    setGameState('roomSelection');
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
  
  // Aggiunge un giocatore alla lista
  const addPlayer = () => {
    if (playerName.trim() && players.length < 15) {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };
  
  // Rimuove un giocatore dalla lista
  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };
  
  // Funzione dedicata per aggiornare l'azione corrente
  const updateCurrentAction = () => {
    if (!selectedRoom) return;
    
    const roomId = selectedRoom.id;
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
          `? Se taci sono ${penaltyCount} penalità`,
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
  const nextTurn = () => {
    const roomId = selectedRoom.id;
    
    // Verifica se il numero massimo di azioni è stato raggiunto
    if (actionsCounter >= MAX_ACTIONS_PER_GAME - 1) {
      // Vai alla schermata di fine partita invece che direttamente alla selezione della stanza
      setGameState('gameOver');
      return;
    }
    
    // Incrementa l'indice per la prossima volta
    setCurrentActionIndex(prev => ({
      ...prev,
      [roomId]: prev[roomId] + 1
    }));
    
    // Se c'è solo un giocatore, non cambia
    if (players.length <= 1) {
      setTimeout(() => {
        updateCurrentAction();
      }, 50);
      return;
    }
    
    // Seleziona un giocatore casuale diverso da quello attuale
    let nextPlayerIndex;
    do {
      nextPlayerIndex = Math.floor(Math.random() * players.length);
    } while (nextPlayerIndex === currentPlayerIndex);
    
    setCurrentPlayerIndex(nextPlayerIndex);
    
    // Piccolo timeout per assicurarsi che l'indice sia aggiornato prima di chiamare updateCurrentAction
    setTimeout(() => {
      updateCurrentAction();
    }, 50);
  };
  
  // Gestisce il tasto Enter nel campo di input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && playerName.trim()) {
      addPlayer();
    }
  };
  
  // Resetta il gioco
  const resetGame = () => {
    setGameState('welcome');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentAction(null);
    setSelectedRoom(null);
    setPreviousAction(null);
    setActionsCounter(0);
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

  return (
    <div className="app-container">
      {/* Welcome Screen */}
      {gameState === 'welcome' && (
        <div className="screen welcome-screen">
          <div className="content-container">
            <h1 className="app-title">{appName}</h1>
            <p className="app-description">{appDescription}</p>
            
            <button 
              className="primary-button" 
              onClick={enterPlayerSetup}
            >
              Entra nel club
            </button>
          </div>
        </div>
      )}
      
      {/* Player Setup Screen */}
      {gameState === 'playerSetup' && (
        <div className="screen player-setup-screen">
          <button className="back-button" onClick={goBack}>
            ←
          </button>
          
          <div className="content-container">
            <h1 className="screen-title">Chi vuole entrare?</h1>
            
            <h2 className="section-title">I membri</h2>
            
            <div className="player-input-container">
              <input
                type="text"
                className="player-input"
                placeholder="Inserisci il nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="icon-button add-button" 
                onClick={addPlayer}
              >
                +
              </button>
            </div>
            
            <div className="players-list">
              {players.map((player, index) => (
                <div key={index} className="player-item">
                  <span className="player-name">{player}</span>
                  <button 
                    className="icon-button remove-button"
                    onClick={() => removePlayer(index)}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              className="primary-button"
              onClick={goToRoomSelection}
              disabled={players.length < 2}
            >
              Siamo pronti
            </button>
          </div>
        </div>
      )}
      
      {/* Room Selection Screen */}
      {gameState === 'roomSelection' && (
        <div className="screen room-selection-screen">
          <button className="back-button" onClick={goBack}>
            ←
          </button>
          
          <div className="content-container">
            <div 
              className="room-card" 
              style={{ 
                backgroundColor: 
                  rooms[currentRoomIndex].color === '#1F2937' ? '#1F2937' :
                  rooms[currentRoomIndex].color === '#D946EF' ? '#D946EF' : '#fff'
              }}
            >
              <h1 
                className="room-title" 
                style={{ 
                  color: 
                    rooms[currentRoomIndex].color === '#1F2937' || 
                    rooms[currentRoomIndex].color === '#D946EF' ? '#fff' : '#000' 
                }}
              >
                {rooms[currentRoomIndex].name}
              </h1>
              
              <button 
                className="primary-button"
                onClick={() => selectRoom(rooms[currentRoomIndex])}
              >
                Entra
              </button>
              
              <p 
                className="room-description" 
                style={{ 
                  color: 
                    rooms[currentRoomIndex].color === '#1F2937' ? '#9CA3AF' :
                    rooms[currentRoomIndex].color === '#D946EF' ? '#f5d0fe' : '#4B5563'
                }}
              >
                {rooms[currentRoomIndex].description}
              </p>
            </div>
            
            <div className="room-navigation">
              <button 
                className="nav-button"
                onClick={() => setCurrentRoomIndex((prev) => (prev === 0 ? rooms.length - 1 : prev - 1))}
              >
                ‹
              </button>
              
              <div className="room-indicators">
                {rooms.map((_, index) => (
                  <div 
                    key={index}
                    className={`room-indicator ${index === currentRoomIndex ? 'active' : ''}`}
                    onClick={() => setCurrentRoomIndex(index)}
                  ></div>
                ))}
              </div>
              
              <button 
                className="nav-button"
                onClick={() => setCurrentRoomIndex((prev) => (prev === rooms.length - 1 ? 0 : prev + 1))}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Playing Screen */}
      {gameState === 'playing' && selectedRoom && (
        <div className="screen playing-screen">
          <button className="back-button" onClick={goBack}>
            ←
          </button>
          
          <div className="content-container">
            <h1 className="player-turn">Turno di {players[currentPlayerIndex]}</h1>
            
            <div className="action-container">
              {currentAction && (
                <p className="action-text">{currentAction.text}</p>
              )}
            </div>
            
            <button 
              className="primary-button next-button"
              onClick={nextTurn}
            >
              Prossima
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
            color: 'white'
          }}
        >
          <div className="content-container" style={{ padding: '30px' }}>
            <h1 className="screen-title" style={{ fontSize: '42px', marginBottom: '20px' }}>
              Partita Finita!
            </h1>
            
            <p style={{ fontSize: '18px', marginBottom: '50px', opacity: 0.9 }}>
              Avete completato {MAX_ACTIONS_PER_GAME} azioni!
            </p>
            
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              Tocca per tornare alla selezione delle modalità
            </p>
            
            {/* Immagine del guanto che punta */}
            <div 
              style={{ 
                width: '120px',
                height: '120px',
                margin: '10px auto 30px',
                position: 'relative',
                animation: 'float 2s infinite ease-in-out'
              }}
              className="glove-pointer"
            >
              <img 
                src={pointingGlove} 
                alt="Guanto che punta" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="overlay-screen">
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Caricamento in corso...</p>
          </div>
        </div>
      )}
      
      {/* Add CSS animation for the floating effect */}
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .glove-pointer {
          filter: drop-shadow(0px 5px 5px rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
};

export default DrinkingGameApp;