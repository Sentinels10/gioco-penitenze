// translations.js - File che contiene tutte le traduzioni per l'app

const translations = {
    it: {
      // Testi generali dell'app
      appName: "FRIENZ",
      appDescription: "Questo club è gestito da un AI. Lei formulerà domande sempre nuove e inaspettate.",
      
      // Pulsanti e azioni comuni
      startButton: "INIZIA",
      backButton: "Indietro",
      nextButton: "NEXT",
      enterButton: "ENTRA",
      resetButton: "Reset (Solo Test)",
      startGameButton: "START",
      
      // Titoli delle schermate
      playersScreenTitle: "PLAYERS",
      roomsScreenTitle: "ROOMS",
      unlockGameTitle: "SBLOCCA IL GIOCO",
      
      // Placeholder e label
      playerInputPlaceholder: "Enter player name",
      addPlayerLabel: "Add Player",
      
      // Messaggi
      notEnoughPlayersError: "Inserisci almeno 2 giocatori per iniziare!",
      gameOverMessage: "PARTITA FINITA!",
      actionsCompletedMessage: "Avete completato {count} azioni!",
      tapToContinueMessage: "Tocca per {action}",
      returnToRoomsMessage: "tornare alla selezione delle stanze",
      unlockMoreGamesMessage: "sbloccare altre partite",
      
      // Schermata paywall
      freeGameEndedTitle: "Partita gratuita terminata!",
      freeGameEndedMessage: "Hai utilizzato la tua partita gratuita. Sblocca l'app per giocare illimitatamente con tutti i tuoi amici!",
      purchaseButton: "ACQUISTA",
      processingPayment: "ELABORAZIONE...",
      
      // Opzioni di pagamento
      paymentOptions: [
        { id: 'premium', name: 'Premium', price: '4.99', description: 'Sblocca tutte le stanze per sempre' },
        { id: 'prive', name: 'Privè', price: '9.99', description: "L'AI ricorderà te e i tuoi amici, i vostri gusti, le vostre paure e vi farà domande sempre più personali" }
      ],
      
      // Loading
      loadingMessage: "Caricamento in corso...",
      
      // Stanze
      rooms: [
        { 
          id: 'party', 
          name: 'Party', 
          description: 'Domande divertenti per animare la festa',
          color: '#2563EB'
        },
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
          id: 'coppie', 
          name: 'Coppie', 
          description: 'Domande e sfide romantiche per innamorati',
          color: '#EAB308'
        },
        { 
          id: 'neonRoulette', 
          name: 'Neon Roulette', 
          description: 'Mix casuale di tutte le modalità',
          color: '#D946EF'
        }
      ],
      
      // Giochi speciali
      specialGames: {
        bouncer: "{player} è il buttafuori e sta decidendo...",
        pointFinger: "{player} sta scegliendo una caratteristica e tutti voteranno...",
        infamata: "{player} sta decidendo a chi assegnare la domanda o sfida...",
        truthOrDare: {
          choosing: "{player} deve scegliere tra Verità, Obbligo o Debito!",
          truth: "{player} ha scelto Verità!",
          dare: "{player} ha scelto Obbligo!",
          debt: "{player} ha scelto Debito!"
        },
        ilPezzoGrosso: "{player} deve fare un'affermazione e tutti voteranno se è vero o falso...",
        cringeOrClassy: "{player} deve confessare una sua passione segreta"
      },
      
      // Terminologia giochi speciali
      specialGamesTitles: {
        pointFinger: "PUNTARE IL DITO",
        bouncer: "BUTTAFUORI",
        infamata: "INFAMATA",
        truthOrDare: "OBBLIGO VERITÀ O DEBITO",
        ilPezzoGrosso: "IL PEZZO GROSSO",
        cringeOrClassy: "CRINGE OR CLASSY"
      },
      
      // Opzioni gioco Verità o Obbligo
      truthDareOptions: {
        selectOption: "Seleziona un'opzione:",
        truth: "VERITÀ",
        dare: "OBBLIGO",
        debt: "DEBITO",
        debtExplanation: "Hai scelto di prendere un debito! Il gruppo deciderà quando riscattarlo.",
        chooseOption: "SCEGLI UN'OPZIONE"
      },
      
      // Fallback
      noActionAvailable: "Nessuna azione disponibile",
      
      // Alternanze penalità
      penaltyAlternatives: {
        questions: [
          "? Se non rispondi {count} penalità",
          "? Se eviti la domanda {count} penalità",
          "? Il silenzio costa {count} penalità"
        ],
        statements: [
          "se ti rifiuti {count} penalità",
          "se non lo fai {count} penalità",
          "altrimenti sono {count} penalità",
          "in caso contrario {count} penalità",
          "o saranno {count} penalità",
          "o riceverai {count} penalità",
          "se non hai coraggio {count} penalità",
          "o dovrai fare {count} penalità",
          "rifiutare costa {count} penalità"
        ]
      },
      
      // Debiti
      debts: {
        buttonLabel: "💸",
        activeDebtsTitle: "Debiti attivi:",
        debtDescription: "Debito assegnato durante il gioco Obbligo Verità Debito"
      },
      
      // Messaggi di log
      logMessages: {
        neonRouletteStats: "Neon Roulette stats:",
        redRoomStats: "Red Room: {count} azioni",
        darkRoomStats: "Dark Room: {count} azioni",
        coppieStats: "Coppie: {count} azioni",
        partyStats: "Party: {count} azioni",
        totalStats: "Totale: {count} azioni",
        noActionsInPool: "Nessuna azione nel pool, uso il fallback",
        missingSpecialGame: "Manca la sezione specialGames.{type} nel backupActions.json!"
      },
      
      // Testi dinamici per ObligoVeritàDebito
      truthDareIntro: "OBBLIGO VERITÀ O DEBITO: È il turno di {player}. Se scegli Debito, eviti la penalità ma ti viene assegnato un debito che potrà essere riscattato in qualsiasi momento da chi dirige il gioco (es. \"Vai a prendermi da bere\" o \"Posta una storia imbarazzante\"). Scegli una delle opzioni!",
      truthDareNextPlayerIntro: "OBBLIGO VERITÀ O DEBITO: È il turno di {player}. Scegli una delle opzioni!"
    },
    
    en: {
      // General app texts
      appName: "FRIENZ",
      appDescription: "This club is run by an AI. It will formulate new and unexpected questions.",
      
      // Buttons and common actions
      startButton: "START",
      backButton: "Back",
      nextButton: "NEXT",
      enterButton: "ENTER",
      resetButton: "Reset (Test Only)",
      startGameButton: "START",
      
      // Screen titles
      playersScreenTitle: "PLAYERS",
      roomsScreenTitle: "ROOMS",
      unlockGameTitle: "UNLOCK THE GAME",
      
      // Placeholders and labels
      playerInputPlaceholder: "Enter player name",
      addPlayerLabel: "Add Player",
      
      // Messages
      notEnoughPlayersError: "Enter at least 2 players to start!",
      gameOverMessage: "GAME OVER!",
      actionsCompletedMessage: "You completed {count} actions!",
      tapToContinueMessage: "Tap to {action}",
      returnToRoomsMessage: "return to room selection",
      unlockMoreGamesMessage: "unlock more games",
      
      // Paywall screen
      freeGameEndedTitle: "Free game ended!",
      freeGameEndedMessage: "You've used your free game. Unlock the app to play unlimited games with all your friends!",
      purchaseButton: "PURCHASE",
      processingPayment: "PROCESSING...",
      
      // Payment options
      paymentOptions: [
        { id: 'premium', name: 'Premium', price: '4.99', description: 'Unlock all rooms forever' },
        { id: 'prive', name: 'VIP', price: '9.99', description: "The AI will remember you and your friends, your tastes, your fears, and will ask increasingly personal questions" }
      ],
      
      // Loading
      loadingMessage: "Loading...",
      
      // Rooms
      rooms: [
        { 
          id: 'party', 
          name: 'Party', 
          description: 'Fun questions to liven up the party',
          color: '#2563EB'
        },
        { 
          id: 'redRoom', 
          name: 'Red Room', 
          description: 'Spicy and provocative questions',
          color: '#DC2626'
        },
        { 
          id: 'darkRoom', 
          name: 'Dark Room', 
          description: "Don't enter if you have something to hide",
          color: '#1F2937'
        },
        { 
          id: 'coppie', 
          name: 'Couples', 
          description: 'Romantic questions and challenges for lovers',
          color: '#EAB308'
        },
        { 
          id: 'neonRoulette', 
          name: 'Neon Roulette', 
          description: 'Random mix of all modes',
          color: '#D946EF'
        }
      ],
      
      // Special games
      specialGames: {
        bouncer: "{player} is the bouncer and is deciding...",
        pointFinger: "{player} is choosing a characteristic and everyone will vote...",
        infamata: "{player} is deciding who to assign the question or challenge to...",
        truthOrDare: {
          choosing: "{player} must choose between Truth, Dare, or Debt!",
          truth: "{player} chose Truth!",
          dare: "{player} chose Dare!",
          debt: "{player} chose Debt!"
        },
        ilPezzoGrosso: "{player} must make a statement and everyone will vote if it's true or false...",
        cringeOrClassy: "{player} must confess a secret passion"
      },
      
      // Special games terminology
      specialGamesTitles: {
        pointFinger: "POINT THE FINGER",
        bouncer: "BOUNCER",
        infamata: "SNITCH",
        truthOrDare: "TRUTH, DARE OR DEBT",
        ilPezzoGrosso: "THE BIG SHOT",
        cringeOrClassy: "CRINGE OR CLASSY"
      },
      
      // Truth or Dare game options
      truthDareOptions: {
        selectOption: "Select an option:",
        truth: "TRUTH",
        dare: "DARE",
        debt: "DEBT",
        debtExplanation: "You chose to take a debt! The group will decide when to redeem it.",
        chooseOption: "CHOOSE AN OPTION"
      },
      
      // Fallback
      noActionAvailable: "No action available",
      
      // Penalty alternatives
      penaltyAlternatives: {
        questions: [
          "? If you don't answer, {count} penalties",
          "? If you avoid the question, {count} penalties",
          "? Silence costs {count} penalties"
        ],
        statements: [
          "if you refuse, {count} penalties",
          "if you don't do it, {count} penalties",
          "otherwise it's {count} penalties",
          "or else {count} penalties",
          "or you'll get {count} penalties",
          "if you don't have the courage, {count} penalties",
          "or you'll have to do {count} penalties",
          "refusing costs {count} penalties"
        ]
      },
      
      // Debts
      debts: {
        buttonLabel: "💸",
        activeDebtsTitle: "Active debts:",
        debtDescription: "Debt assigned during the Truth, Dare or Debt game"
      },
      
      // Log messages
      logMessages: {
        neonRouletteStats: "Neon Roulette stats:",
        redRoomStats: "Red Room: {count} actions",
        darkRoomStats: "Dark Room: {count} actions",
        coppieStats: "Couples: {count} actions",
        partyStats: "Party: {count} actions",
        totalStats: "Total: {count} actions",
        noActionsInPool: "No actions in the pool, using fallback",
        missingSpecialGame: "Missing specialGames.{type} section in backupActions.json!"
      },
      
      // Dynamic texts for Truth/Dare/Debt
      truthDareIntro: "TRUTH, DARE OR DEBT: It's {player}'s turn. If you choose Debt, you avoid the penalty but you're assigned a debt that can be redeemed at any time by whoever is running the game (e.g., \"Get me a drink\" or \"Post an embarrassing story\"). Choose one of the options!",
      truthDareNextPlayerIntro: "TRUTH, DARE OR DEBT: It's {player}'s turn. Choose one of the options!"
    }
  };
  
  export default translations;