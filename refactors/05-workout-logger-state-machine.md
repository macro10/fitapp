# Refactor: Extract Workout Logger State Machine

**Priority:** Medium Impact | Medium Effort
**Do first if:** Adding complex flows (supersets, workout templates, rest-pause sets)

## Current State

The workout logging flow spans multiple files with implicit states:

### Files Involved
- `useWorkoutLogger.js` - Main workout state (exercises, name)
- `useExerciseLogger.js` - Current exercise being logged
- `WorkoutLoggerPage.jsx` - Orchestrates the flow
- `ExerciseSelectorPage.jsx` - Exercise selection
- `SetLogger.jsx` - Individual set input
- `ReviewStep.jsx` - Review sets before confirming

### localStorage Keys
- `WORKOUT_STORAGE_KEY` - In-progress workout
- `CURRENT_EXERCISE_STORAGE_KEY` - Current exercise being logged
- `REST_TIMER_KEY` - Rest timer state

### Implicit Flow
```
Home → [+ button] → ExerciseSelector → SetLogger → (loop: add sets) →
ReviewSets → WorkoutSummary → (loop: add more exercises) → Finish → Home
```

## Problems

1. **Implicit states:** Hard to understand all possible states and transitions
2. **Scattered logic:** State management spread across hooks and components
3. **Hard to extend:** Adding supersets or templates requires touching many files
4. **Edge cases:** What happens if user navigates away mid-set? Refreshes?
5. **Testing:** Hard to test the flow without integration tests

## Recommended Solution

Model the workout flow as an explicit state machine.

### Option A: Simple Reducer Pattern

```javascript
// hooks/useWorkoutFlow.js

const STATES = {
  IDLE: 'idle',
  SELECTING_EXERCISE: 'selectingExercise',
  LOGGING_SETS: 'loggingSets',
  REVIEWING_SETS: 'reviewingSets',
  REVIEWING_WORKOUT: 'reviewingWorkout',
  SAVING: 'saving',
};

const ACTIONS = {
  START_WORKOUT: 'START_WORKOUT',
  SELECT_EXERCISE: 'SELECT_EXERCISE',
  CANCEL_EXERCISE: 'CANCEL_EXERCISE',
  ADD_SET: 'ADD_SET',
  REMOVE_SET: 'REMOVE_SET',
  FINISH_SETS: 'FINISH_SETS',
  CONFIRM_EXERCISE: 'CONFIRM_EXERCISE',
  ADD_MORE_SETS: 'ADD_MORE_SETS',
  ADD_ANOTHER_EXERCISE: 'ADD_ANOTHER_EXERCISE',
  REMOVE_EXERCISE: 'REMOVE_EXERCISE',
  FINISH_WORKOUT: 'FINISH_WORKOUT',
  SAVE_SUCCESS: 'SAVE_SUCCESS',
  SAVE_ERROR: 'SAVE_ERROR',
  CANCEL_WORKOUT: 'CANCEL_WORKOUT',
};

const initialState = {
  status: STATES.IDLE,
  workoutName: 'Untitled Workout',
  isCustomName: false,
  completedExercises: [],
  currentExercise: null,
  currentSets: [],
  error: null,
};

function workoutReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_WORKOUT:
      return {
        ...state,
        status: STATES.SELECTING_EXERCISE,
      };

    case ACTIONS.SELECT_EXERCISE:
      return {
        ...state,
        status: STATES.LOGGING_SETS,
        currentExercise: action.payload.exercise,
        currentSets: [],
      };

    case ACTIONS.ADD_SET:
      return {
        ...state,
        currentSets: [...state.currentSets, action.payload.set],
      };

    case ACTIONS.REMOVE_SET:
      return {
        ...state,
        currentSets: state.currentSets.filter((_, i) => i !== action.payload.index),
      };

    case ACTIONS.FINISH_SETS:
      if (state.currentSets.length === 0) {
        return {
          ...state,
          status: STATES.REVIEWING_WORKOUT,
          currentExercise: null,
        };
      }
      return {
        ...state,
        status: STATES.REVIEWING_SETS,
      };

    case ACTIONS.ADD_MORE_SETS:
      return {
        ...state,
        status: STATES.LOGGING_SETS,
      };

    case ACTIONS.CONFIRM_EXERCISE:
      const newExercise = {
        id: crypto.randomUUID(),
        exercise: state.currentExercise.id,
        sets: state.currentSets.length,
        reps_per_set: state.currentSets.map(s => s.reps),
        weights_per_set: state.currentSets.map(s => s.weight),
      };
      return {
        ...state,
        status: STATES.REVIEWING_WORKOUT,
        completedExercises: [...state.completedExercises, newExercise],
        currentExercise: null,
        currentSets: [],
      };

    case ACTIONS.REMOVE_EXERCISE:
      return {
        ...state,
        completedExercises: state.completedExercises.filter(
          (_, i) => i !== action.payload.index
        ),
      };

    case ACTIONS.ADD_ANOTHER_EXERCISE:
      return {
        ...state,
        status: STATES.SELECTING_EXERCISE,
      };

    case ACTIONS.FINISH_WORKOUT:
      return {
        ...state,
        status: STATES.SAVING,
        error: null,
      };

    case ACTIONS.SAVE_SUCCESS:
      return initialState;

    case ACTIONS.SAVE_ERROR:
      return {
        ...state,
        status: STATES.REVIEWING_WORKOUT,
        error: action.payload.error,
      };

    case ACTIONS.CANCEL_WORKOUT:
      return initialState;

    case ACTIONS.CANCEL_EXERCISE:
      return {
        ...state,
        status: state.completedExercises.length > 0
          ? STATES.REVIEWING_WORKOUT
          : STATES.IDLE,
        currentExercise: null,
        currentSets: [],
      };

    default:
      return state;
  }
}

export function useWorkoutFlow() {
  const [state, dispatch] = useReducer(workoutReducer, initialState, () => {
    // Restore from localStorage on init
    const saved = localStorage.getItem('workout_flow_state');
    return saved ? JSON.parse(saved) : initialState;
  });

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem('workout_flow_state', JSON.stringify(state));
  }, [state]);

  // Action creators
  const actions = useMemo(() => ({
    startWorkout: () => dispatch({ type: ACTIONS.START_WORKOUT }),
    selectExercise: (exercise) => dispatch({ type: ACTIONS.SELECT_EXERCISE, payload: { exercise } }),
    addSet: (set) => dispatch({ type: ACTIONS.ADD_SET, payload: { set } }),
    removeSet: (index) => dispatch({ type: ACTIONS.REMOVE_SET, payload: { index } }),
    finishSets: () => dispatch({ type: ACTIONS.FINISH_SETS }),
    addMoreSets: () => dispatch({ type: ACTIONS.ADD_MORE_SETS }),
    confirmExercise: () => dispatch({ type: ACTIONS.CONFIRM_EXERCISE }),
    removeExercise: (index) => dispatch({ type: ACTIONS.REMOVE_EXERCISE, payload: { index } }),
    addAnotherExercise: () => dispatch({ type: ACTIONS.ADD_ANOTHER_EXERCISE }),
    finishWorkout: () => dispatch({ type: ACTIONS.FINISH_WORKOUT }),
    saveSuccess: () => dispatch({ type: ACTIONS.SAVE_SUCCESS }),
    saveError: (error) => dispatch({ type: ACTIONS.SAVE_ERROR, payload: { error } }),
    cancelWorkout: () => dispatch({ type: ACTIONS.CANCEL_WORKOUT }),
    cancelExercise: () => dispatch({ type: ACTIONS.CANCEL_EXERCISE }),
  }), []);

  return { state, actions, STATES };
}
```

### Option B: XState (More Robust)

For complex flows, consider XState:

```bash
npm install xstate @xstate/react
```

```javascript
// machines/workoutMachine.js
import { createMachine, assign } from 'xstate';

export const workoutMachine = createMachine({
  id: 'workout',
  initial: 'idle',
  context: {
    workoutName: 'Untitled Workout',
    completedExercises: [],
    currentExercise: null,
    currentSets: [],
    error: null,
  },
  states: {
    idle: {
      on: { START: 'selectingExercise' },
    },
    selectingExercise: {
      on: {
        SELECT: {
          target: 'loggingSets',
          actions: assign({ currentExercise: (_, event) => event.exercise }),
        },
        CANCEL: [
          { target: 'reviewingWorkout', cond: 'hasExercises' },
          { target: 'idle' },
        ],
      },
    },
    loggingSets: {
      on: {
        ADD_SET: {
          actions: assign({
            currentSets: (ctx, event) => [...ctx.currentSets, event.set],
          }),
        },
        DONE: [
          { target: 'reviewingSets', cond: 'hasSets' },
          { target: 'reviewingWorkout' },
        ],
      },
    },
    reviewingSets: {
      on: {
        CONFIRM: {
          target: 'reviewingWorkout',
          actions: 'addExerciseToWorkout',
        },
        ADD_MORE: 'loggingSets',
        REMOVE_SET: {
          actions: assign({
            currentSets: (ctx, event) =>
              ctx.currentSets.filter((_, i) => i !== event.index),
          }),
        },
      },
    },
    reviewingWorkout: {
      on: {
        ADD_EXERCISE: 'selectingExercise',
        REMOVE_EXERCISE: {
          actions: assign({
            completedExercises: (ctx, event) =>
              ctx.completedExercises.filter((_, i) => i !== event.index),
          }),
        },
        FINISH: 'saving',
        CANCEL: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
    },
    saving: {
      invoke: {
        src: 'saveWorkout',
        onDone: {
          target: 'idle',
          actions: 'resetWorkout',
        },
        onError: {
          target: 'reviewingWorkout',
          actions: assign({ error: (_, event) => event.data.message }),
        },
      },
    },
  },
}, {
  guards: {
    hasExercises: (ctx) => ctx.completedExercises.length > 0,
    hasSets: (ctx) => ctx.currentSets.length > 0,
  },
  actions: {
    addExerciseToWorkout: assign((ctx) => ({
      completedExercises: [
        ...ctx.completedExercises,
        {
          id: crypto.randomUUID(),
          exercise: ctx.currentExercise.id,
          sets: ctx.currentSets.length,
          reps_per_set: ctx.currentSets.map(s => s.reps),
          weights_per_set: ctx.currentSets.map(s => s.weight),
        },
      ],
      currentExercise: null,
      currentSets: [],
    })),
    resetWorkout: assign({
      workoutName: 'Untitled Workout',
      completedExercises: [],
      currentExercise: null,
      currentSets: [],
      error: null,
    }),
  },
});
```

### Usage in Component

```javascript
// components/WorkoutFlow.jsx
import { useMachine } from '@xstate/react';
import { workoutMachine } from '../machines/workoutMachine';

export function WorkoutFlow() {
  const [state, send] = useMachine(workoutMachine);

  // Render based on state
  switch (state.value) {
    case 'idle':
      return <StartWorkoutButton onClick={() => send('START')} />;

    case 'selectingExercise':
      return (
        <ExerciseSelector
          onSelect={(exercise) => send({ type: 'SELECT', exercise })}
          onCancel={() => send('CANCEL')}
        />
      );

    case 'loggingSets':
      return (
        <SetLogger
          exercise={state.context.currentExercise}
          setNumber={state.context.currentSets.length + 1}
          onAddSet={(set) => send({ type: 'ADD_SET', set })}
          onDone={() => send('DONE')}
        />
      );

    // ... etc
  }
}
```

## Benefits

1. **Explicit states:** Can see all possible states at a glance
2. **Predictable transitions:** Only defined transitions are possible
3. **Easier testing:** Test state machine separately from UI
4. **Visualizable:** XState has a visualizer tool
5. **Extensible:** Adding supersets = adding new states/transitions
6. **Single source of truth:** No scattered state across multiple files

## Migration Steps

1. Create `useWorkoutFlow.js` (or XState machine)
2. Add localStorage persistence
3. Update `WorkoutLoggerPage.jsx` to use new hook
4. Remove `useExerciseLogger.js` (absorbed into flow)
5. Simplify `useWorkoutLogger.js` (or remove)
6. Update child components to receive actions as props
7. Remove old localStorage keys
8. Add tests for state machine

## Future Extensions

With a state machine, adding new features becomes state additions:

```javascript
// Superset support
supersetMode: {
  on: {
    ADD_EXERCISE: { actions: 'addToSuperset' },
    FINISH_SUPERSET: 'loggingSupersetSets',
  },
},

// Rest-pause sets
restPauseMode: {
  on: {
    ADD_MINI_SET: { actions: 'addMiniSet' },
    FINISH_REST_PAUSE: 'reviewingSets',
  },
},

// Workout templates
selectingTemplate: {
  on: {
    SELECT_TEMPLATE: {
      target: 'reviewingWorkout',
      actions: 'loadTemplate',
    },
  },
},
```
