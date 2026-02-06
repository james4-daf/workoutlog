-- Notes app: folders + notes with optional note_date
-- Run in Supabase SQL Editor after auth is set up

CREATE TABLE public.note_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.note_folders(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  note_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- note_folders policies
CREATE POLICY "Users can view own note_folders"
  ON public.note_folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own note_folders"
  ON public.note_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own note_folders"
  ON public.note_folders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own note_folders"
  ON public.note_folders
  FOR DELETE
  USING (auth.uid() = user_id);

-- notes policies
CREATE POLICY "Users can view own notes"
  ON public.notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX note_folders_user_id_idx ON public.note_folders(user_id);
CREATE INDEX note_folders_sort_order_idx ON public.note_folders(user_id, sort_order);
CREATE INDEX notes_user_id_idx ON public.notes(user_id);
CREATE INDEX notes_folder_id_idx ON public.notes(folder_id);
CREATE INDEX notes_updated_at_idx ON public.notes(updated_at DESC);
