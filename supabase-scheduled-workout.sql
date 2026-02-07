-- Scheduled workout (one per user: list of exercise names to do next)
-- Run after supabase-workouts.sql

CREATE TABLE public.scheduled_workouts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_names jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled workout"
  ON public.scheduled_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled workout"
  ON public.scheduled_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled workout"
  ON public.scheduled_workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled workout"
  ON public.scheduled_workouts FOR DELETE
  USING (auth.uid() = user_id);
