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
    doneButton: "FATTO", // NUOVO: Pulsante per completare l'azione
    payButton: "PAGA", // NUOVO: Pulsante per pagare la penalità
    enterButton: "ENTRA",
    resetButton: "Reset (Solo Test)",
    startGameButton: "START",
    
    // Titoli delle schermate
    playersScreenTitle: "PLAYERS",
    roomsScreenTitle: "ROOMS",
    unlockGameTitle: "SBLOCCA IL GIOCO",
    leaderboardTitle: "CLASSIFICA", // NUOVO: Titolo per la schermata di classifica
    
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
    
    // NUOVO: Schermata di classifica (leaderboard)
    leaderboardSubtitle: "Penalità accumulate",
    penaltiesLabel: "penalità",
    continueButton: "CONTINUA",
    
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
      cringeOrClassy: "{player} deve confessare una sua passione segreta",
      wouldYouRather: "{player} ha posto la domanda: Preferiresti? Tutti devono votare! La minoranza riceve penalità",
      chatDetective: "{player} è il detective di WhatsApp!",
      tuttoHaUnPrezzo: "{player} ha avviato il gioco TUTTO HA UN PREZZO!",
      tuttiQuelliChe: "{player} ha attivato il gioco TUTTI QUELLI CHE!",
      penitenzeGruppo: "{player} ha attivato PENITENZE DI GRUPPO!",
      penitenzaRandom: "{player} ha attivato le PENITENZE RANDOM!",
      nonHoMai: "{player} ha iniziato il gioco NON HO MAI! Dopo di lui tocca al giocatore alla sua destra, finché non lo fanno tutti"
    },
    
    // Terminologia giochi speciali
    specialGamesTitles: {
      pointFinger: "PUNTARE IL DITO",
      bouncer: "BUTTAFUORI",
      infamata: "INFAMATA",
      truthOrDare: "OBBLIGO VERITÀ O DEBITO",
      ilPezzoGrosso: "IL PEZZO GROSSO",
      cringeOrClassy: "CRINGE OR CLASSY",
      wouldYouRather: "PREFERIRESTI",
      chatDetective: "CHAT DETECTIVE",
      tuttoHaUnPrezzo: "TUTTO HA UN PREZZO",
      tuttiQuelliChe: "TUTTI QUELLI CHE",
      penitenzeGruppo: "PENITENZE DI GRUPPO",
      penitenzaRandom: "PENITENZE RANDOM",
      nonHoMai: "NON HO MAI"
    },
    
    // Spiegazione del gioco Preferiresti
    wouldYouRatherExplanation: "Tutti votano: alza la mano per la prima opzione, tienila abbassata per la seconda. Chi è in minoranza fa penalità!",
    
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
    doneButton: "DONE", // NUOVO: Button to complete the action
    payButton: "PAY", // NUOVO: Button to pay the penalty
    enterButton: "ENTER",
    resetButton: "Reset (Test Only)",
    startGameButton: "START",
    
    // Screen titles
    playersScreenTitle: "PLAYERS",
    roomsScreenTitle: "ROOMS",
    unlockGameTitle: "UNLOCK THE GAME",
    leaderboardTitle: "LEADERBOARD", // NUOVO: Title for the leaderboard screen
    
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
    
    // NUOVO: Leaderboard screen
    leaderboardSubtitle: "Penalties accumulated",
    penaltiesLabel: "penalties",
    continueButton: "CONTINUE",
    
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
      cringeOrClassy: "{player} must confess a secret passion",
      wouldYouRather: "{player} asked the question: Would You Rather? Everyone must vote! The minority gets penalties",
      chatDetective: "{player} is the WhatsApp detective!",
      tuttoHaUnPrezzo: "{player} has started the EVERYTHING HAS A PRICE game!",
      tuttiQuelliChe: "{player} has activated the ALL THOSE WHO game!",
      penitenzeGruppo: "{player} has activated GROUP PENALTIES!",
      penitenzaRandom: "{player} has activated RANDOM PENALTIES!",
      nonHoMai: "{player} has started the I HAVE NEVER game! After them, it's the player on their right's turn, until everyone has played."
    },
    
    // Special games terminology
    specialGamesTitles: {
      pointFinger: "POINT THE FINGER",
      bouncer: "BOUNCER",
      infamata: "SNITCH",
      truthOrDare: "TRUTH, DARE OR DEBT",
      ilPezzoGrosso: "THE BIG SHOT",
      cringeOrClassy: "CRINGE OR CLASSY",
      wouldYouRather: "WOULD YOU RATHER",
      chatDetective: "CHAT DETECTIVE",
      tuttoHaUnPrezzo: "EVERYTHING HAS A PRICE",
      tuttiQuelliChe: "ALL THOSE WHO",
      penitenzeGruppo: "GROUP PENALTIES",
      penitenzaRandom: "RANDOM PENALTIES",
      nonHoMai: "I HAVE NEVER"
    },
    
    // Would You Rather game explanation
    wouldYouRatherExplanation: "Everyone votes: raise your hand for the first option, keep it down for the second. Those in the minority get penalties!",
    
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
  },
  
  fr: {
    // Textes généraux de l'application
    appName: "FRIENZ",
    appDescription: "Ce club est géré par une IA. Elle formulera des questions nouvelles et inattendues.",
    
    // Boutons et actions communes
    startButton: "COMMENCER",
    backButton: "Retour",
    nextButton: "SUIVANT",
    doneButton: "TERMINÉ",
    payButton: "PAYER",
    enterButton: "ENTRER",
    resetButton: "Réinitialiser (Test Uniquement)",
    startGameButton: "DÉMARRER",
    
    // Titres des écrans
    playersScreenTitle: "JOUEURS",
    roomsScreenTitle: "SALLES",
    unlockGameTitle: "DÉBLOQUER LE JEU",
    leaderboardTitle: "CLASSEMENT",
    
    // Placeholders et labels
    playerInputPlaceholder: "Nom du joueur",
    addPlayerLabel: "Ajouter Joueur",
    
    // Messages
    notEnoughPlayersError: "Entrez au moins 2 joueurs pour commencer!",
    gameOverMessage: "JEU TERMINÉ!",
    actionsCompletedMessage: "Vous avez complété {count} actions!",
    tapToContinueMessage: "Touchez pour {action}",
    returnToRoomsMessage: "retourner à la sélection des salles",
    unlockMoreGamesMessage: "débloquer plus de jeux",
    
    // Écran paywall
    freeGameEndedTitle: "Partie gratuite terminée!",
    freeGameEndedMessage: "Vous avez utilisé votre partie gratuite. Débloquez l'application pour jouer de façon illimitée avec tous vos amis!",
    purchaseButton: "ACHETER",
    processingPayment: "TRAITEMENT...",
    
    // Écran de classement
    leaderboardSubtitle: "Pénalités accumulées",
    penaltiesLabel: "pénalités",
    continueButton: "CONTINUER",
    
    // Options de paiement
    paymentOptions: [
      { id: 'premium', name: 'Premium', price: '4.99', description: 'Débloque toutes les salles pour toujours' },
      { id: 'prive', name: 'VIP', price: '9.99', description: "L'IA se souviendra de vous et de vos amis, de vos goûts, de vos peurs, et posera des questions de plus en plus personnelles" }
    ],
    
    // Chargement
    loadingMessage: "Chargement en cours...",
    
    // Salles
    rooms: [
      { 
        id: 'party', 
        name: 'Party', 
        description: 'Questions amusantes pour animer la fête',
        color: '#2563EB'
      },
      { 
        id: 'redRoom', 
        name: 'Red Room', 
        description: 'Questions épicées et provocantes',
        color: '#DC2626'
      },
      { 
        id: 'darkRoom', 
        name: 'Dark Room', 
        description: "N'entrez pas si vous avez quelque chose à cacher",
        color: '#1F2937'
      },
      { 
        id: 'coppie', 
        name: 'Couples', 
        description: 'Questions et défis romantiques pour les amoureux',
        color: '#EAB308'
      },
      { 
        id: 'neonRoulette', 
        name: 'Neon Roulette', 
        description: 'Mélange aléatoire de tous les modes',
        color: '#D946EF'
      }
    ],
    
    // Jeux spéciaux
    specialGames: {
      bouncer: "{player} est le videur et est en train de décider...",
      pointFinger: "{player} choisit une caractéristique et tout le monde va voter...",
      infamata: "{player} décide à qui attribuer la question ou le défi...",
      truthOrDare: {
        choosing: "{player} doit choisir entre Vérité, Action ou Dette!",
        truth: "{player} a choisi Vérité!",
        dare: "{player} a choisi Action!",
        debt: "{player} a choisi Dette!"
      },
      ilPezzoGrosso: "{player} doit faire une déclaration et tout le monde va voter si c'est vrai ou faux...",
      cringeOrClassy: "{player} doit confesser une passion secrète",
      wouldYouRather: "{player} a posé la question: Préférerais-tu? Tout le monde doit voter! La minorité reçoit des pénalités",
      chatDetective: "{player} est le détective WhatsApp !",
      tuttoHaUnPrezzo: "{player} a lancé le jeu TOUT A UN PRIX !",
      tuttiQuelliChe: "{player} a activé le jeu TOUS CEUX QUI!",
      penitenzeGruppo: "{player} a activé PÉNALITÉS DE GROUPE!",
      penitenzaRandom: "{player} a activé les PÉNALITÉS ALÉATOIRES!",
      nonHoMai: "{player} a commencé le jeu JE N'AI JAMAIS! Après lui, c'est au tour du joueur à sa droite, jusqu'à ce que tout le monde ait joué."
    },
    
    // Terminologie des jeux spéciaux
    specialGamesTitles: {
      pointFinger: "POINTER DU DOIGT",
      bouncer: "VIDEUR",
      infamata: "BALANCE",
      truthOrDare: "VÉRITÉ, ACTION OU DETTE",
      ilPezzoGrosso: "LE GROS BONNET",
      cringeOrClassy: "GÊNANT OU CLASSE",
      wouldYouRather: "PRÉFÉRERAIS-TU",
      chatDetective: "DÉTECTIVE DE CHAT",
      tuttoHaUnPrezzo: "TOUT A UN PRIX",
      tuttiQuelliChe: "TOUS CEUX QUI",
      penitenzeGruppo: "PÉNALITÉS DE GROUPE",
      penitenzaRandom: "PÉNALITÉS ALÉATOIRES",
      nonHoMai: "JE N'AI JAMAIS"
    },
    
    // Explication du jeu Préférerais-tu
    wouldYouRatherExplanation: "Tout le monde vote: levez la main pour la première option, gardez-la baissée pour la seconde. Ceux en minorité reçoivent des pénalités!",
    
    // Options du jeu Vérité ou Action
    truthDareOptions: {
      selectOption: "Sélectionnez une option:",
      truth: "VÉRITÉ",
      dare: "ACTION",
      debt: "DETTE",
      debtExplanation: "Vous avez choisi de prendre une dette! Le groupe décidera quand la racheter.",
      chooseOption: "CHOISISSEZ UNE OPTION"
    },
    
    // Fallback
    noActionAvailable: "Aucune action disponible",
    
    // Alternatives de pénalité
    penaltyAlternatives: {
      questions: [
        "? Si vous ne répondez pas, {count} pénalités",
        "? Si vous évitez la question, {count} pénalités",
        "? Le silence coûte {count} pénalités"
      ],
      statements: [
        "si vous refusez, {count} pénalités",
        "si vous ne le faites pas, {count} pénalités",
        "sinon c'est {count} pénalités",
        "ou alors {count} pénalités",
        "ou vous recevrez {count} pénalités",
        "si vous n'avez pas le courage, {count} pénalités",
        "ou vous devrez faire {count} pénalités",
        "refuser coûte {count} pénalités"
      ]
    },
    
    // Dettes
    debts: {
      buttonLabel: "💸",
      activeDebtsTitle: "Dettes actives:",
      debtDescription: "Dette assignée pendant le jeu Vérité, Action ou Dette"
    },
    
    // Messages de log
    logMessages: {
      neonRouletteStats: "Statistiques Neon Roulette:",
      redRoomStats: "Red Room: {count} actions",
      darkRoomStats: "Dark Room: {count} actions",
      coppieStats: "Couples: {count} actions",
      partyStats: "Party: {count} actions",
      totalStats: "Total: {count} actions",
      noActionsInPool: "Pas d'actions dans le pool, utilisation du fallback",
      missingSpecialGame: "Section specialGames.{type} manquante dans backupActions.json!"
    },
    
    // Textes dynamiques pour Vérité/Action/Dette
    truthDareIntro: "VÉRITÉ, ACTION OU DETTE: C'est le tour de {player}. Si vous choisissez Dette, vous évitez la pénalité mais une dette vous est assignée qui peut être rachetée à tout moment par celui qui dirige le jeu (ex., \"Va me chercher à boire\" ou \"Poste une histoire embarrassante\"). Choisissez une des options!",
    truthDareNextPlayerIntro: "VÉRITÉ, ACTION OU DETTE: C'est le tour de {player}. Choisissez une des options!"
  },
  
  de: {
    // Allgemeine App-Texte
    appName: "FRIENZ",
    appDescription: "Dieser Club wird von einer KI geleitet. Sie wird neue und unerwartete Fragen formulieren.",
    
    // Buttons und häufige Aktionen
    startButton: "STARTEN",
    backButton: "Zurück",
    nextButton: "WEITER",
    doneButton: "ERLEDIGT",
    payButton: "ZAHLEN",
    enterButton: "EINTRETEN",
    resetButton: "Zurücksetzen (Nur Test)",
    startGameButton: "START",
    
    // Bildschirmtitel
    playersScreenTitle: "SPIELER",
    roomsScreenTitle: "RÄUME",
    unlockGameTitle: "SPIEL FREISCHALTEN",
    leaderboardTitle: "BESTENLISTE",
    
    // Platzhalter und Labels
    playerInputPlaceholder: "Spielername eingeben",
    addPlayerLabel: "Spieler hinzufügen",
    
    // Nachrichten
    notEnoughPlayersError: "Geben Sie mindestens 2 Spieler ein, um zu beginnen!",
    gameOverMessage: "SPIEL BEENDET!",
    actionsCompletedMessage: "Sie haben {count} Aktionen abgeschlossen!",
    tapToContinueMessage: "Tippen Sie, um {action}",
    returnToRoomsMessage: "zur Raumauswahl zurückzukehren",
    unlockMoreGamesMessage: "mehr Spiele freizuschalten",
    
    // Paywall-Bildschirm
    freeGameEndedTitle: "Kostenloses Spiel beendet!",
    freeGameEndedMessage: "Sie haben Ihr kostenloses Spiel verwendet. Schalten Sie die App frei, um unbegrenzt mit all Ihren Freunden zu spielen!",
    purchaseButton: "KAUFEN",
    processingPayment: "VERARBEITUNG...",
    
    // Bestenliste-Bildschirm
    leaderboardSubtitle: "Angesammelte Strafen",
    penaltiesLabel: "Strafen",
    continueButton: "FORTFAHREN",
    
    // Zahlungsoptionen
    paymentOptions: [
      { id: 'premium', name: 'Premium', price: '4.99', description: 'Schaltet alle Räume für immer frei' },
      { id: 'prive', name: 'VIP', price: '9.99', description: "Die KI wird sich an Sie und Ihre Freunde, Ihre Vorlieben, Ihre Ängste erinnern und immer persönlichere Fragen stellen" }
    ],
    
    // Laden
    loadingMessage: "Wird geladen...",
    
    // Räume
    rooms: [
      { 
        id: 'party', 
        name: 'Party', 
        description: 'Lustige Fragen, um die Party zu beleben',
        color: '#2563EB'
      },
      { 
        id: 'redRoom', 
        name: 'Red Room', 
        description: 'Pikante und provokante Fragen',
        color: '#DC2626'
      },
      { 
        id: 'darkRoom', 
        name: 'Dark Room', 
        description: "Betreten Sie nicht, wenn Sie etwas zu verbergen haben",
        color: '#1F2937'
      },
      { 
        id: 'coppie', 
        name: 'Paare', 
        description: 'Romantische Fragen und Herausforderungen für Verliebte',
        color: '#EAB308'
      },
      { 
        id: 'neonRoulette', 
        name: 'Neon Roulette', 
        description: 'Zufällige Mischung aller Modi',
        color: '#D946EF'
      }
    ],
    
    // Spezielle Spiele
    specialGames: {
      bouncer: "{player} ist der Türsteher und entscheidet...",
      pointFinger: "{player} wählt ein Merkmal aus und alle werden abstimmen...",
      infamata: "{player} entscheidet, wem die Frage oder Herausforderung zugewiesen wird...",
      truthOrDare: {
        choosing: "{player} muss zwischen Wahrheit, Pflicht oder Schuld wählen!",
        truth: "{player} hat Wahrheit gewählt!",
        dare: "{player} hat Pflicht gewählt!",
        debt: "{player} hat Schuld gewählt!"
      },
      ilPezzoGrosso: "{player} muss eine Aussage machen und alle werden abstimmen, ob sie wahr oder falsch ist...",
      cringeOrClassy: "{player} muss eine geheime Leidenschaft gestehen",
      wouldYouRather: "{player} stellte die Frage: Was hättest du lieber? Alle müssen abstimmen! Die Minderheit erhält Strafen",
      chatDetective: "{player} ist der WhatsApp-Detektiv!",
      tuttoHaUnPrezzo: "{player} hat das Spiel ALLES HAT SEINEN PREIS gestartet!",
      tuttiQuelliChe: "{player} hat das Spiel ALLE, DIE aktiviert!",
      penitenzeGruppo: "{player} hat GRUPPENSTRAFEN aktiviert!",
      penitenzaRandom: "{player} hat ZUFÄLLIGE STRAFEN aktiviert!",
      nonHoMai: "{player} hat das Spiel ICH HABE NIE gestartet! Nach ihm ist der Spieler zu seiner Rechten an der Reihe, bis alle dran waren."
    },
    
    // Spezielle Spiele Terminologie
    specialGamesTitles: {
      pointFinger: "MIT DEM FINGER ZEIGEN",
      bouncer: "TÜRSTEHER",
      infamata: "PETZE",
      truthOrDare: "WAHRHEIT, PFLICHT ODER SCHULD",
      ilPezzoGrosso: "DER GROSSE BOSS",
      cringeOrClassy: "PEINLICH ODER STILVOLL",
      wouldYouRather: "WAS HÄTTEST DU LIEBER",
      chatDetective: "CHAT-DETEKTIV",
      tuttoHaUnPrezzo: "ALLES HAT SEINEN PREIS",
      tuttiQuelliChe: "ALLE, DIE",
      penitenzeGruppo: "GRUPPENSTRAFEN",
      penitenzaRandom: "ZUFÄLLIGE STRAFEN",
      nonHoMai: "ICH HABE NIE"
    },
    
    // Erklärung des Spiels "Was hättest du lieber"
    wouldYouRatherExplanation: "Alle stimmen ab: Hand heben für die erste Option, unten lassen für die zweite. Wer in der Minderheit ist, erhält Strafen!",
    
    // Wahrheit oder Pflicht Spieloptionen
    truthDareOptions: {
      selectOption: "Wählen Sie eine Option:",
      truth: "WAHRHEIT",
      dare: "PFLICHT",
      debt: "SCHULD",
      debtExplanation: "Sie haben sich entschieden, eine Schuld zu übernehmen! Die Gruppe wird entscheiden, wann sie eingelöst wird.",
      chooseOption: "WÄHLEN SIE EINE OPTION"
    },
    
    // Fallback
    noActionAvailable: "Keine Aktion verfügbar",
    
    // Strafenalternativen
    penaltyAlternatives: {
      questions: [
        "? Wenn Sie nicht antworten, {count} Strafen",
        "? Wenn Sie der Frage ausweichen, {count} Strafen",
        "? Schweigen kostet {count} Strafen"
      ],
      statements: [
        "wenn Sie sich weigern, {count} Strafen",
        "wenn Sie es nicht tun, {count} Strafen",
        "ansonsten sind es {count} Strafen",
        "oder es sind {count} Strafen",
        "oder Sie bekommen {count} Strafen",
        "wenn Sie nicht den Mut haben, {count} Strafen",
        "oder Sie müssen {count} Strafen machen",
        "Weigerung kostet {count} Strafen"
      ]
    },
    
    // Schulden
    debts: {
      buttonLabel: "💸",
      activeDebtsTitle: "Aktive Schulden:",
      debtDescription: "Schuld, die während des Wahrheit, Pflicht oder Schuld-Spiels zugewiesen wurde"
    },
    
    // Log-Nachrichten
    logMessages: {
      neonRouletteStats: "Neon Roulette Statistiken:",
      redRoomStats: "Red Room: {count} Aktionen",
      darkRoomStats: "Dark Room: {count} Aktionen",
      coppieStats: "Paare: {count} Aktionen",
      partyStats: "Party: {count} Aktionen",
      totalStats: "Gesamt: {count} Aktionen",
      noActionsInPool: "Keine Aktionen im Pool, verwende Fallback",
      missingSpecialGame: "Fehlender specialGames.{type} Abschnitt in backupActions.json!"
    },
    
    // Dynamische Texte für Wahrheit/Pflicht/Schuld
    truthDareIntro: "WAHRHEIT, PFLICHT ODER SCHULD: {player} ist an der Reihe. Wenn Sie Schuld wählen, vermeiden Sie die Strafe, aber Ihnen wird eine Schuld zugewiesen, die jederzeit von demjenigen, der das Spiel leitet, eingelöst werden kann (z.B. \"Hol mir ein Getränk\" oder \"Poste eine peinliche Geschichte\"). Wählen Sie eine der Optionen!",
    truthDareNextPlayerIntro: "WAHRHEIT, PFLICHT ODER SCHULD: {player} ist an der Reihe. Wählen Sie eine der Optionen!"
  }
};

export default translations;