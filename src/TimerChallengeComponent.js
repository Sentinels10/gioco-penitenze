// TimerChallengeComponent.js
import React, { useState, useEffect, useRef } from 'react';

const TimerChallengeComponent = ({ timerChallengeContent }) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const timerIntervalRef = useRef(null);
  
  // Funzione per avviare il timer
  const startTimer = () => {
    console.log("Timer avviato!");
    
    // Resetta e avvia il timer
    setTimerSeconds(20);
    setIsTimerActive(true);
    
    // Cancella eventuali intervalli precedenti
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Avvia il nuovo intervallo
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Pulisci l'intervallo quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="timer-challenge-container">
      {!isTimerActive ? (
        <button
          onClick={startTimer}
          style={{
            backgroundColor: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          ⏱️
        </button>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: timerSeconds > 10 ? '#2ECC71' : timerSeconds > 5 ? '#F39C12' : '#E74C3C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: `0 0 20px ${timerSeconds > 10 ? '#2ECC71' : timerSeconds > 5 ? '#F39C12' : '#E74C3C'}50`,
            animation: timerSeconds <= 5 ? 'pulse 1s infinite' : 'none'
          }}>
            {timerSeconds}
          </div>
          <p style={{
            fontSize: '14px',
            color: '#AAAAAA',
            textAlign: 'center'
          }}>
            Tempo rimanente: {timerSeconds}s
          </p>
        </div>
      )}
      
      {timerChallengeContent && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#FF6B3520',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {timerChallengeContent}
          </p>
        </div>
      )}
      
      {!isTimerActive && timerSeconds === 0 && (
        <p style={{
          fontSize: '16px',
          color: '#E74C3C',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Tempo scaduto! Paga le penalità!
        </p>
      )}
      
      <style jsx="true">{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .timer-challenge-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default TimerChallengeComponent;