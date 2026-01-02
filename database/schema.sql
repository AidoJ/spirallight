-- Spiral Light Healing - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER,
  dob DATE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal TEXT,
  occupation TEXT,
  referred_by TEXT,
  md TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved')),
  practitioner TEXT,
  complaints JSONB DEFAULT '[]',
  aggravates TEXT,
  swelling TEXT,
  injury_site TEXT,
  medications JSONB DEFAULT '[]',
  healthcare JSONB DEFAULT '[]',
  therapies JSONB DEFAULT '[]',
  implants TEXT,
  injuries JSONB DEFAULT '[]',
  operations JSONB DEFAULT '[]',
  exercise TEXT,
  bowen_history TEXT,
  additional TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - For now, we'll disable it for MVP
-- You can enable RLS later when adding authentication
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (for MVP without auth)
-- Replace with proper policies when adding authentication
CREATE POLICY "Allow all operations on clients" ON clients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on sessions" ON sessions
    FOR ALL USING (true) WITH CHECK (true);

