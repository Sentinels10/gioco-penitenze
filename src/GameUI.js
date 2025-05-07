// GameUI.js - Componente per la parte visuale del gioco
import React from 'react';
import './App.css';

// Importa l'immagine del guanto che punta
import pointingGlove from './assets/pointing-glove.png';

/**
 * Componente per la UI del gioco
 * @param {Object} props - Props passate dal componente principale
 */
const GameUI = (props) => {
  const {
    // Riferimento alle traduzioni
    t,
    language,
    
    // Stati del gioco
    gameState,
    players,
    inputPlayers,
    currentPlayerIndex,
    currentAction,
    selectedRoom,
    isLoading,
    currentRoomIndex,
    
    // Stati per giochi speciali
    activeSpecialGame,
    specialGamePlayer,
    debtList,
    truthDarePlayers,
    currentTruthDareChoice,
    truthDareContent,
    truthDareState,
    
    // NUOVO: Contenuto del gioco "preferiresti"
    wouldYouRatherContent,
    
    // Stati per paywall
    hasPlayedFreeGame,
    hasPaid,
    selectedPaymentOption,
    isProcessingPayment,
    
    // NUOVO: Sistema di punteggio
    playerPenalties,
    
    // Funzioni
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
    resetPaywallState,
    getSpecialGameMessage,
    
    // NUOVO: Funzioni per i nuovi pulsanti
    handleDone,
    handlePay,
    getLeaderboard,
    endGame
  } = props;

  // Rendering condizionale in base allo stato del gioco
  return (
    <div className="app-container">
      {/* Welcome Screen */}
      {gameState === 'welcome' && (
        <div className="screen welcome-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '340px'
          }}>
            <h1 style={{ 
              fontSize: '36px', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>{t.appName}</h1>
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '40px',
              color: '#CCCCCC',
              lineHeight: '1.5'
            }}>{t.appDescription}</p>
            
            <button 
              onClick={enterPlayerSetup}
              style={{
                width: '100%',
                backgroundColor: '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              {t.startButton}
            </button>
            
            <button 
              onClick={openLanguageSelector}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1px solid #3498db',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {language === 'it' ? '🇮🇹 Italiano' : 
               language === 'en' ? '🇬🇧 English' : 
               language === 'fr' ? '🇫🇷 Français' : 
               '🇩🇪 Deutsch'} - {language === 'it' ? 'Cambia lingua' : 
                                 language === 'en' ? 'Change language' : 
                                 language === 'fr' ? 'Changer de langue' : 
                                 'Sprache ändern'}
            </button>
            
            {/* Pulsante nascosto per reset (solo per testing) */}
            <div style={{ marginTop: '20px', opacity: 0.5 }}>
              <button
                onClick={resetPaywallState}
                style={{
                  background: 'none',
                  border: '1px solid #555',
                  color: '#888',
                  padding: '8px 16px',
                  fontSize: '12px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {t.resetButton}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Language Selection Screen */}
      {gameState === 'languageSelection' && (
        <div className="screen language-selection-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '20px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              {language === 'it' ? 'LINGUA' : 
               language === 'en' ? 'LANGUAGE' : 
               language === 'fr' ? 'LANGUE' : 
               'SPRACHE'}
            </h1>
            
            <div></div>
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px',
            marginBottom: '20px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '20px'
            }}>
              <button 
                onClick={() => changeLanguage('it')}
                style={{
                  backgroundColor: language === 'it' ? '#3498db' : '#2A2A2A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>🇮🇹</span>
                <div style={{
                  textAlign: 'left',
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '5px'
                  }}>
                    Italiano
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#AAAAAA',
                    margin: 0
                  }}>
                    Gioca in Italiano
                  </p>
                </div>
                {language === 'it' && (
                  <span style={{ fontSize: '24px', color: '#FFFFFF' }}>✓</span>
                )}
              </button>
              
              <button 
                onClick={() => changeLanguage('en')}
                style={{
                  backgroundColor: language === 'en' ? '#3498db' : '#2A2A2A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>🇬🇧</span>
                <div style={{
                  textAlign: 'left',
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '5px'
                  }}>
                    English
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#AAAAAA',
                    margin: 0
                  }}>
                    Play in English
                  </p>
                </div>
                {language === 'en' && (
                  <span style={{ fontSize: '24px', color: '#FFFFFF' }}>✓</span>
                )}
              </button>

              {/* Aggiungiamo l'opzione per il francese */}
              <button 
                onClick={() => changeLanguage('fr')}
                style={{
                  backgroundColor: language === 'fr' ? '#3498db' : '#2A2A2A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>🇫🇷</span>
                <div style={{
                  textAlign: 'left',
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '5px'
                  }}>
                    Français
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#AAAAAA',
                    margin: 0
                  }}>
                    Jouer en Français
                  </p>
                </div>
                {language === 'fr' && (
                  <span style={{ fontSize: '24px', color: '#FFFFFF' }}>✓</span>
                )}
              </button>

              {/* Aggiungiamo l'opzione per il tedesco */}
              <button 
                onClick={() => changeLanguage('de')}
                style={{
                  backgroundColor: language === 'de' ? '#3498db' : '#2A2A2A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '15px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>🇩🇪</span>
                <div style={{
                  textAlign: 'left',
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '5px'
                  }}>
                    Deutsch
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#AAAAAA',
                    margin: 0
                  }}>
                    Auf Deutsch spielen
                  </p>
                </div>
                {language === 'de' && (
                  <span style={{ fontSize: '24px', color: '#FFFFFF' }}>✓</span>
                )}
              </button>
            </div>
          </div>
          
          <div style={{ 
            padding: '0',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            zIndex: 10
          }}>
            <button 
              onClick={goBack}
              style={{
                width: '100%',
                backgroundColor: '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {language === 'it' ? 'CONFERMA' : 
               language === 'en' ? 'CONFIRM' : 
               language === 'fr' ? 'CONFIRMER' : 
               'BESTÄTIGEN'}
            </button>
          </div>
        </div>
      )}
      
      {/* Player Setup Screen */}
      {gameState === 'playerSetup' && (
        <div className="screen player-setup-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              {t.playersScreenTitle}
            </h1>
            
            <div></div> {/* Colonna vuota a destra per equilibrio */}
          </div>
          
          <div style={{ 
            flex: 1,
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
            marginBottom: '80px'
          }}>
            {inputPlayers.map((input, index) => (
              <div key={input.id} style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                maxWidth: '340px',
                marginBottom: '16px',
                padding: '0 20px'
              }}>
                <input
                  id={`player-input-${index}`}
                  type="text"
                  value={input.name}
                  onChange={(e) => updatePlayerName(input.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, input.id, index)}
                  placeholder={t.playerInputPlaceholder}
                  style={{
                    flex: 1,
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    fontSize: '16px',
                  }}
                />
                <button 
                  onClick={() => removePlayerInput(input.id)}
                  disabled={inputPlayers.length <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#808080',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '10px',
                    opacity: inputPlayers.length <= 1 ? 0.5 : 1
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <button 
              onClick={addPlayerInput}
              disabled={inputPlayers.length >= 15}
              style={{
                margin: '5px 0 20px 0',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1px dashed #808080',
                borderRadius: '10px',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                width: '340px'
              }}
            >
              <span style={{ fontSize: '20px' }}>⊕</span> {t.addPlayerLabel}
            </button>
          </div>
          
          <div style={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent'
          }}>
            <button 
              onClick={startGame}
              style={{
                width: '100%',
                backgroundColor: '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '20px' }}>▶</span> {t.startGameButton}
            </button>
          </div>
        </div>
      )}
      
      {/* Room Selection Screen */}
      {gameState === 'roomSelection' && (
        <div className="screen room-selection-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              {t.roomsScreenTitle}
            </h1>
            
            <div></div>
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px',
            minHeight: '450px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '300px',
              height: 'auto',
              minHeight: '300px',
              maxHeight: '70vh',
              backgroundColor: t.rooms[currentRoomIndex].color,
              borderRadius: '15px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '30px',
              marginBottom: '15px'
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: t.rooms[currentRoomIndex].color === '#1F2937' || 
                        t.rooms[currentRoomIndex].color === '#DC2626' || 
                        t.rooms[currentRoomIndex].color === '#D946EF' ? '#FFFFFF' : '#000000'
                }}>
                  {t.rooms[currentRoomIndex].name}
                </h2>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => selectRoom(t.rooms[currentRoomIndex])}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px 40px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {t.enterButton}
                </button>
              </div>
              
              <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                <p style={{
                  fontSize: '16px',
                  textAlign: 'center',
                  color: t.rooms[currentRoomIndex].color === '#1F2937' ? '#9CA3AF' :
                        t.rooms[currentRoomIndex].color === '#DC2626' ? 'rgba(255,255,255,0.8)' :
                        t.rooms[currentRoomIndex].color === '#D946EF' ? '#f5d0fe' : 
                        'rgba(0,0,0,0.7)'
                }}>
                  {t.rooms[currentRoomIndex].description}
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <button 
                onClick={() => {
                  // Retrieve the setCurrentRoomIndex function from props
                  const newIndex = currentRoomIndex === 0 ? t.rooms.length - 1 : currentRoomIndex - 1;
                  props.setCurrentRoomIndex(newIndex);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#AAAAAA',
                  fontSize: '36px',
                  cursor: 'pointer',
                  padding: '10px'
                }}
              >
                ‹
              </button>
              
              <div style={{ 
                display: 'flex',
                gap: '8px'
              }}>
                {t.rooms.map((_, index) => (
                  <div 
                    key={index}
                    onClick={() => props.setCurrentRoomIndex(index)}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: index === currentRoomIndex ? '#FFFFFF' : '#555555',
                      cursor: 'pointer'
                    }}
                  ></div>
                ))}
              </div>
              
              <button 
                onClick={() => {
                  // Retrieve the setCurrentRoomIndex function from props
                  const newIndex = currentRoomIndex === t.rooms.length - 1 ? 0 : currentRoomIndex + 1;
                  props.setCurrentRoomIndex(newIndex);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#AAAAAA',
                  fontSize: '36px',
                  cursor: 'pointer',
                  padding: '10px'
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Playing Screen */}
      {gameState === 'playing' && selectedRoom && (
        <div className="screen playing-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '20px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              {selectedRoom.name.toUpperCase()}
            </h1>
            
            <div></div> {/* Colonna vuota a destra per equilibrio */}
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '10px 0 30px 0'
            }}>
              {activeSpecialGame ? t.specialGamesTitles[activeSpecialGame] : players[currentPlayerIndex]}
            </h2>
            
            <div style={{
              backgroundColor: '#1A1A1A',
              borderRadius: '15px',
              padding: '30px 20px',
              marginBottom: '30px',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {currentAction && (
                <p style={{
                  fontSize: '20px',
                  lineHeight: '1.4',
                  textAlign: 'center'
                }}>
                  {currentAction.text}
                </p>
              )}
              
              {/* Messaggio unificato per i giochi speciali attivi */}
              {activeSpecialGame && activeSpecialGame !== "wouldYouRather" && (
                <p style={{ 
                  marginTop: '15px', 
                  fontSize: '16px', 
                  color: '#AAAAAA',
                  textAlign: 'center'
                }}>
                  {getSpecialGameMessage()}
                </p>
              )}
              
              {/* Pulsanti per la scelta Obbligo/Verità/Debito */}
              {activeSpecialGame === "truthOrDare" && truthDareState === "choosing" && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px',
                  marginTop: '20px'
                }}>
                  <p style={{ fontSize: '16px', color: '#AAAAAA' }}>
                    {t.truthDareOptions.selectOption}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => handleTruthDareChoice("truth")}
                      style={{
                        backgroundColor: '#E74C3C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {t.truthDareOptions.truth}
                    </button>
                    <button
                      onClick={() => handleTruthDareChoice("dare")}
                      style={{
                        backgroundColor: '#3498DB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {t.truthDareOptions.dare}
                    </button>
                    <button
                      onClick={() => handleTruthDareChoice("debt")}
                      style={{
                        backgroundColor: '#2ECC71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {t.truthDareOptions.debt}
                    </button>
                  </div>
                </div>
              )}

              {/* Mostra il contenuto della scelta */}
              {activeSpecialGame === "truthOrDare" && truthDareState === "executing" && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: currentTruthDareChoice === "truth" ? '#E74C3C20' :
                                currentTruthDareChoice === "dare" ? '#3498DB20' :
                                '#2ECC7120',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    marginBottom: '10px',
                    color: currentTruthDareChoice === "truth" ? '#E74C3C' :
                        currentTruthDareChoice === "dare" ? '#3498DB' :
                        '#2ECC71'
                  }}>
                    {currentTruthDareChoice === "truth" ? t.truthDareOptions.truth :
                    currentTruthDareChoice === "dare" ? t.truthDareOptions.dare :
                    t.truthDareOptions.debt}
                  </h3>
                  
                  {truthDareContent && (
                    <p style={{ fontSize: '18px' }}>
                      {truthDareContent}
                    </p>
                  )}
                  
                  {currentTruthDareChoice === "debt" && (
                    <p style={{ fontSize: '16px', color: '#AAAAAA', marginTop: '10px' }}>
                      {t.truthDareOptions.debtExplanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ 
            padding: '0',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            zIndex: 10
          }}>
            {/* NUOVO: Sostituiamo il pulsante NEXT con due nuovi pulsanti */}
            {activeSpecialGame === "truthOrDare" && truthDareState === "choosing" ? (
              // Manteniamo il pulsante originale durante la scelta Truth/Dare/Debt
              <button 
                style={{
                  width: '100%',
                  backgroundColor: '#AAAAAA',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'not-allowed',
                  opacity: 0.5
                }}
              >
                {t.truthDareOptions.chooseOption}
              </button>
            ) : (
              // Nuovi pulsanti "Fatto" e "Paga"
              <div style={{
                display: 'flex',
                width: '100%'
              }}>
                <button 
                  onClick={() => {
                    if (activeSpecialGame) {
                      nextTurnAfterSpecialGame();
                    } else {
                      handleDone();
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#2ECC71',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0',
                    padding: '16px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {t.doneButton}
                </button>
                <button 
                  onClick={() => {
                    if (activeSpecialGame) {
                      nextTurnAfterSpecialGame();
                    } else {
                      handlePay();
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#E74C3C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0',
                    padding: '16px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {t.payButton}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* NUOVO: Leaderboard Screen */}
      {gameState === 'leaderboard' && (
        <div className="screen leaderboard-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '20px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div></div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              {t.leaderboardTitle}
            </h1>
            
            <div></div>
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px',
            marginBottom: '80px'
          }}>
            <p style={{
              fontSize: '16px',
              textAlign: 'center',
              color: '#AAAAAA',
              marginBottom: '30px'
            }}>
              {t.leaderboardSubtitle}
            </p>
            
            <div style={{
              backgroundColor: '#1A1A1A',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              {getLeaderboard().map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 10px',
                  borderBottom: index < getLeaderboard().length - 1 ? '1px solid #333' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#555',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: index < 3 ? 'bold' : 'normal'
                    }}>
                      {item.player}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#FFFFFF'
                  }}>
                    {item.penalties} <span style={{ fontSize: '14px', fontWeight: 'normal', opacity: 0.7 }}>{t.penaltiesLabel}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '16px',
                color: '#AAAAAA',
                marginBottom: '10px'
              }}>
                {t.actionsCompletedMessage.replace('{count}', props.MAX_ACTIONS_PER_GAME)}
              </p>
            </div>
          </div>
          
          <div style={{ 
            padding: '0',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            zIndex: 10
          }}>
            <button 
              onClick={endGame}
              style={{
                width: '100%',
                backgroundColor: '#3498db',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {t.continueButton}
            </button>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div 
          className="screen game-over-screen" 
          onClick={() => {
            // Se l'utente ha già giocato la partita gratuita e non ha pagato, mostra il paywall
            if (hasPlayedFreeGame && !hasPaid) {
              goBack(); // Utilizza la funzione goBack passata dalle props
            } else {
              goBack(); // Utilizza la funzione goBack passata dalle props
            }
          }}
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            textAlign: 'center',
            maxWidth: '340px'
          }}>
            <h1 style={{ 
              fontSize: '36px', 
              marginBottom: '30px',
              fontWeight: 'bold'
            }}>
              {t.gameOverMessage}
            </h1>
            
            <p style={{ 
              fontSize: '18px', 
              marginBottom: '50px',
              color: '#CCCCCC',
              lineHeight: '1.5'
            }}>
              {t.actionsCompletedMessage.replace('{count}', props.MAX_ACTIONS_PER_GAME)}
            </p>
            
            <div style={{ 
              width: '120px',
              height: '120px',
              margin: '0 auto 40px',
              animation: 'float 2s infinite ease-in-out'
            }}>
              <img 
                src={pointingGlove} 
                alt="Guanto che punta" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
              />
            </div>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#3498db'
            }}>
              {t.tapToContinueMessage.replace(
                '{action}', 
                hasPlayedFreeGame && !hasPaid 
                  ? t.unlockMoreGamesMessage 
                  : t.returnToRoomsMessage
              )}
            </p>
          </div>
          
          {/* Add CSS animation for the floating effect */}
          <style jsx="true">{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
          `}</style>
        </div>
      )}
      
      {/* Paywall Screen */}
      {gameState === 'paywall' && (
        <div className="screen paywall-screen" style={{ 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          padding: '20px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            alignItems: 'center',
            padding: '15px 0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={goBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ←
              </button>
            </div>
            
            <h1 style={{ 
              margin: 0, 
              textAlign: 'center',
              fontWeight: 'normal',
              fontSize: '28px',
              letterSpacing: '1px'
            }}>
              {t.unlockGameTitle}
            </h1>
            
            <div></div> {/* Colonna vuota a destra per equilibrio */}
          </div>
          
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px'
          }}>
            <div style={{
              backgroundColor: '#1A1A1A',
              borderRadius: '15px',
              padding: '25px 20px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                {t.freeGameEndedTitle}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#CCCCCC',
                lineHeight: '1.5',
                marginBottom: '20px'
              }}>
                {t.freeGameEndedMessage}
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                marginTop: '25px'
              }}>
                {t.paymentOptions.map(option => (
                  <div 
                    key={option.id}
                    onClick={() => props.selectPaymentOption(option)}
                    style={{
                      backgroundColor: selectedPaymentOption?.id === option.id ? '#3498db20' : '#2A2A2A',
                      border: selectedPaymentOption?.id === option.id ? '2px solid #3498db' : '2px solid transparent',
                      borderRadius: '10px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {option.name}
                      </h3>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#3498db'
                      }}>
                        €{option.price}
                      </div>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#AAAAAA',
                      textAlign: 'left'
                    }}>
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ 
            padding: '0',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            zIndex: 10
          }}>
            <button 
              onClick={props.processPayment}
              disabled={!selectedPaymentOption || isProcessingPayment}
              style={{
                width: '100%',
                backgroundColor: selectedPaymentOption ? '#3498db' : '#555555',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: selectedPaymentOption ? 'pointer' : 'not-allowed',
                opacity: isProcessingPayment ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {isProcessingPayment ? t.processingPayment : t.purchaseButton}
            </button>
          </div>
        </div>
      )}
      
      {/* Interfaccia per i debiti */}
      {gameState === 'playing' && debtList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          right: '20px',
          zIndex: 100
        }}>
          <button
            onClick={() => alert(`${t.debts.activeDebtsTitle}\n${debtList.filter(d => d.status === 'active').map(d => `- ${d.player}: ${d.description}`).join('\n')}`)}
            style={{
              backgroundColor: '#EAB308',
              color: 'black',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
          >
            {t.debts.buttonLabel}
          </button>
        </div>
      )}
      
      {/* Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#FFFFFF'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#FFFFFF',
              animation: 'spin 1s ease-in-out infinite',
              marginBottom: '15px'
            }}></div>
            <p style={{
              fontSize: '16px'
            }}>{t.loadingMessage}</p>
            
            <style jsx="true">{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;