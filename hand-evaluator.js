// Enhanced Hand Evaluation Engine for Texas Hold'em Poker
class HandEvaluator {
  static HAND_RANKS = {
    HIGH_CARD: 1,
    PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
  };
  
  static HAND_NAMES = {
    1: 'High Card',
    2: 'Pair',
    3: 'Two Pair',
    4: 'Three of a Kind',
    5: 'Straight',
    6: 'Flush',
    7: 'Full House',
    8: 'Four of a Kind',
    9: 'Straight Flush',
    10: 'Royal Flush'
  };
  
  static evaluateHand(cards) {
    // Convert cards to evaluation format
    const evalCards = cards.map(card => ({
      rank: card.value,
      suit: card.suit,
      rankChar: card.rank
    })).sort((a, b) => b.rank - a.rank);
    
    // Check for each hand type (highest to lowest)
    const royalFlush = this.checkRoyalFlush(evalCards);
    if (royalFlush) return royalFlush;
    
    const straightFlush = this.checkStraightFlush(evalCards);
    if (straightFlush) return straightFlush;
    
    const fourOfAKind = this.checkFourOfAKind(evalCards);
    if (fourOfAKind) return fourOfAKind;
    
    const fullHouse = this.checkFullHouse(evalCards);
    if (fullHouse) return fullHouse;
    
    const flush = this.checkFlush(evalCards);
    if (flush) return flush;
    
    const straight = this.checkStraight(evalCards);
    if (straight) return straight;
    
    const threeOfAKind = this.checkThreeOfAKind(evalCards);
    if (threeOfAKind) return threeOfAKind;
    
    const twoPair = this.checkTwoPair(evalCards);
    if (twoPair) return twoPair;
    
    const pair = this.checkPair(evalCards);
    if (pair) return pair;
    
    return this.checkHighCard(evalCards);
  }
  
  static getBestFiveCardHand(playerCards, communityCards) {
    // Combine all available cards
    const allCards = [...playerCards, ...communityCards];
    
    if (allCards.length < 5) {
      return this.evaluateHand(allCards);
    }
    
    // Generate all possible 5-card combinations
    const combinations = this.generateCombinations(allCards, 5);
    
    let bestHand = null;
    let bestRank = 0;
    
    for (const combo of combinations) {
      const handResult = this.evaluateHand(combo);
      if (handResult.rank > bestRank || 
          (handResult.rank === bestRank && this.compareKickers(handResult, bestHand) > 0)) {
        bestHand = handResult;
        bestRank = handResult.rank;
      }
    }
    
    return bestHand;
  }
  
  static generateCombinations(cards, k) {
    if (k === 1) return cards.map(card => [card]);
    if (k === cards.length) return [cards];
    
    const combinations = [];
    for (let i = 0; i <= cards.length - k; i++) {
      const head = cards[i];
      const tailCombos = this.generateCombinations(cards.slice(i + 1), k - 1);
      for (const combo of tailCombos) {
        combinations.push([head, ...combo]);
      }
    }
    return combinations;
  }
  
  static checkRoyalFlush(cards) {
    const flushCards = this.getFlushCards(cards);
    if (flushCards.length < 5) return null;
    
    for (const suitCards of Object.values(flushCards)) {
      if (suitCards.length >= 5) {
        const ranks = suitCards.map(c => c.rank).sort((a, b) => b - a);
        if (ranks[0] === 14 && ranks[1] === 13 && ranks[2] === 12 && ranks[3] === 11 && ranks[4] === 10) {
          return {
            rank: this.HAND_RANKS.ROYAL_FLUSH,
            name: this.HAND_NAMES[this.HAND_RANKS.ROYAL_FLUSH],
            kickers: [14],
            cards: suitCards.slice(0, 5)
          };
        }
      }
    }
    return null;
  }
  
  static checkStraightFlush(cards) {
    const flushCards = this.getFlushCards(cards);
    
    for (const suitCards of Object.values(flushCards)) {
      if (suitCards.length >= 5) {
        const straight = this.findStraight(suitCards);
        if (straight) {
          return {
            rank: this.HAND_RANKS.STRAIGHT_FLUSH,
            name: this.HAND_NAMES[this.HAND_RANKS.STRAIGHT_FLUSH],
            kickers: [straight.high],
            cards: straight.cards
          };
        }
      }
    }
    return null;
  }
  
  static checkFourOfAKind(cards) {
    const rankCounts = this.getRankCounts(cards);
    
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 4) {
        const fourCards = cards.filter(c => c.rank === parseInt(rank));
        const kicker = cards.find(c => c.rank !== parseInt(rank));
        
        return {
          rank: this.HAND_RANKS.FOUR_OF_A_KIND,
          name: this.HAND_NAMES[this.HAND_RANKS.FOUR_OF_A_KIND],
          kickers: [parseInt(rank), kicker ? kicker.rank : 0],
          cards: [...fourCards.slice(0, 4), kicker].filter(Boolean)
        };
      }
    }
    return null;
  }
  
  static checkFullHouse(cards) {
    const rankCounts = this.getRankCounts(cards);
    let threeRank = null;
    let pairRank = null;
    
    // Find three of a kind
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 3) {
        threeRank = parseInt(rank);
        break;
      }
    }
    
    if (!threeRank) return null;
    
    // Find pair (different from three of a kind)
    for (const [rank, count] of Object.entries(rankCounts)) {
      const rankNum = parseInt(rank);
      if (rankNum !== threeRank && count >= 2) {
        pairRank = rankNum;
        break;
      }
    }
    
    if (!pairRank) return null;
    
    const threeCards = cards.filter(c => c.rank === threeRank).slice(0, 3);
    const pairCards = cards.filter(c => c.rank === pairRank).slice(0, 2);
    
    return {
      rank: this.HAND_RANKS.FULL_HOUSE,
      name: this.HAND_NAMES[this.HAND_RANKS.FULL_HOUSE],
      kickers: [threeRank, pairRank],
      cards: [...threeCards, ...pairCards]
    };
  }
  
  static checkFlush(cards) {
    const flushCards = this.getFlushCards(cards);
    
    for (const suitCards of Object.values(flushCards)) {
      if (suitCards.length >= 5) {
        const flushHand = suitCards.slice(0, 5);
        return {
          rank: this.HAND_RANKS.FLUSH,
          name: this.HAND_NAMES[this.HAND_RANKS.FLUSH],
          kickers: flushHand.map(c => c.rank),
          cards: flushHand
        };
      }
    }
    return null;
  }
  
  static checkStraight(cards) {
    const straight = this.findStraight(cards);
    if (straight) {
      return {
        rank: this.HAND_RANKS.STRAIGHT,
        name: this.HAND_NAMES[this.HAND_RANKS.STRAIGHT],
        kickers: [straight.high],
        cards: straight.cards
      };
    }
    return null;
  }
  
  static checkThreeOfAKind(cards) {
    const rankCounts = this.getRankCounts(cards);
    
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 3) {
        const threeCards = cards.filter(c => c.rank === parseInt(rank)).slice(0, 3);
        const kickers = cards.filter(c => c.rank !== parseInt(rank))
                            .sort((a, b) => b.rank - a.rank)
                            .slice(0, 2);
        
        return {
          rank: this.HAND_RANKS.THREE_OF_A_KIND,
          name: this.HAND_NAMES[this.HAND_RANKS.THREE_OF_A_KIND],
          kickers: [parseInt(rank), ...kickers.map(c => c.rank)],
          cards: [...threeCards, ...kickers]
        };
      }
    }
    return null;
  }
  
  static checkTwoPair(cards) {
    const rankCounts = this.getRankCounts(cards);
    const pairs = [];
    
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 2) {
        pairs.push(parseInt(rank));
      }
    }
    
    if (pairs.length < 2) return null;
    
    pairs.sort((a, b) => b - a);
    const highPair = pairs[0];
    const lowPair = pairs[1];
    
    const highPairCards = cards.filter(c => c.rank === highPair).slice(0, 2);
    const lowPairCards = cards.filter(c => c.rank === lowPair).slice(0, 2);
    const kicker = cards.find(c => c.rank !== highPair && c.rank !== lowPair);
    
    return {
      rank: this.HAND_RANKS.TWO_PAIR,
      name: this.HAND_NAMES[this.HAND_RANKS.TWO_PAIR],
      kickers: [highPair, lowPair, kicker ? kicker.rank : 0],
      cards: [...highPairCards, ...lowPairCards, kicker].filter(Boolean)
    };
  }
  
  static checkPair(cards) {
    const rankCounts = this.getRankCounts(cards);
    
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 2) {
        const pairCards = cards.filter(c => c.rank === parseInt(rank)).slice(0, 2);
        const kickers = cards.filter(c => c.rank !== parseInt(rank))
                            .sort((a, b) => b.rank - a.rank)
                            .slice(0, 3);
        
        return {
          rank: this.HAND_RANKS.PAIR,
          name: this.HAND_NAMES[this.HAND_RANKS.PAIR],
          kickers: [parseInt(rank), ...kickers.map(c => c.rank)],
          cards: [...pairCards, ...kickers]
        };
      }
    }
    return null;
  }
  
  static checkHighCard(cards) {
    const sortedCards = [...cards].sort((a, b) => b.rank - a.rank).slice(0, 5);
    
    return {
      rank: this.HAND_RANKS.HIGH_CARD,
      name: this.HAND_NAMES[this.HAND_RANKS.HIGH_CARD],
      kickers: sortedCards.map(c => c.rank),
      cards: sortedCards
    };
  }
  
  // Helper methods
  static getRankCounts(cards) {
    const counts = {};
    cards.forEach(card => {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
    });
    return counts;
  }
  
  static getFlushCards(cards) {
    const suitGroups = {};
    cards.forEach(card => {
      if (!suitGroups[card.suit]) {
        suitGroups[card.suit] = [];
      }
      suitGroups[card.suit].push(card);
    });
    
    // Sort each suit group by rank (descending)
    for (const suit in suitGroups) {
      suitGroups[suit].sort((a, b) => b.rank - a.rank);
    }
    
    return suitGroups;
  }
  
  static findStraight(cards) {
    const uniqueRanks = [...new Set(cards.map(c => c.rank))].sort((a, b) => b - a);
    
    // Check for A-5 straight (wheel)
    if (uniqueRanks.includes(14) && uniqueRanks.includes(5) && 
        uniqueRanks.includes(4) && uniqueRanks.includes(3) && uniqueRanks.includes(2)) {
      const straightCards = [2, 3, 4, 5, 14].map(rank => 
        cards.find(c => c.rank === rank)
      );
      return { high: 5, cards: straightCards }; // Wheel straight high is 5, not Ace
    }
    
    // Check for regular straights
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
        const straightRanks = uniqueRanks.slice(i, i + 5);
        const straightCards = straightRanks.map(rank => 
          cards.find(c => c.rank === rank)
        );
        return { high: straightRanks[0], cards: straightCards };
      }
    }
    
    return null;
  }
  
  static compareHands(hand1, hand2) {
    // Compare hand ranks first
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank;
    }
    
    // Same rank, compare kickers
    return this.compareKickers(hand1, hand2);
  }
  
  static compareKickers(hand1, hand2) {
    for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
      const kicker1 = hand1.kickers[i] || 0;
      const kicker2 = hand2.kickers[i] || 0;
      
      if (kicker1 !== kicker2) {
        return kicker1 - kicker2;
      }
    }
    return 0; // Tie
  }
  
  static getHandStrength(playerCards, communityCards) {
    // Calculate hand strength as percentage (0-1)
    const hand = this.getBestFiveCardHand(playerCards, communityCards);
    
    // Base strength by hand rank
    const baseStrength = {
      1: 0.0,   // High Card
      2: 0.2,   // Pair
      3: 0.4,   // Two Pair
      4: 0.55,  // Three of a Kind
      5: 0.65,  // Straight
      6: 0.72,  // Flush
      7: 0.82,  // Full House
      8: 0.91,  // Four of a Kind
      9: 0.97,  // Straight Flush
      10: 1.0   // Royal Flush
    };
    
    let strength = baseStrength[hand.rank];
    
    // Adjust based on kickers for same hand types
    if (hand.kickers.length > 0) {
      const kickerBonus = hand.kickers[0] / 14 * 0.05; // Up to 5% bonus for high kicker
      strength += kickerBonus;
    }
    
    return Math.min(strength, 1.0);
  }
}

// Export for use in main poker engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HandEvaluator;
} else {
  window.HandEvaluator = HandEvaluator;
}