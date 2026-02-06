-- Workout Logging Tables Only
-- Run this SQL if you've already created the exercises table
-- This will skip creating tables that already exist

-- Create workouts table (skip if exists)
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create workout_sets table (skip if exists)
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  reps integer,
  weight numeric(6, 2),
  duration_seconds integer,
  distance_meters numeric(8, 2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security for workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON public.workouts;

DROP POLICY IF EXISTS "Users can view their own workout sets" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can insert their own workout sets" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can update their own workout sets" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can delete their own workout sets" ON public.workout_sets;

-- Workouts policies
CREATE POLICY "Users can view their own workouts"
  ON public.workouts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON public.workouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON public.workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Workout sets policies
CREATE POLICY "Users can view their own workout sets"
  ON public.workout_sets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workout sets"
  ON public.workout_sets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout sets"
  ON public.workout_sets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout sets"
  ON public.workout_sets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_sets.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Create indexes (skip if exists)
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_workout_date_idx ON public.workouts(workout_date DESC);
CREATE INDEX IF NOT EXISTS workout_sets_workout_id_idx ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS workout_sets_exercise_id_idx ON public.workout_sets(exercise_id);

