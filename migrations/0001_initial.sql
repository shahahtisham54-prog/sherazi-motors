-- Initial Sherazi Motors schema for Cloudflare D1.
-- Apply this only to the dedicated Sherazi Motors D1 database.

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  interest TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Sherazi Motors website'
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at
  ON enquiries(created_at DESC);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price INTEGER NOT NULL,
  transmission TEXT NOT NULL DEFAULT '—',
  fuel TEXT NOT NULL DEFAULT '—',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'available',
  photos TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status_created_at
  ON vehicles(status, created_at DESC);
