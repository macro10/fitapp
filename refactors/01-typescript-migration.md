# Refactor: Move to TypeScript

**Priority:** High Impact | High Effort
**Do first if:** Planning significant feature work

## Current State

Pure JavaScript with no type safety for API responses, context values, or component props.

## Why It Matters

- The app has complex nested data structures (`performed_exercises[].reps_per_set[]`, `weights_per_set[]`)
- Multiple contexts passing different shapes of data
- Refactoring is risky without type checking
- Easy to confuse `exercise` (the ID) vs `exercise` (the object)

## Recommended Approach

Create a types directory with domain types:

```
frontend/src/
├── types/
│   ├── exercise.ts      # Exercise, MuscleGroup
│   ├── workout.ts       # Workout, PerformedExercise, SetData
│   ├── analytics.ts     # WeeklyVolume, TopWorkout, etc.
│   └── api.ts           # API response types
```

### Example Types

```typescript
// types/exercise.ts
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';

export interface Exercise {
  id: number;
  name: string;
  muscle_group: MuscleGroup;
  is_custom: boolean;
  owner?: number;
  force?: 'static' | 'pull' | 'push';
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic?: 'isolation' | 'compound';
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

// types/workout.ts
export interface SetData {
  reps: number;
  weight: number;
}

export interface PerformedExercise {
  id?: number;
  exercise: number; // exercise ID
  sets: number;
  reps_per_set: number[];
  weights_per_set: number[];
}

export interface Workout {
  id: number;
  date: string;
  name: string;
  total_volume: number;
  performed_exercises?: PerformedExercise[];
}

// types/analytics.ts
export interface WeeklyVolumeData {
  week: string;
  avgVolumePerWorkout: number;
  totalVolume: number;
  workoutCount: number;
}

export interface TopWorkout {
  id: number;
  date: string;
  name: string;
  total_volume: number;
  exercise_count: number;
}
```

## Migration Steps

1. Install TypeScript and types:
   ```bash
   cd frontend
   npm install --save-dev typescript @types/react @types/react-dom @types/node
   ```

2. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true,
       "strict": true,
       "forceConsistentCasingInFileNames": true,
       "noFallthroughCasesInSwitch": true,
       "module": "esnext",
       "moduleResolution": "node",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx"
     },
     "include": ["src"]
   }
   ```

3. Rename files incrementally (`.js` → `.ts`, `.jsx` → `.tsx`)

4. Start with leaf files (types, utils, api) then work up to components

## Files to Migrate First

1. `src/types/` (create new)
2. `src/api.js` → `src/api.ts`
3. `src/apiClient.js` → `src/apiClient.ts`
4. `src/lib/utils.js` → `src/lib/utils.ts`
5. `src/constants/workout.js` → `src/constants/workout.ts`
6. Hooks (one at a time)
7. Contexts (one at a time)
8. Components (leaf → root)

## Benefits After Migration

- Autocomplete for API responses
- Catch type mismatches at build time
- Safer refactoring
- Self-documenting code
- Better IDE support
