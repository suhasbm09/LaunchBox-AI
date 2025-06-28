/*
  # LaunchBox.AI Database Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `type` (enum, not null)
      - `user_id` (uuid, references auth.users)
      - `status` (text, default 'active')
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())
    
    - `newsletter_subscriptions`
      - `id` (uuid, primary key) 
      - `email` (text, unique, not null)
      - `subscribed_at` (timestamp with timezone, default now())
      - `is_active` (boolean, default true)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own projects
    - Add policies for newsletter subscriptions

  3. Enums
    - Create project_type enum for better type safety
*/

-- Create project type enum
CREATE TYPE project_type AS ENUM (
  'web-app',
  'mobile-app', 
  'api',
  'microservice',
  'ai-model',
  'other'
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) >= 2 AND length(name) <= 50),
  type project_type NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Newsletter policies (more restrictive)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own newsletter subscription"
  ON newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects table
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();