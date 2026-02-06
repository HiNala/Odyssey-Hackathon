# MISSION 03: Game Logic & State Management

## Mission Objective

Implement the complete game state system, including the state machine for game phases, player data management, action resolution, and the scoring system. By the end of this mission, the game should flow from setup through battle to victory with proper state transitions.

This mission connects the Odyssey integration with actual gameplay mechanics.

---

## Time Estimate

**45-60 minutes**

---

## Prerequisites

Before starting, ensure you have:
- Mission 01 completed (static UI)
- Mission 02 completed (Odyssey integration working)
- Understanding of React useReducer pattern
- Read `docs/game-logic/01-game-state.md`

---

## Detailed Instructions

### Phase 1: Define Type System

Create the comprehensive type definitions that will be used throughout the application. These types are the foundation of type-safe game development and should be defined before any implementation.

Create `types/game.ts` with:
- `PlayerStats` interface (momentum, power, defense, energy)
- `PlayerState` interface (id, name, character, world, stats, streaming state)
- `EventEntry` interface (action log entries)
- `GamePhase` type ('idle' | 'setup' | 'battle' | 'victory')
- `ArenaState` interface (full game state)
- `GameAction` discriminated union (all possible state actions)

Export all types for use throughout the application.

**What to verify:**
- All types compile without errors
- Types are comprehensive enough for the game
- No `any` types used

---

### Phase 2: Implement State Reducer

Create the game state reducer that handles all state transitions. This is the heart of the game logic — every user action and game event flows through this reducer.

Create `lib/gameState.ts` with:
- `createInitialState()` — Factory for fresh game state
- `gameReducer(state, action)` — Main reducer function
- Helper functions for state updates

The reducer should handle these action types:
- `CONNECT` / `DISCONNECT` — Connection state
- `SET_PLAYER_NAME` — Update player name
- `SET_CHARACTER` — Set character and world descriptions
- `START_STREAM` / `END_STREAM` — Stream state
- `COMPLETE_SETUP` — Mark player as ready
- `START_BATTLE` — Transition to battle phase
- `RESOLVE_ACTION` — Process battle action
- `SWITCH_ACTIVE_PLAYER` — Toggle active player
- `DECLARE_WINNER` — End game with winner
- `RESET_GAME` — Start over

**What to verify:**
- All action types are handled
- State transitions are correct
- No mutations of existing state

---

### Phase 3: Create Game Context

Create a React context to provide game state throughout the component tree. This avoids prop drilling and centralizes state access.

Create `context/GameContext.tsx` with:
- `GameContext` — The React context
- `GameProvider` — Provider component with useReducer
- `useGame()` — Custom hook for consuming context

The provider should:
- Initialize state with `createInitialState()`
- Provide `state` and `dispatch` to children
- Optionally memoize context value

**What to verify:**
- Context can be consumed in child components
- State updates trigger re-renders
- No unnecessary re-renders (optional optimization)

---

### Phase 4: Implement Scoring System

Create the scoring logic that determines stat changes from battle actions. This system analyzes player input and calculates appropriate momentum changes.

Create `lib/scoring.ts` with:
- `analyzeAction(action)` — Parse action for keywords
- `calculateStatChanges(action, state)` — Compute stat deltas
- `determineImpactType(momentum)` — Classify the impact
- `generateNarrative(action, impact)` — Create event text
- `checkVictory(state)` — Check win conditions

The scoring should reward creative, dramatic actions with larger momentum swings.

**What to verify:**
- Different actions produce different results
- Momentum changes are reasonable (5-25 range typically)
- Victory detection works correctly

---

### Phase 5: Create Game Flow Hook

Create a high-level hook that orchestrates game flow, combining game state, Odyssey connection, and user actions into a cohesive interface.

Create `hooks/useGameFlow.ts` with:
- Integration with `useGame()` context
- Integration with `useOdysseyConnection()`
- High-level methods:
  - `startGame()` — Connect and begin setup
  - `submitCharacter(player, character, world)` — Setup a player
  - `submitAction(action)` — Process battle action
  - `reset()` — Reset the game

This hook encapsulates the complexity of coordinating state and streams.

**What to verify:**
- Methods work correctly
- State and Odyssey stay synchronized
- Error handling is consistent

---

### Phase 6: Implement Setup Flow

Implement the setup phase where players define their characters and worlds. This involves collecting input and generating initial streams.

The setup flow:
1. Display input fields for Player 1
2. Player 1 submits character + world
3. Generate brief stream for Player 1 (4-5 seconds)
4. Store stream ID, mark Player 1 complete
5. Repeat for Player 2
6. Auto-transition to battle when both complete

Handle the single-stream limitation:
- Only one stream active at a time
- End Player 1's stream before starting Player 2's
- Store a frame or rely on Odyssey's last frame

**What to verify:**
- Setup can complete for both players
- No stream conflicts
- Phase transitions correctly to battle

---

### Phase 7: Implement Battle Flow

Implement the battle phase where players alternate submitting actions. Each action should:
1. Be analyzed for keywords
2. Generate stat changes
3. Create an event log entry
4. Update the state
5. Optionally send to Odyssey for visual feedback
6. Check for victory
7. Switch active player (if no victory)

The active player indicator should update correctly, and only the active player should be able to submit.

**What to verify:**
- Actions produce stat changes
- Active player alternates
- Event log populates correctly
- Victory triggers at correct threshold

---

### Phase 8: Implement Victory Handling

Implement the victory phase that triggers when momentum reaches 0 or 100. This includes:
- Detecting the winner
- Transitioning to victory phase
- Displaying winner announcement
- Providing reset option

The victory detection should happen immediately after action resolution.

**What to verify:**
- Victory triggers correctly
- Winner is identified correctly
- Reset returns to idle phase

---

### Phase 9: Connect State to UI

Update all UI components to consume game state from context and display appropriate content:

**PhoneScreen updates:**
- Display actual character/world names
- Show real stat values
- Indicate active player with visual highlight

**CenterHUD updates:**
- Show real momentum values in bars
- Display actual events from event log
- Update VS badge based on phase

**PromptBar updates:**
- Enable/disable based on phase
- Highlight selected player
- Submit to correct handler

**Page updates:**
- Wrap in GameProvider
- Handle phase-specific rendering
- Show victory overlay when appropriate

**What to verify:**
- All data displays correctly
- UI responds to state changes
- No stale data displayed

---

### Phase 10: Add Phase-Specific UI

Implement different UI states for each game phase:

**Idle phase:**
- Welcome message
- "Start Game" button
- Basic instructions

**Setup phase:**
- Character input for active player
- "Waiting..." message for other player
- Progress indication

**Battle phase:**
- Full game UI
- Action input enabled for active player
- Disabled for waiting player

**Victory phase:**
- Winner announcement overlay
- Final stats display
- "Play Again" button

**What to verify:**
- Each phase looks distinct
- Transitions are smooth
- No UI elements from wrong phase showing

---

## Deliverables Checklist

At the end of Mission 03, you should have:

### Files Created
- [ ] `types/game.ts` - All type definitions
- [ ] `lib/gameState.ts` - Reducer and state helpers
- [ ] `lib/scoring.ts` - Scoring system
- [ ] `context/GameContext.tsx` - State context
- [ ] `hooks/useGameFlow.ts` - Game orchestration hook

### Components Updated
- [ ] `PhoneScreen.tsx` - Shows real player data
- [ ] `CenterHUD.tsx` - Shows real momentum and events
- [ ] `PromptBar.tsx` - Connected to game actions
- [ ] `page.tsx` - Wrapped in provider, phase handling

### Functionality Working
- [ ] Game starts when clicking "Start Game"
- [ ] Can complete setup for both players
- [ ] Battle phase allows alternating actions
- [ ] Stats update based on actions
- [ ] Event log shows action results
- [ ] Victory triggers correctly
- [ ] Reset works properly

### Technical Verification
- [ ] No TypeScript errors
- [ ] State updates are immutable
- [ ] No unnecessary re-renders
- [ ] Victory detection is accurate

---

## Cursor Coding Model Instructions

**ATTENTION CURSOR:** When executing this mission, follow these steps precisely:

1. **Review documentation:**
   - Read `docs/game-logic/01-game-state.md` thoroughly
   - Read `docs/game-logic/03-game-flow.md` for phase logic
   - Read `docs/game-logic/04-scoring-system.md` for scoring

2. **Create type definitions first** (`types/game.ts`):
   - Define all interfaces and types
   - Export everything
   - No implementation yet

3. **Create state management** (`lib/gameState.ts`):
   - Implement createInitialState
   - Implement gameReducer with all cases
   - Add helper functions

4. **Create scoring system** (`lib/scoring.ts`):
   - Implement action analysis
   - Implement stat calculation
   - Implement narrative generation

5. **Create context** (`context/GameContext.tsx`):
   - Create context with proper types
   - Create provider with useReducer
   - Create useGame hook

6. **Create game flow hook** (`hooks/useGameFlow.ts`):
   - Combine game context and Odyssey connection
   - Implement high-level game methods
   - Handle error cases

7. **Update components:**
   - PhoneScreen: Connect to player state
   - CenterHUD: Connect to game state
   - PromptBar: Connect to actions
   - page.tsx: Add provider and phase logic

8. **Test the full flow:**
   - Start game
   - Complete both player setups
   - Execute several battle turns
   - Trigger victory
   - Reset and repeat

9. **Run checks:**
   ```bash
   npm run lint
   npm run build
   ```

10. **Do NOT proceed to Mission 04** until the full game loop works.

---

## Troubleshooting

### Common Issues

**State not updating:**
- Ensure dispatch is being called
- Check action type spelling exactly
- Verify reducer handles the action type
- Look for state mutations (should create new objects)

**Context is undefined:**
- Ensure component is wrapped in GameProvider
- Check useGame is called inside provider

**Victory not triggering:**
- Check momentum thresholds (0 and 100)
- Verify checkVictory is called after action resolution
- Log stat values to debug

**Wrong player active:**
- Verify SWITCH_ACTIVE_PLAYER is dispatched
- Check activePlayer is used correctly in UI
- Ensure switch happens after action, not before

**Setup phase stuck:**
- Check COMPLETE_SETUP is dispatched
- Verify both players marked complete before transition
- Log phase changes to debug

---

## Testing Scenarios

Test these scenarios to verify the implementation:

1. **Quick victory:** Use devastating actions to reach 100 momentum fast
2. **Drawn-out battle:** Use weak actions to see gradual momentum shift
3. **Comeback:** Start losing, then win with strong actions
4. **Reset mid-battle:** Reset during battle, verify clean state
5. **Setup cancel:** Disconnect during setup, verify recovery

---

## Success Criteria

This mission is complete when:
1. Full game loop works (idle → setup → battle → victory → reset)
2. Stats update correctly from actions
3. Event log shows meaningful entries
4. Victory triggers at correct threshold
5. All UI reflects current game state
6. No state-related bugs or crashes
