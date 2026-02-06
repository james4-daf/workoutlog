# Workout App - Complete Setup Guide

## 📋 Project Setup Steps

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details (name, database password, region)
   - Wait for project to be ready (~2 minutes)

2. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy your:
     - Project URL (e.g., `https://xxxxx.supabase.co`)
     - Anon/public key (starts with `eyJ...`)

3. **Set Up Environment Variables**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
     ```

4. **Run Database Setup SQL**
   - In Supabase Dashboard, go to SQL Editor
   - Copy the contents of `supabase-setup.sql`
   - Paste and run the SQL script
   - This creates the `exercises` table, enables RLS, and sets up security policies

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

## 🗄️ Database Schema

The `exercises` table has the following structure:

- `id` (uuid, primary key) - Auto-generated UUID
- `user_id` (uuid) - References `auth.users(id)`, cascades on delete
- `name` (text, required) - Exercise name
- `muscle_group` (text, optional) - Target muscle group
- `equipment` (text, optional) - Required equipment
- `notes` (text, optional) - Additional notes
- `created_at` (timestamptz) - Creation timestamp

## 🔒 Security (RLS Policies)

Row Level Security (RLS) is enabled with the following policies:

- **SELECT**: Users can only view their own exercises (`user_id = auth.uid()`)
- **INSERT**: Users can only insert exercises with their own `user_id`
- **UPDATE**: Users can only update their own exercises
- **DELETE**: Users can only delete their own exercises

**Important**: The `user_id` is always set server-side from `auth.uid()`. Never accept `user_id` from the client.

## 📁 Project Structure

```
workoutlog/
├── app/
│   ├── exercises/        # Exercises page (protected)
│   │   └── page.tsx
│   ├── login/            # Sign in page
│   │   └── page.tsx
│   ├── signup/           # Sign up page
│   │   └── page.tsx
│   ├── layout.tsx        # Root layout with Nav
│   ├── page.tsx          # Home page (redirects if logged in)
│   └── globals.css       # Global styles
├── src/
│   ├── actions/
│   │   ├── auth.ts       # Auth server actions (signIn, signUp, signOut)
│   │   └── exercises.ts  # Exercise server actions (create, delete)
│   ├── components/
│   │   ├── AuthForm.tsx  # Reusable auth form component
│   │   ├── ExerciseForm.tsx # Exercise creation form
│   │   └── Nav.tsx       # Navigation component
│   └── lib/
│       ├── auth.ts       # Auth helpers (getUser, requireAuth)
│       └── supabase/
│           ├── browser.ts # Browser Supabase client
│           └── server.ts  # Server Supabase client
├── supabase-setup.sql    # Database setup SQL
├── .env.example          # Environment variables template
└── README.md             # Project documentation
```

## 🔑 Environment Variables

Required for Vercel deployment:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Supabase Dashboard > Settings > API |

## ✅ Features Implemented

- ✅ Email/password authentication (sign up, sign in, sign out)
- ✅ Protected routes (unauthenticated users redirected to `/login`)
- ✅ Create custom exercises with name, muscle group, equipment, notes
- ✅ View list of user's exercises (newest first)
- ✅ Delete exercises
- ✅ Row-level security (users can only access their own data)
- ✅ Error handling and form validation
- ✅ Loading states
- ✅ Responsive design with Tailwind CSS
- ✅ Server-side rendering with Next.js App Router
- ✅ Cookie-based sessions with Supabase SSR

## 🚀 Next Steps (Optional Enhancements)

- Add exercise editing functionality
- Add workout logging (track sets, reps, weight)
- Add exercise search/filter
- Add muscle group filtering
- Add exercise templates
- Add workout history/analytics

