# Workout App

A production-ready MVP workout tracking app built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Email/password authentication with Supabase
- 💪 Create and manage custom exercises
- 🔒 Row-level security (RLS) ensures users can only access their own data
- 📱 Responsive design with Tailwind CSS
- ⚡ Server-side rendering with Next.js App Router

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

4. Run the SQL script below in your Supabase SQL Editor to create the database schema and RLS policies.

### 3. Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create exercises table
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  muscle_group text,
  equipment text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own exercises"
  ON public.exercises
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises"
  ON public.exercises
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises"
  ON public.exercises
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises"
  ON public.exercises
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX exercises_user_id_idx ON public.exercises(user_id);
CREATE INDEX exercises_created_at_idx ON public.exercises(created_at DESC);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create PWA Icons

Before deploying, create PWA icons (see `PWA_SETUP.md` for details):

1. Create `icon-192.png` (192x192 pixels) 
2. Create `icon-512.png` (512x512 pixels)
3. Place both in `/public` directory

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app will be available as a PWA - users can install it on their mobile devices!

## Environment Variables

Required environment variables for Vercel deployment:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## Project Structure

```
/app
  /login          - Sign in page
  /signup         - Sign up page
  /exercises      - Exercises list and creation
/src
  /lib
    /supabase     - Supabase client utilities
    auth.ts       - Auth helpers
  /actions        - Server actions for auth and exercises
  /components     - React components
```

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **@supabase/ssr** - Server-side rendering support
- **PWA** - Progressive Web App support for mobile installation

## PWA Features

This app is a Progressive Web App (PWA) that can be installed on mobile devices:

- ✅ **Installable** - Add to home screen on iOS and Android
- ✅ **Standalone Mode** - Launches in full screen without browser UI
- ✅ **Offline Support** - Basic service worker caching
- ✅ **Mobile Optimized** - Touch-friendly with safe area support for notches
- ✅ **Responsive Design** - Works seamlessly on all screen sizes

### Setting Up PWA Icons

Before deploying, you need to create PWA icons:

1. Create `icon-192.png` (192x192 pixels)
2. Create `icon-512.png` (512x512 pixels)
3. Place both files in the `/public` directory

See `PWA_SETUP.md` for detailed instructions and icon generation tools.
