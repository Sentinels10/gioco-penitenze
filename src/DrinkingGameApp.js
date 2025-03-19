import React, { useState } from 'react';
import './App.css';
import backupActions from './backupActions.json';

const DrinkingGameApp = () => {
  // Game states: 'entrance', 'roomSelection', 'playerSetup', 'playing'
  const [gameState, setGameState] = useState('entrance');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Loading state for better UX
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  
  // State for the room slider
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
  
  // Room definitions with their content types
  const rooms = [
    { 
      id: 'redRoom', 
      name: 'Red Room', 
      description: 'Domande e penitenze su sesso e relazioni',
      color: 'bg-red-600',
      icon: '❤️'
    },
    { 
      id: 'darkRoom', 
      name: 'Dark Room', 
      description: 'Sfide estreme e segreti imbarazzanti',
      color: 'bg-gray-800',
      icon: '🖤'
    },
    { 
      id: 'clash', 
      name: 'Clash', 
      description: 'Sfide uno contro uno',
      color: 'bg-yellow-500',
      icon: '⚔️'
    },
    { 
      id: 'lounge', 
      name: 'Lounge', 
      description: 'Modalità soft',
      color: 'bg-blue-500',
      icon: '🛋️'
    }
  ];
  
  // Room content - questions and challenges for each room (fallback)
  const roomContent = {
    redRoom: [
      { "text": "Raccontaci la tua più grande fantasia sessuale oppure 5 penalità" },
      { "text": "Indica chi è la persona più attraente in questa stanza e spiega perché oppure 4 penalità" },
      { "text": "Racconta la cosa più intima che hai fatto in un luogo pubblico oppure 3 penalità" },
      { "text": "Rivela quanto tempo è passato dall'ultima volta che hai fatto sesso oppure 3 penalità" },
      { "text": "Confessa qual è la tua posizione preferita oppure 5 penalità" },
      { "text": "Ammetti se hai mai tradito un partner oppure 4 penalità" },
      { "text": "Spiega qual è il tuo più grande turn-on oppure 3 penalità" },
      { "text": "Rivela chi sceglieresti in questa stanza per passare una notte insieme oppure 5 penalità" },
      { "text": "Racconta la tua esperienza sessuale più imbarazzante oppure 4 penalità" },
      { "text": "Confessa il tuo fetish più strano oppure 3 penalità" }
    ],
    darkRoom: [
      { "text": "Rivela un segreto oscuro che non hai mai detto a nessuno oppure 5 penalità" },
      { "text": "Confessa la cosa peggiore che hai fatto di nascosto oppure 6 penalità" },
      { "text": "Mostra l'ultimo messaggio privato che hai inviato oppure 5 penalità" },
      { "text": "Racconta la bugia più grande che hai mai detto oppure 4 penalità" },
      { "text": "Lascia che un altro giocatore posti qualcosa sui tuoi social oppure 7 penalità" },
      { "text": "Confessa qualcosa che nessuno si aspetterebbe da te oppure 5 penalità" },
      { "text": "Mostra la foto più imbarazzante che hai sul telefono oppure 6 penalità" },
      { "text": "Rivela il pensiero più oscuro che hai avuto oppure 8 penalità" },
      { "text": "Racconta il tuo più grande rimpianto oppure 5 penalità" },
      { "text": "Descrivi il momento in cui hai toccato il fondo oppure 4 penalità" }
    ],
    clash: [
      { "text": "Sfida: Tu e il giocatore alla tua destra dovete mantenere il contatto visivo per 30 secondi senza ridere. Se perdete, entrambi fate 5 penalità" },
      { "text": "Sfida: Chi riesce a stare più a lungo in equilibrio su una gamba sola tra te e un giocatore a scelta. Il perdente fa 6 penalità" },
      { "text": "Sfida: Braccio di ferro con la persona di fronte a te. Il perdente fa 4 penalità" },
      { "text": "Sfida: Tu e un altro giocatore dovete fare una gara a chi beve un bicchiere d'acqua più velocemente. Il perdente fa 5 penalità" },
      { "text": "Sfida: Gara di addominali con un giocatore a scelta per 20 secondi. Il perdente fa 7 penalità" },
      { "text": "Sfida: Chi riesce a trattenere il respiro più a lungo tra te e il giocatore successivo. Il perdente fa 5 penalità" },
      { "text": "Sfida: Gara di barzellette con un altro giocatore, vince chi fa ridere più persone. Il perdente fa 5 penalità" },
      { "text": "Sfida: Tu e un altro giocatore dovete mimarvi a vicenda per 30 secondi. Chi ride primo fa 4 penalità" },
      { "text": "Sfida: Gara di insulti creativi con un altro giocatore (senza offendere veramente). Il perdente fa 5 penalità" },
      { "text": "Sfida: Gara di sguardi intensi con un altro giocatore. Chi distoglie lo sguardo primo fa 3 penalità" }
    ],
    lounge: [
      { "text": "Racconta qual è il tuo film preferito e perché oppure 2 penalità" },
      { "text": "Condividi un ricordo d'infanzia felice oppure 3 penalità" },
      { "text": "Se potessi viaggiare ovunque, dove andresti? Oppure 2 penalità" },
      { "text": "Descrivi il tuo giorno perfetto oppure 1 penalità" },
      { "text": "Qual è il tuo piatto preferito? Oppure 2 penalità" },
      { "text": "Racconta la cosa più gentile che qualcuno ha fatto per te oppure 2 penalità" },
      { "text": "Descrivi il tuo talento nascosto oppure 1 penalità" },
      { "text": "Racconta qual è il tuo sogno nel cassetto oppure 2 penalità" },
      { "text": "Se potessi avere un superpotere, quale sceglieresti? Oppure 1 penalità" },
      { "text": "Qual è il tuo primo ricordo? Oppure 3 penalità" }
    ]
  };
  
  // Enter room selection from entrance screen
  const enterRoomSelection = () => {
    setGameState('roomSelection');
    setCurrentRoomIndex(0); // Reset to the first room
  };
  
  // Navigate to next room
  const nextRoom = () => {
    setCurrentRoomIndex((prevIndex) => (prevIndex + 1) % rooms.length);
  };
  
  // Navigate to previous room
  const prevRoom = () => {
    setCurrentRoomIndex((prevIndex) => (prevIndex - 1 + rooms.length) % rooms.length);
  };
  
  // Select a room and move to player setup after preparing actions
  const selectRoom = async (room) => {
    setSelectedRoom(room);
    // Prepare actions for the selected room
    await prepareActionsForRoom(room.id);
    setGameState('playerSetup');
  };
  
  // Prepare actions for a room from the backup file
  const prepareActionsForRoom = async (roomId) => {
    setIsGenerating(true);
    setGeneratingProgress(0);
    
    try {
      // Simulate loading with a timer for better UX
      for (let step = 1; step <= 10; step++) {
        await new Promise(resolve => setTimeout(resolve, 150)); // Small delay to simulate progress
        setGeneratingProgress(Math.floor((step / 10) * 100));
      }
      
      // Get actions from backup file
      const backupActionsForRoom = backupActions[roomId] || [];
      
      if (backupActionsForRoom.length > 0) {
        // Shuffle and select 50 random actions from the backup
        const shuffledBackupActions = [...backupActionsForRoom]
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);
        
        // Update the actions pool for this room
        setRoomActionsPool(prev => ({
          ...prev,
          [roomId]: shuffledBackupActions
        }));
      } else {
        // Fallback to original predefined actions if backup is empty
        setRoomActionsPool(prev => ({
          ...prev,
          [roomId]: [...roomContent[roomId]].sort(() => Math.random() - 0.5)
        }));
      }
      
      // Reset action index for this room
      setCurrentActionIndex(prev => ({
        ...prev,
        [roomId]: 0
      }));
      
    } catch (error) {
      console.error('Error preparing actions:', error);
      
      // Fallback to original predefined actions
      setRoomActionsPool(prev => ({
        ...prev,
        [roomId]: [...roomContent[roomId]].sort(() => Math.random() - 0.5)
      }));
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(100);
    }
  };
  
  // Add a player to the list
  const addPlayer = () => {
    if (playerName.trim() && players.length < 10) {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };
  
  // Start the game with current players
  const startGame = () => {
    if (players.length < 2) {
      alert("Inserisci almeno 2 giocatori per iniziare!");
      return;
    }
    
    setGameState('playing');
    
    // Seleziona un giocatore casuale all'inizio
    const randomPlayerIndex = Math.floor(Math.random() * players.length);
    setCurrentPlayerIndex(randomPlayerIndex);
    
    nextAction();
  };
  
  // Get next action from the selected room with player interaction support
  const nextAction = () => {
    const roomId = selectedRoom.id;
    const currentPool = roomActionsPool[roomId];
    const index = currentActionIndex[roomId];
    
    // If there are no actions in the pool, use predefined ones
    if (!currentPool || currentPool.length === 0) {
      const randomIndex = Math.floor(Math.random() * roomContent[roomId].length);
      setCurrentAction({ text: roomContent[roomId][randomIndex].text });
      return;
    }
    
    // If we've exhausted the actions, start over
    const adjustedIndex = index % currentPool.length;
    
    // Increment the index for next time
    setCurrentActionIndex({
      ...currentActionIndex,
      [roomId]: index + 1
    });
    
    // Ottieni l'azione dal pool
    let actionText = currentPool[adjustedIndex].text;
    
    // Controlla se questa azione richiede un giocatore specifico (contiene il segnaposto {playerB})
    if (actionText.includes("{playerB}")) {
      // Scegli un giocatore casuale diverso dal giocatore corrente
      let otherPlayers = players.filter((_, idx) => idx !== currentPlayerIndex);
      
      // Se non ci sono altri giocatori (situazione improbabile), usa la versione senza sostituzione
      if (otherPlayers.length > 0) {
        const randomPlayerIndex = Math.floor(Math.random() * otherPlayers.length);
        const randomPlayerName = otherPlayers[randomPlayerIndex];
        
        // Sostituisci il segnaposto con il nome del giocatore casuale
        actionText = actionText.replace(/{playerB}/g, randomPlayerName);
      } else {
        // Rimuovi il segnaposto se non ci sono altri giocatori
        actionText = actionText.replace(/{playerB}/g, "qualcun altro");
      }
    }
    
    setCurrentAction({ text: actionText });
  };
  
  // Move to next player's turn (selezione casuale)
  const nextTurn = () => {
    // Se c'è solo un giocatore, non cambierà
    if (players.length <= 1) {
      nextAction();
      return;
    }
    
    // Selezione casuale del prossimo giocatore (diverso da quello attuale)
    let nextPlayerIndex;
    do {
      nextPlayerIndex = Math.floor(Math.random() * players.length);
    } while (nextPlayerIndex === currentPlayerIndex);
    
    setCurrentPlayerIndex(nextPlayerIndex);
    nextAction();
  };
  
  // Handle key press in input fields
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameState === 'playerSetup' && playerName) {
      addPlayer();
    }
  };
  
  // Reset the game to entrance screen
  const resetGame = () => {
    setGameState('entrance');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentAction(null);
    setPlayerName('');
    setSelectedRoom(null);
    
    // Reset room actions pool
    setRoomActionsPool({
      redRoom: [],
      darkRoom: [],
      clash: [],
      lounge: []
    });
    
    setCurrentActionIndex({
      redRoom: 0,
      darkRoom: 0,
      clash: 0,
      lounge: 0
    });
  };

  // Render different screens based on game state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      {/* Entrance Screen */}
      {gameState === 'entrance' && (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 w-full max-w-md text-center space-y-8">
          <h1 className="text-4xl font-bold mb-8">🎮 Party Game</h1>
          <button 
            onClick={enterRoomSelection} 
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-lg font-bold text-2xl transition-transform transform hover:scale-105"
          >
            Entra
          </button>
        </div>
      )}
      
      {/* Room Selection Screen */}
      {gameState === 'roomSelection' && !isGenerating && (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 w-full max-w-md text-center space-y-6">
          <h2 className="text-2xl font-bold">Scegli una Stanza</h2>
          
          {/* Room Slider/Carousel */}
          <div className="relative">
            {/* Current room card */}
            <div 
              className={`${rooms[currentRoomIndex].color} rounded-lg p-6 h-80 flex flex-col justify-between transition-transform duration-300 transform`}
            >
              <div className="text-6xl mb-4">{rooms[currentRoomIndex].icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{rooms[currentRoomIndex].name}</h3>
                <p className="text-lg mt-3">{rooms[currentRoomIndex].description}</p>
              </div>
              
              <button 
                onClick={() => selectRoom(rooms[currentRoomIndex])}
                className="mt-4 bg-white bg-opacity-30 hover:bg-opacity-50 py-2 px-6 rounded-lg font-bold transition-all"
              >
                Seleziona
              </button>
            </div>
            
            {/* Navigation buttons */}
            <button 
              onClick={prevRoom}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 bg-white bg-opacity-50 rounded-full p-2 text-black"
              aria-label="Stanza precedente"
            >
              ◀
            </button>
            
            <button 
              onClick={nextRoom}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 bg-white bg-opacity-50 rounded-full p-2 text-black"
              aria-label="Stanza successiva"
            >
              ▶
            </button>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            {rooms.map((room, index) => (
              <button
                key={index}
                onClick={() => setCurrentRoomIndex(index)}
                className={`h-3 w-3 rounded-full ${
                  currentRoomIndex === index ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}
                aria-label={`Vai alla stanza ${index + 1}`}
              />
            ))}
          </div>
          
          <button onClick={resetGame} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded">
            Indietro
          </button>
        </div>
      )}
      
      {/* Loading Screen (when preparing actions) */}
      {isGenerating && (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 w-full max-w-md text-center space-y-6">
          <h2 className="text-2xl font-bold">Preparazione in Corso</h2>
          <p>Stiamo preparando le penitenze per la stanza {selectedRoom?.name}...</p>
          
          <div className="w-full bg-gray-200 rounded-full h-4 bg-opacity-20">
            <div 
              className="bg-blue-600 h-4 rounded-full" 
              style={{ width: `${generatingProgress}%` }}
            ></div>
          </div>
          <p>{generatingProgress}% completato</p>
        </div>
      )}
      
      {/* Player Setup Screen */}
      {gameState === 'playerSetup' && selectedRoom && (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 w-full max-w-md text-center space-y-6">
          <h2 className="text-2xl font-bold">{selectedRoom.icon} {selectedRoom.name}</h2>
          <p>{selectedRoom.description}</p>
          
          <div>
            <label className="block mb-1 font-semibold">Inserisci i nomi dei giocatori</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 p-2 rounded text-black" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                onKeyPress={handleKeyPress}
                placeholder="Nome giocatore"
              />
              <button onClick={addPlayer} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Aggiungi</button>
            </div>
          </div>
          
          <div>
            <p className="font-semibold">Giocatori ({players.length}):</p>
            <ul className="text-sm space-y-1 mt-2 max-h-40 overflow-y-auto">
              {players.map((p, i) => (
                <li key={i} className="bg-white bg-opacity-20 rounded p-2 flex justify-between">
                  <span>👤 {p}</span>
                  <button 
                    onClick={() => setPlayers(players.filter((_, index) => index !== i))}
                    className="text-red-400 hover:text-red-600"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setGameState('roomSelection')} 
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Indietro
            </button>
            <button 
              onClick={startGame} 
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
              disabled={players.length < 2}
            >
              Gioca
            </button>
          </div>
        </div>
      )}
      
      {/* Game Screen */}
      {gameState === 'playing' && selectedRoom && (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 w-full max-w-md text-center space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{selectedRoom.icon} {selectedRoom.name}</h2>
            <button onClick={resetGame} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">Esci</button>
          </div>
          
          <div className="my-6">
            <div className={`${selectedRoom.color} rounded-t-lg p-2`}>
              <p className="font-bold">Turno di: {players[currentPlayerIndex]}</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-b-lg min-h-[150px] flex flex-col items-center justify-center">
              {currentAction && (
                <div>
                  <p className="text-xl">{currentAction.text}</p>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={nextTurn} 
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-bold"
          >
            Prossima
          </button>
        </div>
      )}
    </div>
  );
};

export default DrinkingGameApp;