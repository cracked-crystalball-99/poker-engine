// Texas Hold'em Poker AI Engine - Inspired by Stockfish Lite Architecture
class PokerEngine {
  constructor() {
    // Core game state
    this.deck = [];
    this.communityCards = [];
    this.players = [];
    this.currentPlayerIndex = 0;
    this.dealerPosition = 0;
    this.blinds = { small: 5, big: 10 };
    this.pot = 0;
    this.sidePots = [];
    this.gamePhase = 'preflop'; // preflop, flop, turn, river, showdown
    this.bettingRound = 0;
    this.gameStarted = false;
    this.handNumber = 0;
    
    // AI and difficulty settings
    this.aiEnabled = true;
    this.aiDifficulty = 3; // 1-5 difficulty levels
    this.aiThinkingTime = 1000; // ms delay for AI decisions
    
    // UI state
    this.selectedCards = [];
    this.animationsEnabled = true;
    this.soundEnabled = false;
    
    // Game statistics
    this.handsPlayed = 0;
    this.playerStats = {
      handsWon: 0,
      totalWinnings: 0,
      biggestPot: 0
    };
    
    this.initializeGame();
  }
  
  initializeGame() {
    console.log('🎰 Initializing Texas Hold\'em Poker Engine...');
    this.createDeck();
    this.setupPlayers();
    this.bindEvents();
    this.updateUI();
    this.updateGameStatus('🎰 Ready to play Texas Hold\'em! Click "New Hand" to start.');
  }
  
  createDeck() {
    // Create standard 52-card deck
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    this.deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push({
          rank: rank,
          suit: suit,
          value: this.getCardValue(rank),
          id: `${rank}_${suit}`,
          unicode: this.getCardUnicode(rank, suit)
        });
      }
    }
    console.log('🃏 Deck created with 52 cards');
  }
  
  getCardValue(rank) {
    // Numeric values for comparison (Ace high in Texas Hold'em)
    const values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return values[rank];
  }
  
  getCardUnicode(rank, suit) {
    // Unicode playing card characters for display
    const suitSymbols = {
      'hearts': '♥',
      'diamonds': '♦', 
      'clubs': '♣',
      'spades': '♠'
    };
    return `${rank}${suitSymbols[suit]}`;
  }
  
  setupPlayers() {
    // Initialize players (1 human + up to 5 AI)
    this.players = [
      {
        id: 0,
        name: 'You',
        chips: 1000,
        cards: [],
        currentBet: 0,
        totalInvested: 0,
        isAI: false,
        isActive: true,
        isAllIn: false,
        isFolded: false,
        position: 'player'
      },
      {
        id: 1, 
        name: 'AI Bot 1',
        chips: 1000,
        cards: [],
        currentBet: 0,
        totalInvested: 0,
        isAI: true,
        isActive: true,
        isAllIn: false,
        isFolded: false,
        position: 'ai1',
        personality: 'tight' // tight, aggressive, loose, unpredictable
      },
      {
        id: 2,
        name: 'AI Bot 2', 
        chips: 1000,
        cards: [],
        currentBet: 0,
        totalInvested: 0,
        isAI: true,
        isActive: true,
        isAllIn: false,
        isFolded: false,
        position: 'ai2',
        personality: 'aggressive'
      }
    ];
    
    console.log('👥 Players initialized:', this.players.length);
  }
  
  shuffleDeck() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    console.log('🔀 Deck shuffled');
  }
  
  dealCard() {
    if (this.deck.length === 0) {
      console.error('❌ Cannot deal card - deck is empty');
      return null;
    }
    return this.deck.pop();
  }
  
  startNewHand() {
    console.log('🆕 Starting new hand...');
    
    // Reset game state
    this.createDeck();
    this.shuffleDeck();
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    this.gamePhase = 'preflop';
    this.bettingRound = 0;
    this.handNumber++;
    
    // Reset player states
    this.players.forEach(player => {
      player.cards = [];
      player.currentBet = 0;
      player.totalInvested = 0;
      player.isFolded = false;
      player.isAllIn = false;
      player.isActive = player.chips > 0; // Only active if has chips
    });
    
    // Post blinds
    this.postBlinds();
    
    // Deal pocket cards (2 cards per player)
    this.dealPocketCards();
    
    // Start first betting round
    this.gameStarted = true;
    this.startBettingRound();
    
    this.updateUI();
    this.updateGameStatus('🃏 New hand dealt! Make your move.');
  }
  
  postBlinds() {
    const activePlayers = this.players.filter(p => p.isActive);
    if (activePlayers.length < 2) {
      console.error('❌ Not enough active players for blinds');
      return;
    }
    
    // Small blind (next player after dealer)
    const sbIndex = (this.dealerPosition + 1) % this.players.length;
    const smallBlindPlayer = this.players[sbIndex];
    if (smallBlindPlayer.isActive) {
      const sbAmount = Math.min(this.blinds.small, smallBlindPlayer.chips);
      smallBlindPlayer.chips -= sbAmount;
      smallBlindPlayer.currentBet = sbAmount;
      smallBlindPlayer.totalInvested = sbAmount;
      this.pot += sbAmount;
      console.log(`💰 ${smallBlindPlayer.name} posts small blind: ${sbAmount}`);
    }
    
    // Big blind
    const bbIndex = (this.dealerPosition + 2) % this.players.length;
    const bigBlindPlayer = this.players[bbIndex];
    if (bigBlindPlayer.isActive) {
      const bbAmount = Math.min(this.blinds.big, bigBlindPlayer.chips);
      bigBlindPlayer.chips -= bbAmount;
      bigBlindPlayer.currentBet = bbAmount;
      bigBlindPlayer.totalInvested = bbAmount;
      this.pot += bbAmount;
      console.log(`💰 ${bigBlindPlayer.name} posts big blind: ${bbAmount}`);
    }
    
    // Set first player to act (after big blind in preflop)
    this.currentPlayerIndex = (this.dealerPosition + 3) % this.players.length;
  }
  
  dealPocketCards() {
    // Deal 2 cards to each active player
    for (let round = 0; round < 2; round++) {
      for (const player of this.players) {
        if (player.isActive) {
          const card = this.dealCard();
          if (card) {
            player.cards.push(card);
          }
        }
      }
    }
    console.log('🃏 Pocket cards dealt to all players');
  }
  
  startBettingRound() {
    console.log(`🎲 Starting betting round: ${this.gamePhase}`);
    
    // Find first player to act
    let startIndex = this.dealerPosition;
    if (this.gamePhase === 'preflop') {
      // Preflop: start after big blind
      startIndex = (this.dealerPosition + 3) % this.players.length;
    } else {
      // Post-flop: start after dealer
      startIndex = (this.dealerPosition + 1) % this.players.length;
    }
    
    this.currentPlayerIndex = startIndex;
    this.processNextPlayer();
  }
  
  processNextPlayer() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    if (!currentPlayer || !currentPlayer.isActive || currentPlayer.isFolded) {
      this.moveToNextPlayer();
      return;
    }
    
    if (currentPlayer.isAI) {
      // AI player decision
      setTimeout(() => {
        this.processAIDecision(currentPlayer);
      }, this.aiThinkingTime);
    } else {
      // Human player - enable UI controls
      this.enablePlayerControls();
    }
  }
  
  processAIDecision(player) {
    console.log(`🤖 ${player.name} is thinking...`);
    
    const decision = this.calculateAIDecision(player);
    this.executePlayerAction(player, decision.action, decision.amount);
  }
  
  calculateAIDecision(player) {
    // Use advanced AI decision making
    if (!player.aiEngine) {
      // Initialize AI engine for this player
      player.aiEngine = PokerAI.createAI(player.personality, this.aiDifficulty);
    }
    
    const gameState = {
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.getCurrentBet(),
      players: this.players,
      gamePhase: this.gamePhase,
      blinds: this.blinds
    };
    
    return player.aiEngine.makeDecision(gameState, player);
  }
  
  evaluateHandStrength(player) {
    // Use comprehensive hand evaluation
    return HandEvaluator.getHandStrength(player.cards, this.communityCards);
  }
  
  calculatePotOdds() {
    const totalPot = this.pot;
    const currentBet = this.getCurrentBet();
    return totalPot / (totalPot + currentBet);
  }
  
  getCurrentBet() {
    return Math.max(...this.players.map(p => p.currentBet));
  }
  
  executePlayerAction(player, action, amount = 0) {
    console.log(`🎯 ${player.name} ${action}${amount ? ` ${amount}` : ''}`);
    
    switch (action) {
      case 'fold':
        player.isFolded = true;
        break;
        
      case 'check':
        // No additional chips needed
        break;
        
      case 'call':
        const callAmount = this.getCurrentBet() - player.currentBet;
        const actualCall = Math.min(callAmount, player.chips);
        player.chips -= actualCall;
        player.currentBet += actualCall;
        player.totalInvested += actualCall;
        this.pot += actualCall;
        
        if (player.chips === 0) player.isAllIn = true;
        break;
        
        case 'raise':
        const currentBet = this.getCurrentBet();
        const raiseCallAmount = currentBet - player.currentBet;
        const totalRaise = raiseCallAmount + amount;
        const actualRaise = Math.min(totalRaise, player.chips);
        
        player.chips -= actualRaise;
        player.currentBet += actualRaise;
        player.totalInvested += actualRaise;
        this.pot += actualRaise;
        
        if (player.chips === 0) player.isAllIn = true;
        break;
    }
    
    this.updateUI();
    this.moveToNextPlayer();
  }
  
  moveToNextPlayer() {
    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.completeBettingRound();
    } else {
      // Move to next active player
      do {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      } while (!this.players[this.currentPlayerIndex].isActive || 
               this.players[this.currentPlayerIndex].isFolded);
      
      this.processNextPlayer();
    }
  }
  
  isBettingRoundComplete() {
    const activePlayers = this.players.filter(p => p.isActive && !p.isFolded);
    
    if (activePlayers.length <= 1) return true;
    
    const currentBet = this.getCurrentBet();
    return activePlayers.every(p => 
      p.currentBet === currentBet || p.isAllIn
    );
  }
  
  completeBettingRound() {
    console.log(`✅ Betting round complete: ${this.gamePhase}`);
    
    // Reset current bets for next round
    this.players.forEach(p => p.currentBet = 0);
    
    // Advance to next phase
    this.advanceGamePhase();
  }
  
  advanceGamePhase() {
    switch (this.gamePhase) {
      case 'preflop':
        this.dealFlop();
        this.gamePhase = 'flop';
        break;
      case 'flop':
        this.dealTurn();
        this.gamePhase = 'turn';
        break;
      case 'turn':
        this.dealRiver();
        this.gamePhase = 'river';
        break;
      case 'river':
        this.showdown();
        return;
    }
    
    this.startBettingRound();
  }
  
  dealFlop() {
    // Burn one card, then deal 3 community cards
    this.dealCard(); // burn card
    for (let i = 0; i < 3; i++) {
      this.communityCards.push(this.dealCard());
    }
    console.log('🃏 Flop dealt:', this.communityCards.slice(0, 3).map(c => c.unicode));
    this.updateUI();
  }
  
  dealTurn() {
    // Burn one card, then deal 1 community card
    this.dealCard(); // burn card
    this.communityCards.push(this.dealCard());
    console.log('🃏 Turn dealt:', this.communityCards[3].unicode);
    this.updateUI();
  }
  
  dealRiver() {
    // Burn one card, then deal 1 community card  
    this.dealCard(); // burn card
    this.communityCards.push(this.dealCard());
    console.log('🃏 River dealt:', this.communityCards[4].unicode);
    this.updateUI();
  }
  
  showdown() {
    console.log('🏁 Showdown!');
    this.gamePhase = 'showdown';
    
    const activePlayers = this.players.filter(p => p.isActive && !p.isFolded);
    
    if (activePlayers.length === 1) {
      // Only one player left - they win
      this.awardPot(activePlayers[0]);
    } else {
      // Evaluate hands and determine winner
      this.evaluateWinner(activePlayers);
    }
    
    this.gameStarted = false;
    this.updateUI();
  }
  
  evaluateWinner(players) {
    // Evaluate all player hands and determine winner(s)
    const playerHands = players.map(player => ({
      player: player,
      hand: HandEvaluator.getBestFiveCardHand(player.cards, this.communityCards)
    }));
    
    // Sort by hand strength (best first)
    playerHands.sort((a, b) => HandEvaluator.compareHands(b.hand, a.hand));
    
    // Find all players with the best hand (for split pots)
    const bestHand = playerHands[0].hand;
    const winners = playerHands.filter(ph => 
      HandEvaluator.compareHands(ph.hand, bestHand) === 0
    );
    
    if (winners.length === 1) {
      // Single winner
      this.awardPot(winners[0].player);
      this.updateGameStatus(`🏆 ${winners[0].player.name} wins with ${bestHand.name}!`);
    } else {
      // Split pot
      const splitAmount = Math.floor(this.pot / winners.length);
      winners.forEach(winner => {
        winner.player.chips += splitAmount;
      });
      this.pot = 0;
      
      const winnerNames = winners.map(w => w.player.name).join(', ');
      this.updateGameStatus(`🤝 Split pot! ${winnerNames} tie with ${bestHand.name}`);
    }
  }
  
  awardPot(winner) {
    console.log(`🏆 ${winner.name} wins ${this.pot} chips!`);
    winner.chips += this.pot;
    
    if (!winner.isAI) {
      this.playerStats.handsWon++;
      this.playerStats.totalWinnings += this.pot;
      this.playerStats.biggestPot = Math.max(this.playerStats.biggestPot, this.pot);
    }
    
    this.pot = 0;
    this.updateGameStatus(`🏆 ${winner.name} wins the hand!`);
  }
  
  enablePlayerControls() {
    // Enable betting buttons for human player
    const foldBtn = document.getElementById('foldBtn');
    const checkCallBtn = document.getElementById('checkCallBtn');
    const raiseBtn = document.getElementById('raiseBtn');
    
    if (foldBtn) foldBtn.disabled = false;
    if (checkCallBtn) checkCallBtn.disabled = false;
    if (raiseBtn) raiseBtn.disabled = false;
    
    this.updateGameStatus('Your turn! Choose your action.');
  }
  
  disablePlayerControls() {
    // Disable betting buttons
    const buttons = ['foldBtn', 'checkCallBtn', 'raiseBtn'];
    buttons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = true;
    });
  }
  
  bindEvents() {
    // Bind UI event listeners
    const newHandBtn = document.getElementById('newHandBtn');
    const foldBtn = document.getElementById('foldBtn');
    const checkCallBtn = document.getElementById('checkCallBtn');
    const raiseBtn = document.getElementById('raiseBtn');
    
    if (newHandBtn) {
      newHandBtn.addEventListener('click', () => this.startNewHand());
    }
    
    if (foldBtn) {
      foldBtn.addEventListener('click', () => {
        this.executePlayerAction(this.players[0], 'fold');
        this.disablePlayerControls();
      });
    }
    
    if (checkCallBtn) {
      checkCallBtn.addEventListener('click', () => {
        const currentBet = this.getCurrentBet();
        const playerBet = this.players[0].currentBet;
        const action = currentBet > playerBet ? 'call' : 'check';
        this.executePlayerAction(this.players[0], action);
        this.disablePlayerControls();
      });
    }
    
    if (raiseBtn) {
      raiseBtn.addEventListener('click', () => {
        // Simple raise (2x big blind)
        const raiseAmount = this.blinds.big * 2;
        this.executePlayerAction(this.players[0], 'raise', raiseAmount);
        this.disablePlayerControls();
      });
    }
  }
  
  updateUI() {
    // Update all UI elements
    this.updatePlayerDisplay();
    this.updateCommunityCards();
    this.updatePotDisplay();
    this.updateControls();
  }
  
  updatePlayerDisplay() {
    // Update player information in UI
    this.players.forEach((player, index) => {
      const playerEl = document.getElementById(`player${index}`);
      if (playerEl) {
        // Add current player highlight
        if (index === this.currentPlayerIndex) {
          playerEl.classList.add('current-player');
        } else {
          playerEl.classList.remove('current-player');
        }
        
        // Add folded styling
        if (player.isFolded) {
          playerEl.classList.add('folded');
        } else {
          playerEl.classList.remove('folded');
        }
        
        // Show cards only for human player or in showdown
        const showCards = !player.isAI || this.gamePhase === 'showdown';
        const cardDisplay = showCards ? 
          player.cards.map(c => `<span class="card ${this.getCardSuitClass(c.suit)}">${c.unicode}</span>`).join('') :
          '🂠 🂠'; // Hidden cards for AI players
          
        // Calculate and display hand strength for human player
        let handInfo = '';
        if (!player.isAI && player.cards.length > 0 && this.communityCards.length >= 3) {
          const hand = HandEvaluator.getBestFiveCardHand(player.cards, this.communityCards);
          handInfo = `<div class="hand-rank">${hand.name}</div>`;
        }
        
        playerEl.innerHTML = `
          <div class="player-name">${player.name}</div>
          <div class="player-chips">$${player.chips}</div>
          <div class="player-cards">${cardDisplay}</div>
          ${handInfo}
          <div class="player-status">${this.getPlayerStatus(player)}</div>
        `;
      }
    });
  }
  
  getCardSuitClass(suit) {
    return (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
  }
  
  getPlayerStatus(player) {
    if (player.isFolded) return '❌ Folded';
    if (player.isAllIn) return '🔥 All-in';
    if (player.currentBet > 0) return `💰 Bet: ${player.currentBet}`;
    return '⏳ Waiting';
  }
  
  updateCommunityCards() {
    const communityEl = document.getElementById('communityCards');
    if (communityEl) {
      communityEl.innerHTML = this.communityCards.map(card => 
        `<span class="card ${this.getCardSuitClass(card.suit)} card-deal">${card.unicode}</span>`
      ).join(' ');
    }
  }
  
  updatePotDisplay() {
    const potEl = document.getElementById('potAmount');
    if (potEl) {
      potEl.textContent = this.pot;
    }
  }
  
  updateControls() {
    // Update button states and labels
    const checkCallBtn = document.getElementById('checkCallBtn');
    if (checkCallBtn) {
      const currentBet = this.getCurrentBet();
      const playerBet = this.players[0].currentBet;
      const callAmount = currentBet - playerBet;
      
      if (callAmount === 0) {
        checkCallBtn.textContent = '✓ Check';
      } else {
        checkCallBtn.textContent = `📞 Call ${callAmount}`;
      }
    }
  }
  
  updateGameStatus(message) {
    const statusEl = document.getElementById('gameStatus');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }
}

// Initialize poker engine when page loads
document.addEventListener('DOMContentLoaded', function() {
  try {
    window.pokerEngine = new PokerEngine();
    console.log('🎰 Poker Engine initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing poker engine:', error);
  }
});