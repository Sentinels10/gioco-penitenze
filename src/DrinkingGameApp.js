// DrinkingGameApp.js - Componente principale che collega la logica con l'interfaccia utente
import React from 'react';
import './App.css';
import useGameLogic from './useGameLogic';
import GameUI from './GameUI';

/**
 * Componente principale dell'applicazione
 * Collega la logica di gioco (useGameLogic) con l'interfaccia utente (GameUI)
 */
const DrinkingGameApp = () => {
  // Utilizziamo il custom hook per ottenere tutta la logica e lo stato del gioco
  const gameLogic = useGameLogic();
  
  // Passiamo tutti i valori e le funzioni al componente UI
  return <GameUI {...gameLogic} />;
};

export default DrinkingGameApp;