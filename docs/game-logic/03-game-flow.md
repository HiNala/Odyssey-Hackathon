# Game Flow & Phase Transitions

## Overview

Odyssey Arena has a clear, linear game flow designed for quick demos. The game progresses through four distinct phases: Idle, Setup, Battle, and Victory. Each phase has specific entry conditions, behaviors, and exit conditions. This document details exactly how the game flows from start to finish.

Understanding this flow is critical for implementing the UI correctly. Each phase determines what's visible, what's interactive, and what Odyssey operations are permitted.

---

## Phase Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│    ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────┐ │
│    │          │        │          │        │          │        │      │ │
│    │   IDLE   │──────▶│  SETUP   │──────▶│  BATTLE  │──────▶│VICTORY│ │
│    │          │        │          │        │          │        │      │ │
│    └──────────┘        └──────────┘        └──────────┘        └──────┘ │
│         ▲                                                         │     │
│         │                                                         │     │
│         └─────────────────────────────────────────────────────────┘     │
│                              RESET_GAME                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: IDLE

### Description

The initial state when the application loads. Nothing is connected, no streams are active. The UI shows a welcome screen with a "Start Game" button.

### Entry Conditions
- Application loads for the first time
- User clicks "Play Again" from Victory phase

### State Shape
```typescript
{
  phase: 'idle',
  isConnected: false,
  players: [
    { id: 1, isSetupComplete: false, isStreaming: false, ... },
    { id: 2, isSetupComplete: false, isStreaming: false, ... }
  ],
  eventLog: [],
  activePlayer: 1,
  winner: null,
}
```

### UI Elements
- Welcome overlay with game title
- "Start Game" button
- Brief instructions or animated background
- Phone screens show placeholders or static content

### Available Actions
- Click "Start Game" → Triggers CONNECT action → Transitions to SETUP

### Exit Conditions
- User clicks "Start Game"
- Odyssey connection established successfully

### Implementation Notes

```typescript
// In Arena component
function handleStartGame() {
  if (state.phase !== 'idle') return;
  
  connect()
    .then(() => dispatch({ type: 'CONNECT' }))
    .catch((error) => {
      dispatch({ type: 'CONNECTION_ERROR', error: error.message });
    });
}
```

---

## Phase 2: SETUP

### Description

Players define their characters and worlds. This happens sequentially — Player 1 first, then Player 2. Each player enters a character description and world description, then Odyssey generates a short preview stream.

### Entry Conditions
- Odyssey connection established
- CONNECT action dispatched

### State Shape (during Player 1 setup)
```typescript
{
  phase: 'setup',
  isConnected: true,
  players: [
    { id: 1, isSetupComplete: false, character: '', world: '', ... },
    { id: 2, isSetupComplete: false, character: '', world: '', ... }
  ],
  activePlayer: 1,  // Indicates who is currently setting up
}
```

### UI Elements
- Phone 1: Active input fields for character + world
- Phone 2: "Waiting for Player 1..." message
- Center HUD: Setup progress indicator
- Prompt bar: Used for character/world input

### Setup Flow

```
Player 1 enters character → Player 1 enters world → Generate P1 stream → 
P1 setup complete → Player 2 enters character → Player 2 enters world → 
Generate P2 stream → P2 setup complete → Transition to BATTLE
```

### Available Actions

```typescript
// Player submits character + world
async function submitCharacterSetup(player: 1 | 2, character: string, world: string) {
  // Update state with character info
  dispatch({ type: 'SET_CHARACTER', player, character, world });

  // Generate the character stream
  const prompt = buildCharacterPrompt(character, world);
  const streamId = await startStream(prompt, true);
  
  dispatch({ type: 'START_STREAM', player, streamId });

  // Let it run for a few seconds to establish the scene
  await new Promise(resolve => setTimeout(resolve, 4000));

  // End the stream and mark setup complete
  await endStream();
  dispatch({ type: 'END_STREAM', player });
  dispatch({ type: 'COMPLETE_SETUP', player });
}
```

### Exit Conditions
- Both players have completed setup (isSetupComplete: true)
- Automatic transition to BATTLE phase

### Implementation Notes

The COMPLETE_SETUP reducer checks if both players are ready:

```typescript
case 'COMPLETE_SETUP':
  const updatedPlayers = state.players.map(p =>
    p.id === action.player ? { ...p, isSetupComplete: true } : p
  ) as [PlayerState, PlayerState];
  
  const bothReady = updatedPlayers.every(p => p.isSetupComplete);
  
  return {
    ...state,
    players: updatedPlayers,
    // Automatically transition when both ready
    phase: bothReady ? 'battle' : state.phase,
    activePlayer: state.activePlayer === 1 && !bothReady ? 2 : state.activePlayer,
  };
```

---

## Phase 3: BATTLE

### Description

The main gameplay phase. Players take turns describing actions, and the game resolves each action by updating stats and generating visual feedback. The active player's screen may show live video while the inactive player's screen shows a static frame.

### Entry Conditions
- Both players have completed setup
- Phase automatically transitions from SETUP

### State Shape (during battle)
```typescript
{
  phase: 'battle',
  isConnected: true,
  players: [
    { id: 1, isSetupComplete: true, stats: { momentum: 50, ... }, ... },
    { id: 2, isSetupComplete: true, stats: { momentum: 50, ... }, ... }
  ],
  eventLog: [ /* battle events */ ],
  activePlayer: 1,  // Alternates between 1 and 2
  winner: null,
}
```

### UI Elements
- Phone 1: Character video/image + stat bars
- Phone 2: Character video/image + stat bars
- Center HUD: VS indicator, momentum comparison, event log
- Prompt bar: Action input with player selector arrows

### Battle Turn Flow

```
Active player types action → Submit action → 
Calculate stat changes → Update state → 
Add event to log → Animate stat bars → 
Check victory condition → Switch active player → Repeat
```

### Action Resolution

```typescript
async function submitBattleAction(action: string) {
  const playerId = state.activePlayer;
  
  // Generate the action prompt
  const actionPrompt = buildActionPrompt(action);
  
  // Send to Odyssey (optional - depends on if stream is active)
  if (state.isStreaming) {
    await interact(actionPrompt);
  }

  // Calculate stat changes based on action
  const statChanges = calculateStatChanges(action, state);

  // Create event entry
  const event: EventEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    player: playerId,
    action,
    result: generateNarrative(action, statChanges),
    statChanges,
    impactType: determineImpactType(statChanges),
  };

  // Update state
  dispatch({ type: 'RESOLVE_ACTION', event });

  // Check for victory
  const winner = checkVictoryCondition(state);
  if (winner) {
    dispatch({ type: 'DECLARE_WINNER', winner });
  } else {
    dispatch({ type: 'SWITCH_ACTIVE_PLAYER' });
  }
}
```

### Stat Calculation (Simplified)

For the hackathon, we use simple heuristics to calculate stat changes. This can be made more sophisticated later.

```typescript
function calculateStatChanges(action: string, state: ArenaState): EventEntry['statChanges'] {
  const activeId = state.activePlayer;
  const opponentId = activeId === 1 ? 2 : 1;

  // Simple keyword-based calculation
  const actionLower = action.toLowerCase();
  
  let momentumChange = 5 + Math.floor(Math.random() * 10); // 5-15 base
  let energyCost = 10;

  // Boost for dramatic/creative actions
  if (actionLower.includes('ultimate') || actionLower.includes('devastating')) {
    momentumChange += 10;
    energyCost += 10;
  }

  // Defensive actions
  if (actionLower.includes('defend') || actionLower.includes('shield')) {
    momentumChange = Math.floor(momentumChange * 0.5);
    energyCost = Math.floor(energyCost * 0.5);
  }

  return {
    [`player${activeId}`]: {
      momentum: momentumChange,
      energy: -energyCost,
    },
    [`player${opponentId}`]: {
      momentum: -Math.floor(momentumChange * 0.5),
    },
  };
}
```

### Available Actions
- Active player can type and submit actions
- Inactive player waits for their turn
- Either player can view stats and event log

### Exit Conditions
- A player's momentum reaches 100 (winner)
- A player's momentum reaches 0 (loser)
- DECLARE_WINNER action dispatched

---

## Phase 4: VICTORY

### Description

The game has ended with a winner. Display celebration animation, final stats, and option to play again.

### Entry Conditions
- A player's momentum reached 0 or 100
- DECLARE_WINNER action dispatched

### State Shape
```typescript
{
  phase: 'victory',
  winner: 1,  // or 2
  players: [ /* final stats */ ],
  eventLog: [ /* full battle history */ ],
}
```

### UI Elements
- Winner announcement overlay
- Celebration animation
- Final stats comparison
- "Play Again" button
- Event log scrollable for review

### Available Actions
- Click "Play Again" → RESET_GAME → Returns to IDLE

### Exit Conditions
- User clicks "Play Again"

### Implementation Notes

```typescript
// Victory overlay component
function VictoryOverlay({ winner, onPlayAgain }: VictoryOverlayProps) {
  const winnerName = state.players[winner - 1].name;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50"
    >
      <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl text-center">
        <h1 className="text-4xl font-bold">{winnerName} Wins!</h1>
        <button onClick={onPlayAgain} className="mt-4 px-6 py-2 bg-white/30 rounded-lg">
          Play Again
        </button>
      </div>
    </motion.div>
  );
}
```

---

## Phase Transition Guards

Implement guards to prevent invalid state transitions:

```typescript
// src/lib/gameState.ts

export function canTransition(from: GamePhase, to: GamePhase, state: ArenaState): boolean {
  switch (`${from}->${to}`) {
    case 'idle->setup':
      return state.isConnected;
    case 'setup->battle':
      return state.players.every(p => p.isSetupComplete);
    case 'battle->victory':
      return checkVictoryCondition(state) !== null;
    case 'victory->idle':
      return true; // Always allow reset
    default:
      return false;
  }
}
```

---

## Demo Script (Rehearse This)

For the hackathon demo, follow this exact script:

1. **Start** (0:00) - Click "Start Game"
2. **Player 1 Setup** (0:10) - Enter "A cyberpunk samurai" in "A neon-lit Tokyo street"
3. **Player 2 Setup** (0:30) - Enter "An ancient dragon mage" in "A floating crystal palace"
4. **Battle Round 1** (0:50) - P1: "Unleashes a devastating plasma blade attack"
5. **Battle Round 2** (1:00) - P2: "Summons a storm of crystalline shards"
6. **Battle Round 3** (1:10) - P1: "Channels the city's power grid into pure energy"
7. **Victory** (1:20) - Show winner, briefly discuss what could be next
8. **End** (1:30) - Total demo time: 90 seconds

---

## Checklist

- [ ] Implement phase transition logic in reducer
- [ ] Create UI states for each phase
- [ ] Add transition guards
- [ ] Implement setup flow with character generation
- [ ] Implement battle flow with action resolution
- [ ] Create victory overlay component
- [ ] Test full game loop from idle to victory to reset
- [ ] Practice demo script until it's smooth
