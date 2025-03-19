import React, { useState, useEffect } from 'react';
import './App.css';
import backupActions from './backupActions.json';

const DrinkingGameApp = () => {
  // Game states: 'welcome', 'playerSetup', 'roomSelection', 'playing'
  const [gameState, setGameState] = useState('welcome');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  
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
    lounge: []
  });
  
  // Current index for tracking which action to use from the pool
  const [currentActionIndex, setCurrentActionIndex] = useState({
    redRoom: 0,
    darkRoom: 0,
    clash: 0,
    lounge: 0
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
    ]
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
      
      // Ottieni azioni dal backup file
      const backupActionsForRoom = backupActions[room.id] || [];
      
      if (backupActionsForRoom.length > 0) {
        // Mescola e seleziona 50 azioni casuali
        const shuffledBackupActions = [...backupActionsForRoom]
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);
        
        // Aggiorna le azioni disponibili
        setRoomActionsPool(prev => ({
          ...prev,
          [room.id]: shuffledBackupActions
        }));
      }
      
      // Resetta l'indice delle azioni
      setCurrentActionIndex(prev => ({
        ...prev,
        [room.id]: 0
      }));
      
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
    const index = currentActionIndex[roomId];
    
    // Se non ci sono azioni nel pool, usa quelle predefinite
    if (!currentPool || currentPool.length === 0) {
      console.log("Nessuna azione nel pool, uso il fallback");
      const fallbackPool = roomContent[roomId] || [];
      if (fallbackPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackPool.length);
        setCurrentAction({ text: fallbackPool[randomIndex].text });
      } else {
        setCurrentAction({ text: "Nessuna azione disponibile" });
      }
      return;
    }
    
    // Se abbiamo esaurito le azioni, ricomincia
    const adjustedIndex = index % currentPool.length;
    
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
    
    setCurrentAction({ text: actionText });
  };
  
  // Passa al turno successivo
  const nextTurn = () => {
    const roomId = selectedRoom.id;
    
    // Incrementa l'indice per la prossima volta
    setCurrentActionIndex(prev => ({
      ...prev,
      [roomId]: prev[roomId] + 1
    }));
    
    // Se c'è solo un giocatore, non cambia
    if (players.length <= 1) {
      updateCurrentAction();
      return;
    }
    
    // Seleziona un giocatore casuale diverso da quello attuale
    let nextPlayerIndex;
    do {
      nextPlayerIndex = Math.floor(Math.random() * players.length);
    } while (nextPlayerIndex === currentPlayerIndex);
    
    setCurrentPlayerIndex(nextPlayerIndex);
    updateCurrentAction();
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
            <div className="room-card" style={{ backgroundColor: rooms[currentRoomIndex].color === '#1F2937' ? '#1F2937' : '#fff' }}>
              <h1 className="room-title" style={{ color: rooms[currentRoomIndex].color === '#1F2937' ? '#fff' : '#000' }}>
                {rooms[currentRoomIndex].name}
              </h1>
              
              <button 
                className="primary-button"
                onClick={() => selectRoom(rooms[currentRoomIndex])}
              >
                Entra
              </button>
              
              <p className="room-description" style={{ color: rooms[currentRoomIndex].color === '#1F2937' ? '#9CA3AF' : '#4B5563' }}>
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
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="overlay-screen">
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Caricamento in corso...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrinkingGameApp;