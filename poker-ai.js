// Advanced Poker AI Engine with Multiple Personalities and Strategies
class PokerAI {
  static PERSONALITIES = {
    tight: {
      name: 'Tight',
      description: 'Plays only strong hands, folds weak hands quickly',
      vpip: 0.15,        // Voluntarily Put $ In Pot %
      pfr: 0.12,         // Pre-flop Raise %
      aggression: 0.3,   // Post-flop aggression
      bluffFreq: 0.05,   // Bluffing frequency
      callThreshold: 0.6, // Minimum hand strength to call
      raiseThreshold: 0.8 // Minimum hand strength to raise
    },
    loose: {
      name: 'Loose',
      description: 'Plays many hands, likes to see flops',
      vpip: 0.35,
      pfr: 0.18,
      aggression: 0.4,
      bluffFreq: 0.15,
      callThreshold: 0.3,
      raiseThreshold: 0.6
    },
    aggressive: {
      name: 'Aggressive',
      description: 'Bets and raises frequently, applies pressure',
      vpip: 0.25,
      pfr: 0.22,
      aggression: 0.7,
      bluffFreq: 0.25,
      callThreshold: 0.4,
      raiseThreshold: 0.5
    },
    passive: {
      name: 'Passive',
      description: 'Calls often, rarely bets or raises',
      vpip: 0.28,
      pfr: 0.08,
      aggression: 0.2,
      bluffFreq: 0.03,
      callThreshold: 0.35,
      raiseThreshold: 0.85
    },
    maniac: {
      name: 'Maniac',
      description: 'Extremely aggressive, unpredictable play style',
      vpip: 0.45,
      pfr: 0.35,
      aggression: 0.9,
      bluffFreq: 0.4,
      callThreshold: 0.25,
      raiseThreshold: 0.3
    }
  };
  
  static DIFFICULTY_MODIFIERS = {
    1: { skillMod: 0.3, errorRate: 0.3, bluffDetection: 0.2 }, // Beginner
    2: { skillMod: 0.5, errorRate: 0.2, bluffDetection: 0.4 }, // Novice
    3: { skillMod: 0.7, errorRate: 0.15, bluffDetection: 0.6 }, // Amateur
    4: { skillMod: 0.85, errorRate: 0.1, bluffDetection: 0.8 }, // Expert
    5: { skillMod: 1.0, errorRate: 0.05, bluffDetection: 0.9 }  // Professional
  };
  
  constructor(personality, difficulty = 3) {
    this.personality = PokerAI.PERSONALITIES[personality];
    this.difficulty = PokerAI.DIFFICULTY_MODIFIERS[difficulty];
    this.handHistory = [];
    this.opponentModels = new Map(); // Track opponent tendencies
    this.sessionStats = {
      handsPlayed: 0,
      vpipActual: 0,
      aggressionActual: 0
    };
  }
  
  makeDecision(gameState, player) {
    const {
      communityCards,
      pot,
      currentBet,
      players,
      gamePhase,
      blinds
    } = gameState;
    
    // Calculate hand strength
    const handStrength = HandEvaluator.getHandStrength(player.cards, communityCards);
    
    // Calculate pot odds
    const callAmount = currentBet - player.currentBet;
    const potOdds = callAmount > 0 ? callAmount / (pot + callAmount) : 0;
    
    // Analyze opponents
    const opponentAnalysis = this.analyzeOpponents(players, player);
    
    // Calculate position strength (later positions are stronger)
    const positionStrength = this.calculatePositionStrength(players, player);
    
    // Determine base action based on hand strength and personality
    let decision = this.getBaseDecision(handStrength, potOdds, gamePhase, callAmount, player.chips);
    
    // Apply personality adjustments
    decision = this.applyPersonalityAdjustments(decision, handStrength, gameState, player);
    
    // Apply difficulty adjustments (add some randomness for lower difficulties)
    decision = this.applyDifficultyAdjustments(decision, handStrength, gameState);
    
    // Consider bluffing opportunities
    if (this.shouldBluff(gameState, handStrength, opponentAnalysis)) {
      decision = this.generateBluff(gameState, player);
    }
    
    // Update internal models
    this.updateModels(decision, handStrength, gameState);
    
    return decision;
  }
  
  getBaseDecision(handStrength, potOdds, gamePhase, callAmount, playerChips) {
    // Pre-flop decision matrix
    if (gamePhase === 'preflop') {
      return this.getPreflopDecision(handStrength, callAmount, playerChips);
    }
    
    // Post-flop decisions based on hand strength and pot odds
    if (handStrength >= this.personality.raiseThreshold) {
      const raiseSize = this.calculateRaiseSize(handStrength, gamePhase);
      return { action: 'raise', amount: raiseSize };
    }
    
    if (handStrength >= this.personality.callThreshold || 
        (potOdds > 0 && (1 - handStrength) < potOdds * 2)) {
      return callAmount === 0 ? { action: 'check' } : { action: 'call' };
    }
    
    return { action: 'fold' };
  }
  
  getPreflopDecision(handStrength, callAmount, playerChips) {
    const pocketPairStrength = this.evaluatePocketPairs(handStrength);
    const suitedConnectorStrength = this.evaluateSuitedConnectors(handStrength);
    
    let adjustedStrength = handStrength;
    
    // Boost pocket pairs
    if (pocketPairStrength > 0) {
      adjustedStrength += pocketPairStrength;
    }
    
    // Boost suited connectors for loose players
    if (this.personality.vpip > 0.3 && suitedConnectorStrength > 0) {
      adjustedStrength += suitedConnectorStrength * 0.1;
    }
    
    // Decision based on adjusted strength
    if (adjustedStrength >= 0.8) {
      return { action: 'raise', amount: Math.min(callAmount * 3, playerChips * 0.1) };
    } else if (adjustedStrength >= 0.6) {
      return callAmount === 0 ? { action: 'check' } : { action: 'call' };
    } else if (adjustedStrength >= 0.4 && this.personality.vpip > Math.random()) {
      return callAmount === 0 ? { action: 'check' } : { action: 'call' };
    }
    
    return { action: 'fold' };
  }
  
  applyPersonalityAdjustments(decision, handStrength, gameState, player) {
    const { pot, currentBet } = gameState;
    
    // Aggressive players raise more often
    if (this.personality.aggression > Math.random() && decision.action === 'call') {
      if (handStrength > 0.5) {
        decision = {
          action: 'raise',
          amount: this.calculateRaiseSize(handStrength, gameState.gamePhase)
        };
      }
    }
    
    // Passive players call instead of raising
    if (this.personality.aggression < 0.3 && decision.action === 'raise') {
      if (handStrength < 0.9) {
        decision = { action: 'call' };
      }
    }
    
    // Tight players fold marginal hands
    if (this.personality.callThreshold > 0.5 && handStrength < 0.6) {
      if (decision.action !== 'fold' && currentBet > pot * 0.3) {
        decision = { action: 'fold' };
      }
    }
    
    return decision;
  }
  
  applyDifficultyAdjustments(decision, handStrength, gameState) {
    const errorRate = this.difficulty.errorRate;
    
    // Lower difficulty AIs make more mistakes
    if (Math.random() < errorRate) {
      // Make a suboptimal decision
      if (decision.action === 'fold' && handStrength > 0.6) {
        return { action: 'call' }; // Call with decent hand instead of folding
      } else if (decision.action === 'raise' && handStrength < 0.4) {
        return { action: 'fold' }; // Fold weak hand instead of bluffing
      } else if (decision.action === 'call' && handStrength < 0.3) {
        return { action: 'fold' }; // Fold very weak hands
      }
    }
    
    // Apply skill modifier to bet sizing
    if (decision.amount) {
      const skillFactor = this.difficulty.skillMod;
      decision.amount *= (0.5 + skillFactor * 0.5); // Scale between 50-100% of optimal
    }
    
    return decision;
  }
  
  shouldBluff(gameState, handStrength, opponentAnalysis) {
    const { pot, players, gamePhase, communityCards } = gameState;
    
    // Don't bluff with strong hands
    if (handStrength > 0.7) return false;
    
    // Check bluff frequency
    if (Math.random() > this.personality.bluffFreq) return false;
    
    // More likely to bluff in later positions
    const activeOpponents = players.filter(p => p.isActive && !p.isFolded).length - 1;
    if (activeOpponents > 2) return false;
    
    // Check board texture for bluff opportunities
    const boardStrength = this.analyzeBoardTexture(communityCards);
    
    // Bluff on scary boards (potential straights/flushes)
    return boardStrength.scary && gamePhase !== 'preflop';
  }
  
  generateBluff(gameState, player) {
    const { pot } = gameState;
    const bluffSize = pot * (0.6 + Math.random() * 0.4); // 60-100% pot bet
    
    return {
      action: 'raise',
      amount: Math.min(bluffSize, player.chips * 0.3), // Don't risk more than 30% of stack
      isBluff: true
    };
  }
  
  calculateRaiseSize(handStrength, gamePhase) {
    const baseMultiplier = {
      'preflop': 3,
      'flop': 0.7,
      'turn': 0.8,
      'river': 0.9
    };
    
    const multiplier = baseMultiplier[gamePhase] || 0.7;
    let sizeMultiplier = 1 + handStrength * multiplier;
    
    // Aggressive personalities bet larger
    sizeMultiplier *= (1 + this.personality.aggression * 0.3);
    
    return sizeMultiplier;
  }
  
  analyzeOpponents(players, currentPlayer) {
    const opponents = players.filter(p => p.id !== currentPlayer.id && p.isActive && !p.isFolded);
    
    return {
      count: opponents.length,
      totalChips: opponents.reduce((sum, p) => sum + p.chips, 0),
      averageStack: opponents.length > 0 ? opponents.reduce((sum, p) => sum + p.chips, 0) / opponents.length : 0,
      tightPlayers: opponents.filter(p => p.personality === 'tight').length,
      aggressivePlayers: opponents.filter(p => p.personality === 'aggressive').length
    };
  }
  
  calculatePositionStrength(players, currentPlayer) {
    const activePlayers = players.filter(p => p.isActive && !p.isFolded);
    const currentIndex = activePlayers.findIndex(p => p.id === currentPlayer.id);
    const totalPlayers = activePlayers.length;
    
    // Later position = higher strength (0-1 scale)
    return currentIndex / Math.max(totalPlayers - 1, 1);
  }
  
  analyzeBoardTexture(communityCards) {
    if (communityCards.length < 3) {
      return { scary: false, draws: [], pairs: 0 };
    }
    
    const suits = communityCards.map(c => c.suit);
    const ranks = communityCards.map(c => c.value).sort((a, b) => a - b);
    
    // Check for flush draws
    const suitCounts = {};
    suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
    const maxSuitCount = Math.max(...Object.values(suitCounts));
    
    // Check for straight draws
    const hasGaps = this.checkStraightDraws(ranks);
    
    // Check for pairs on board
    const rankCounts = {};
    ranks.forEach(rank => rankCounts[rank] = (rankCounts[rank] || 0) + 1);
    const pairs = Object.values(rankCounts).filter(count => count >= 2).length;
    
    return {
      scary: maxSuitCount >= 3 || hasGaps || pairs > 0,
      flushDraw: maxSuitCount >= 3,
      straightDraw: hasGaps,
      pairs: pairs,
      coordinated: maxSuitCount >= 3 || hasGaps
    };
  }
  
  checkStraightDraws(ranks) {
    if (ranks.length < 3) return false;
    
    // Check for potential straights
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
    
    for (let i = 0; i < uniqueRanks.length - 2; i++) {
      if (uniqueRanks[i + 2] - uniqueRanks[i] <= 4) {
        return true; // Potential straight draw
      }
    }
    
    // Check for wheel draw (A-5)
    if (uniqueRanks.includes(14) && uniqueRanks.some(r => r <= 5)) {
      return true;
    }
    
    return false;
  }
  
  evaluatePocketPairs(handStrength) {
    // This would need access to actual cards - simplified for now
    // High pairs get bonus, low pairs get small bonus
    if (handStrength > 0.8) return 0.1; // High pocket pair
    if (handStrength > 0.6) return 0.05; // Medium pocket pair
    if (handStrength > 0.4) return 0.02; // Low pocket pair
    return 0;
  }
  
  evaluateSuitedConnectors(handStrength) {
    // Simplified evaluation - would need actual card analysis
    // Suited connectors have potential value
    if (handStrength > 0.3 && handStrength < 0.7) {
      return 0.05; // Small bonus for speculative hands
    }
    return 0;
  }
  
  updateModels(decision, handStrength, gameState) {
    this.sessionStats.handsPlayed++;
    
    // Track actual vs expected play style
    if (decision.action !== 'fold') {
      this.sessionStats.vpipActual++;
    }
    
    if (decision.action === 'raise') {
      this.sessionStats.aggressionActual++;
    }
    
    // Store hand for future analysis
    this.handHistory.push({
      decision: decision.action,
      handStrength: handStrength,
      gamePhase: gameState.gamePhase,
      pot: gameState.pot
    });
    
    // Keep only recent history
    if (this.handHistory.length > 50) {
      this.handHistory = this.handHistory.slice(-50);
    }
  }
  
  getStats() {
    const handsPlayed = this.sessionStats.handsPlayed || 1;
    return {
      vpip: (this.sessionStats.vpipActual / handsPlayed).toFixed(2),
      aggression: (this.sessionStats.aggressionActual / handsPlayed).toFixed(2),
      handsPlayed: handsPlayed,
      personality: this.personality.name
    };
  }
  
  static createAI(personalityName, difficulty = 3) {
    return new PokerAI(personalityName, difficulty);
  }
}

// Export for use in main poker engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PokerAI;
} else {
  window.PokerAI = PokerAI;
}