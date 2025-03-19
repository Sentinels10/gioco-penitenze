import React, { useState, useEffect, useRef } from 'react';
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
  
  // API states
  const [huggingFaceApiKey] = useState('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');
  const [apiError, setApiError] = useState(null);
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
  
  // Room content - questions and challenges for each room
  const roomContent = {
    redRoom: [
      { text: "Raccontaci la tua più grande fantasia sessuale oppure 5 penalità" },
      { text: "Indica chi è la persona più attraente in questa stanza e spiega perché oppure 4 penalità" },
      { text: "Racconta la cosa più intima che hai fatto in un luogo pubblico oppure 3 penalità" },
      { text: "Rivela quanto tempo è passato dall'ultima volta che hai fatto sesso oppure 3 penalità" },
      { text: "Confessa qual è la tua posizione preferita oppure 5 penalità" },
      { text: "Ammetti se hai mai tradito un partner oppure 4 penalità" },
      { text: "Spiega qual è il tuo più grande turn-on oppure 3 penalità" },
      { text: "Rivela chi sceglieresti in questa stanza per passare una notte insieme oppure 5 penalità" },
      { text: "Racconta la tua esperienza sessuale più imbarazzante oppure 4 penalità" },
      { text: "Confessa il tuo fetish più strano oppure 3 penalità" }
    ],
    darkRoom: [
      { text: "Rivela un segreto oscuro che non hai mai detto a nessuno oppure 5 penalità" },
      { text: "Confessa la cosa peggiore che hai fatto di nascosto oppure 6 penalità" },
      { text: "Mostra l'ultimo messaggio privato che hai inviato oppure 5 penalità" },
      { text: "Racconta la bugia più grande che hai mai detto oppure 4 penalità" },
      { text: "Lascia che un altro giocatore posti qualcosa sui tuoi social oppure 7 penalità" },
      { text: "Confessa qualcosa che nessuno si aspetterebbe da te oppure 5 penalità" },
      { text: "Mostra la foto più imbarazzante che hai sul telefono oppure 6 penalità" },
      { text: "Rivela il pensiero più oscuro che hai avuto oppure 8 penalità" },
      { text: "Racconta il tuo più grande rimpianto oppure 5 penalità" },
      { text: "Descrivi il momento in cui hai toccato il fondo oppure 4 penalità" }
    ],
    clash: [
      { text: "Sfida: Tu e il giocatore alla tua destra dovete mantenere il contatto visivo per 30 secondi senza ridere. Se perdete, entrambi fate 5 penalità" },
      { text: "Sfida: Chi riesce a stare più a lungo in equilibrio su una gamba sola tra te e un giocatore a scelta. Il perdente fa 6 penalità" },
      { text: "Sfida: Braccio di ferro con la persona di fronte a te. Il perdente fa 4 penalità" },
      { text: "Sfida: Tu e un altro giocatore dovete fare una gara a chi beve un bicchiere d'acqua più velocemente. Il perdente fa 5 penalità" },
      { text: "Sfida: Gara di addominali con un giocatore a scelta per 20 secondi. Il perdente fa 7 penalità" },
      { text: "Sfida: Chi riesce a trattenere il respiro più a lungo tra te e il giocatore successivo. Il perdente fa 5 penalità" },
      { text: "Sfida: Gara di barzellette con un altro giocatore, vince chi fa ridere più persone. Il perdente fa 5 penalità" },
      { text: "Sfida: Tu e un altro giocatore dovete mimarvi a vicenda per 30 secondi. Chi ride primo fa 4 penalità" },
      { text: "Sfida: Gara di insulti creativi con un altro giocatore (senza offendere veramente). Il perdente fa 5 penalità" },
      { text: "Sfida: Gara di sguardi intensi con un altro giocatore. Chi distoglie lo sguardo primo fa 3 penalità" }
    ],
    lounge: [
      { text: "Racconta qual è il tuo film preferito e perché oppure 2 penalità" },
      { text: "Condividi un ricordo d'infanzia felice oppure 3 penalità" },
      { text: "Se potessi viaggiare ovunque, dove andresti? Oppure 2 penalità" },
      { text: "Descrivi il tuo giorno perfetto oppure 1 penalità" },
      { text: "Qual è il tuo piatto preferito? Oppure 2 penalità" },
      { text: "Racconta la cosa più gentile che qualcuno ha fatto per te oppure 2 penalità" },
      { text: "Descrivi il tuo talento nascosto oppure 1 penalità" },
      { text: "Racconta qual è il tuo sogno nel cassetto oppure 2 penalità" },
      { text: "Se potessi avere un superpotere, quale sceglieresti? Oppure 1 penalità" },
      { text: "Qual è il tuo primo ricordo? Oppure 3 penalità" }
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
  
  // Select a room and move to player setup after generating actions
  const selectRoom = async (room) => {
    setSelectedRoom(room);
    // Generate actions for the selected room
    await generateActionsBatch(room.id);
    setGameState('playerSetup');
  };
  
  // Generate a batch of actions using the Hugging Face API
  const generateActionsBatch = async (roomId) => {
    setIsGenerating(true);
    setGeneratingProgress(0);
    setApiError(null);
    
    try {
      // Prepare improved prompts based on room type - with emphasis on variety and uniqueness
      const promptByRoom = {
        redRoom: "Genera 50 domande e sfide piccanti UNICHE E DIVERSE TRA LORO su sesso e relazioni per un gioco di penitenze tra adulti, IN LINGUA ITALIANA. IMPORTANTE: OGNI DOMANDA DEVE ESSERE COMPLETAMENTE DIVERSA DALLE ALTRE. Varia gli argomenti, i tipi di sfide e le penitenze. Ogni domanda deve includere la frase 'oppure X penalità' direttamente alla fine, dove X è un numero tra 3 e 6. Esempio formato: 'Confessa la tua fantasia più segreta oppure 4 penalità'. ASSICURATI CHE NON CI SIANO RIPETIZIONI.",
        darkRoom: "Genera 50 sfide estreme e domande ASSOLUTAMENTE UNICHE sui segreti più imbarazzanti per un gioco tra adulti, IN LINGUA ITALIANA. IMPORTANTE: OGNI SFIDA DEVE ESSERE COMPLETAMENTE DIVERSA DALLE ALTRE, sia nei temi che nel tipo di sfida proposta. Ogni sfida deve includere la frase 'oppure X penalità' direttamente alla fine, dove X è un numero tra 4 e 7. Esempio formato: 'Mostra il messaggio più compromettente sul tuo telefono oppure 5 penalità'. EVITA ASSOLUTAMENTE QUALSIASI RIPETIZIONE.",
        clash: "Genera 50 sfide uno contro uno COMPLETAMENTE DIVERSE TRA LORO per un gioco di penitenze tra adulti, IN LINGUA ITALIANA. IMPORTANTE: OGNI SFIDA DEVE ESSERE UNICA. Varia i tipi di competizione, le abilità testate e le penitenze. Ogni sfida deve specificare una competizione tra due giocatori e includere 'Il perdente fa X penalità' dove X è un numero tra 3 e 6. Esempio formato: 'Sfida: Gara di flessioni con un altro giocatore. Il perdente fa 4 penalità'. ASSICURATI CHE NON CI SIANO DUPLICATI.",
        lounge: "Genera 50 domande e sfide TOTALMENTE UNICHE in modalità soft per un gioco di penitenze, IN LINGUA ITALIANA. IMPORTANTE: OGNI DOMANDA DEVE ESSERE DIVERSA DALLE ALTRE nei temi, nello stile e nel tipo di risposta richiesta. Non troppo imbarazzanti, adatte a tutti. Ogni domanda deve includere la frase 'oppure X penalità' direttamente alla fine, dove X è un numero tra 1 e 3. Esempio formato: 'Racconta il tuo hobby preferito oppure 2 penalità'. EVITA COMPLETAMENTE QUALSIASI RIPETIZIONE DI CONCETTI."
      };
      
      // Simulate the generation with a timer
      const simulateGeneration = async () => {
        let progress = 0;
        const totalSteps = 10; // Divide into 10 steps
        
        for (let step = 1; step <= totalSteps; step++) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Small delay to simulate progress
          progress = Math.floor((step / totalSteps) * 100);
          setGeneratingProgress(progress);
        }
        
        // Try to call the Hugging Face API
        try {
          // API endpoint
          const apiUrl = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
          
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${huggingFaceApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              inputs: promptByRoom[roomId],
              parameters: {
                max_new_tokens: 1500, // Increased token limit
                temperature: 0.8,     // Slightly increased temperature for more variety
                return_full_text: false
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }
          
          const data = await response.json();
          const generatedText = data[0]?.generated_text || "";
          
          // Parse the generated text into action objects
          // Improved parsing to get complete phrases
          const lines = generatedText.split("\n").filter(line => {
            const trimmedLine = line.trim();
            return trimmedLine !== "" && 
                  (trimmedLine.includes("oppure") || 
                   trimmedLine.includes("penalità") || 
                   trimmedLine.includes("Il perdente fa"));
          });
          
          // Process lines to remove numbering and clean up
          const cleanedLines = lines.map(line => {
            // Remove numbering at the beginning (e.g., "1. ", "2) ", etc.)
            return line.replace(/^\d+[\.\)\-]?\s*/, '').trim();
          });
          
          // Remove duplicates based on exact matches
          const uniqueLines = [...new Set(cleanedLines)];
          
          // Function to check similarity between strings
          const isSimilar = (str1, str2) => {
            // Simple similarity check - if strings are too similar
            const str1Lower = str1.toLowerCase();
            const str2Lower = str2.toLowerCase();
            
            // Check for substantial overlap
            if (str1Lower.includes(str2Lower.substring(0, Math.min(30, str2Lower.length))) ||
                str2Lower.includes(str1Lower.substring(0, Math.min(30, str1Lower.length)))) {
              return true;
            }
            
            // Check word similarity
            const words1 = str1Lower.split(/\s+/);
            const words2 = str2Lower.split(/\s+/);
            let commonWords = 0;
            
            for (const word of words1) {
              if (word.length > 4 && words2.includes(word)) { // Only check significant words
                commonWords++;
              }
            }
            
            // If more than 60% of significant words are the same, consider them similar
            return commonWords > Math.min(words1.length, words2.length) * 0.6;
          };
          
          // Further filter to remove similar actions
          const nonSimilarActions = [];
          for (const line of uniqueLines) {
            let isDuplicate = false;
            for (const existingAction of nonSimilarActions) {
              if (isSimilar(line, existingAction.text)) {
                isDuplicate = true;
                break;
              }
            }
            
            if (!isDuplicate) {
              nonSimilarActions.push({ text: line });
            }
          }
          
          // Combine with predefined actions, but avoid duplicates
          let combinedActions = [...nonSimilarActions];
          
          // If we don't have enough unique actions, add some from predefined content
          if (combinedActions.length < 50) {
            // First try to use backup actions
            const backupActionsForRoom = backupActions[roomId] || [];
            const shuffledBackupActions = [...backupActionsForRoom].sort(() => Math.random() - 0.5);
            
            for (const action of shuffledBackupActions) {
              let isDuplicate = false;
              for (const existingAction of combinedActions) {
                if (isSimilar(action.text, existingAction.text)) {
                  isDuplicate = true;
                  break;
                }
              }
              
              if (!isDuplicate && combinedActions.length < 50) {
                combinedActions.push(action);
              }
              
              // If we've reached 50 actions, break out of the loop
              if (combinedActions.length >= 50) {
                break;
              }
            }
            
            // If we still don't have enough, use the original predefined actions
            if (combinedActions.length < 50) {
              const predefinedActions = [...roomContent[roomId]].map(item => ({ text: item.text }));
              
              for (const action of predefinedActions) {
                let isDuplicate = false;
                for (const existingAction of combinedActions) {
                  if (isSimilar(action.text, existingAction.text)) {
                    isDuplicate = true;
                    break;
                  }
                }
                
                if (!isDuplicate && combinedActions.length < 50) {
                  combinedActions.push(action);
                }
              }
            }
          }
          
          // Shuffle the combined actions for variety
          combinedActions = combinedActions.sort(() => Math.random() - 0.5);
          
          // Update the actions pool for this room
          setRoomActionsPool(prev => ({
            ...prev,
            [roomId]: combinedActions.slice(0, 50) // Limit to 50 actions
          }));
          
          // Reset action index for this room
          setCurrentActionIndex(prev => ({
            ...prev,
            [roomId]: 0
          }));
          
        } catch (apiError) {
          console.error('API error:', apiError);
          setApiError(`Errore API: ${apiError.message}`);
          
          // Use backup actions when API fails
          console.log('Using backup actions');
          const backupActionsForRoom = backupActions[roomId] || [];
          
          if (backupActionsForRoom.length > 0) {
            // Shuffle and select 50 random actions from the backup
            const shuffledBackupActions = [...backupActionsForRoom].sort(() => Math.random() - 0.5).slice(0, 50);
            
            setRoomActionsPool(prev => ({
              ...prev,
              [roomId]: shuffledBackupActions
            }));
          } else {
            // Fallback to original predefined actions
            setRoomActionsPool(prev => ({
              ...prev,
              [roomId]: [...roomContent[roomId]].sort(() => Math.random() - 0.5)
            }));
          }
        }
      };
      
      await simulateGeneration();
      
    } catch (error) {
      console.error('Error during generation:', error);
      setApiError(`Errore: ${error.message}`);
      
      // Use backup actions as fallback
      const backupActionsForRoom = backupActions[roomId] || [];
      
      if (backupActionsForRoom.length > 0) {
        // Shuffle and select 50 random actions from the backup
        const shuffledBackupActions = [...backupActionsForRoom].sort(() => Math.random() - 0.5).slice(0, 50);
        
        setRoomActionsPool(prev => ({
          ...prev,
          [roomId]: shuffledBackupActions
        }));
      } else {
        // Fallback to original predefined actions
        setRoomActionsPool(prev => ({
          ...prev,
          [roomId]: [...roomContent[roomId]].sort(() => Math.random() - 0.5)
        }));
      }
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
    setCurrentPlayerIndex(0);
    nextAction();
  };
  
  // Get next action from the selected room
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
    
    setCurrentAction({ text: currentPool[adjustedIndex].text });
  };
  
  // Move to next player's turn
  const nextTurn = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
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
    setApiError(null);
    
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
      
      {/* Loading Screen (when generating actions) */}
      {isGenerating && (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 w-full max-w-md text-center space-y-6">
          <h2 className="text-2xl font-bold">Preparazione in Corso</h2>
          <p>Stiamo generando le penitenze per la stanza {selectedRoom?.name}...</p>
          
          <div className="w-full bg-gray-200 rounded-full h-4 bg-opacity-20">
            <div 
              className="bg-blue-600 h-4 rounded-full" 
              style={{ width: `${generatingProgress}%` }}
            ></div>
          </div>
          <p>{generatingProgress}% completato</p>
          
          {apiError && (
            <div className="bg-red-600 bg-opacity-70 rounded p-2 text-sm">
              <p>{apiError}</p>
              <p className="mt-2">Usando le penitenze predefinite come alternativa.</p>
            </div>
          )}
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