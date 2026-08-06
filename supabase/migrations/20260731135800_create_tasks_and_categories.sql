/*
# Create tasks and categories tables (multi-user, owner-scoped)

1. New Tables
- `categories`
  - `id` (text, primary key) — client-generated stable id (e.g. "prace", "osobni")
  - `name` (text, not null) — display name
  - `color` (text, not null) — hex color
  - `user_id` (uuid, not null, defaults to auth.uid()) — owner
  - `created_at` (timestamptz)
- `tasks`
  - `id` (text, primary key) — client-generated stable id
  - `title` (text, not null)
  - `description` (text, default '')
  - `category` (text) — references categories.id (soft reference, no FK since client ids)
  - `priority` (text, not null, default 'medium') — 'high' | 'medium' | 'low'
  - `due_date` (timestamptz, nullable)
  - `subtasks` (jsonb, default '[]') — array of {id, title, done}
  - `recurrence` (text, not null, default 'once') — 'once' | 'daily' | 'weekly' | 'monthly'
  - `done` (boolean, not null, default false)
  - `pinned` (boolean, not null, default false)
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)

2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: each authenticated user can only access rows they own (user_id = auth.uid()).
- user_id defaults to auth.uid() so inserts that omit it still pass the WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categories" ON categories;
CREATE POLICY "select_own_categories" ON categories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text,
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  subtasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  recurrence text NOT NULL DEFAULT 'once',
  done boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
