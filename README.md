# 🃏 Texas Hold'em Poker AI Engine

A sophisticated Texas Hold'em poker engine with intelligent AI opponents, inspired by the chess engine architecture. Features advanced hand evaluation, multiple AI personalities, and comprehensive game mechanics.

## 🚀 Features

### 🎮 Game Mechanics
- **Complete Texas Hold'em Implementation**: All phases (preflop, flop, turn, river, showdown)
- **Professional Hand Evaluation**: Full poker hand rankings from High Card to Royal Flush
- **Proper Betting System**: Blinds, calls, raises, all-ins with pot management
- **Multi-Player Support**: 1 human player + up to 5 AI opponents

### 🤖 Advanced AI System
- **Multiple Personalities**: Tight, Loose, Aggressive, Passive, Maniac playing styles
- **5 Difficulty Levels**: From Beginner to Professional
- **Smart Decision Making**: Pot odds calculation, position awareness, bluff detection
- **Dynamic Adaptation**: AI learns and adjusts to opponent behavior

### 🎯 AI Personalities

| Personality | Description | VPIP* | Aggression | Bluff Rate |
|-------------|-------------|-------|------------|------------|
| **Tight** | Conservative, plays only strong hands | 15% | Low | 5% |
| **Loose** | Plays many hands, likes to see flops | 35% | Medium | 15% |
| **Aggressive** | Frequent betting and raising | 25% | High | 25% |
| **Passive** | Calls often, rarely raises | 28% | Very Low | 3% |
| **Maniac** | Extremely aggressive and unpredictable | 45% | Maximum | 40% |

*VPIP = Voluntarily Put money In Pot percentage

### 🎨 User Interface
- **Mobile-Optimized Design**: Touch-friendly interface with responsive layout
- **Beautiful Poker Table**: Realistic green felt design with card animations
- **Real-time Hand Rankings**: See your hand strength during play
- **Comprehensive Statistics**: Track wins, losses, and biggest pots
- **Customizable Settings**: Adjust blinds, game speed, and number of players

## 🛠️ Architecture

### Core Components

1. **PokerEngine** (`poker-engine.js`)
   - Main game controller
   - Game state management
   - Player turn handling
   - Betting round coordination

2. **HandEvaluator** (`hand-evaluator.js`)
   - Complete poker hand evaluation system
   - Best 5-card hand selection from 7 cards
   - Hand comparison and tie-breaking
   - Hand strength calculation (0-1 scale)

3. **PokerAI** (`poker-ai.js`)
   - Advanced AI decision making
   - Personality-based play styles  
   - Difficulty scaling
   - Opponent modeling and adaptation

### 🏗️ Game Flow

```
New Hand → Deal Cards → Preflop Betting → Flop → Betting → Turn → Betting → River → Betting → Showdown
```

### 🧠 AI Decision Process

```
Hand Analysis → Pot Odds Calculation → Opponent Modeling → Personality Application → Difficulty Adjustment → Final Decision
```

## 🎯 Hand Rankings (Strongest to Weakest)

1. **Royal Flush** - A, K, Q, J, 10 all same suit
2. **Straight Flush** - Five cards in sequence, same suit  
3. **Four of a Kind** - Four cards of same rank
4. **Full House** - Three of a kind + pair
5. **Flush** - Five cards of same suit
6. **Straight** - Five cards in sequence
7. **Three of a Kind** - Three cards of same rank
8. **Two Pair** - Two different pairs
9. **Pair** - Two cards of same rank
10. **High Card** - Highest single card

## 🎮 How to Play

### Starting a Game
1. Open `index.html` in a web browser
2. Adjust game settings (AI difficulty, blinds, number of players)
3. Click "Deal New Hand" to start

### Making Decisions
- **Fold**: Give up your hand and forfeit current bets
- **Check**: Pass the action (when no bet required)  
- **Call**: Match the current bet
- **Raise**: Increase the current bet

### Winning
- Best hand at showdown wins the pot
- All opponents fold = automatic win
- Ties split the pot equally

## ⚙️ Game Settings

### AI Difficulty Levels
- **Level 1 (Beginner)**: 30% error rate, poor bluff detection
- **Level 2 (Novice)**: 20% error rate, basic strategy
- **Level 3 (Amateur)**: 15% error rate, decent play
- **Level 4 (Expert)**: 10% error rate, strong strategy  
- **Level 5 (Professional)**: 5% error rate, optimal play

### Blind Levels
- **Micro**: $1/$2 blinds
- **Low**: $5/$10 blinds (default)
- **Medium**: $10/$20 blinds
- **High**: $25/$50 blinds
- **Very High**: $50/$100 blinds

### Game Speed
- **Slow**: 3 second AI thinking time
- **Medium**: 1.5 second AI thinking time (default)
- **Fast**: 0.5 second AI thinking time
- **Instant**: No AI delay

## 📱 Mobile Support

- **Touch Controls**: Tap buttons for actions
- **Responsive Design**: Adapts to different screen sizes
- **Portrait/Landscape**: Works in both orientations
- **Optimized Performance**: Smooth animations and quick response

## 🔧 Technical Details

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Requirements**: JavaScript ES6+ support

### Performance Features
- **Efficient Hand Evaluation**: Optimized algorithms for fast calculation
- **Smart UI Updates**: Only updates changed elements
- **Memory Management**: Automatic cleanup of game history
- **Scalable Architecture**: Easy to add new features

## 🎲 Strategy Tips

### For Beginners
- **Play Tight**: Only play strong starting hands (pairs, AK, AQ)
- **Position Matters**: Play more hands in later positions
- **Watch Opponents**: Learn AI personalities and adjust
- **Bankroll Management**: Don't risk more than you can afford

### Advanced Play  
- **Bluff Selectively**: Choose good spots against tight players
- **Vary Your Play**: Don't be too predictable
- **Pot Odds**: Call when pot odds favor your hand
- **Read the Board**: Watch for flush and straight possibilities

## 🏆 Session Statistics

Track your progress with comprehensive statistics:
- **Hands Won**: Total number of hands you've won
- **Total Winnings**: Net profit/loss from the session  
- **Biggest Pot**: Largest pot you've won
- **VPIP**: How often you voluntarily put money in the pot
- **Win Rate**: Percentage of hands won

## 🔮 Future Enhancements

- **Tournament Mode**: Multi-table tournament structure
- **Advanced Statistics**: Detailed hand history and analysis
- **Player Profiles**: Save and load different player configurations
- **Online Multiplayer**: Play against other human players
- **Hand Replayer**: Review and analyze previous hands
- **Custom AI Training**: Create and train your own AI personalities

## 📜 License

This poker engine is inspired by the chess engine architecture and built for educational and entertainment purposes. The code demonstrates advanced JavaScript game development techniques and AI decision-making algorithms.

---

**Ready to test your poker skills against intelligent AI opponents? Load up the engine and see if you can outplay the bots! 🎯**