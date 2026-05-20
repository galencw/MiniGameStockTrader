import { useReducer, useCallback } from 'react';
import type { GameState, GameAction } from './game/types';
import { createInitialState, applyAction } from './game';
import StartScreen from './screens/StartScreen';
import GameScreen from './screens/GameScreen';
import EndScreen from './screens/EndScreen';

function gameReducer(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === 'START_GAME') {
    // Create fresh initial state
    return createInitialState(action.seed);
  }

  if (state === null) {
    // No game state yet, create one with START_GAME
    return createInitialState();
  }

  // Apply the action to current state
  return applyAction(state, action);
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, null);

  const handleStartGame = useCallback((seed?: number) => {
    dispatch({ type: 'START_GAME', seed });
  }, []);

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  // Route based on game phase
  if (state === null || state.phase === 'setup') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  if (state.phase === 'finished') {
    return <EndScreen state={state} onPlayAgain={handlePlayAgain} />;
  }

  // phase === 'playing'
  return <GameScreen state={state} dispatch={dispatch} />;
}

export default App;