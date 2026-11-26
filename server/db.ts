import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'uzbekistan.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT NOT NULL,
      short_description TEXT NOT NULL,
      history_text TEXT NOT NULL,
      architecture_notes TEXT NOT NULL,
      best_time TEXT NOT NULL,
      recommended_days TEXT NOT NULL,
      unesco_year TEXT,
      elevation_m INTEGER NOT NULL DEFAULT 500,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      hero_image TEXT NOT NULL,
      secondary_image TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      travel_tips_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS attractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      era TEXT NOT NULL,
      summary TEXT NOT NULL,
      highlight_tip TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      destination_slug TEXT NOT NULL,
      city_name TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      price_usd INTEGER NOT NULL,
      season TEXT NOT NULL,
      summary TEXT NOT NULL,
      highlights_json TEXT NOT NULL DEFAULT '[]',
      image_url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS culture_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT NOT NULL,
      heritage_note TEXT NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cuisine_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      uzbek_name TEXT NOT NULL,
      origin_city TEXT NOT NULL,
      course_type TEXT NOT NULL,
      prep_time TEXT NOT NULL,
      description TEXT NOT NULL,
      cultural_background TEXT NOT NULL,
      key_ingredients_json TEXT NOT NULL DEFAULT '[]',
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      destination_slug TEXT NOT NULL,
      photographer_credit TEXT NOT NULL,
      caption TEXT NOT NULL,
      image_url TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      is_wide INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_slug TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_country TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      visit_season TEXT NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      helpful_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS itinerary_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_code TEXT NOT NULL DEFAULT 'SILK-2026',
      item_type TEXT NOT NULL CHECK(item_type IN ('destination', 'experience')),
      item_slug TEXT NOT NULL,
      title TEXT NOT NULL,
      city TEXT NOT NULL,
      day_number INTEGER NOT NULL DEFAULT 1,
      preferred_month TEXT NOT NULL DEFAULT 'April',
      notes TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS travel_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      travel_month TEXT NOT NULL,
      group_size TEXT NOT NULL,
      interests_json TEXT NOT NULL DEFAULT '[]',
      message TEXT NOT NULL,
      reference_code TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_dest ON reviews(destination_slug);
    CREATE INDEX IF NOT EXISTS idx_itinerary_trip ON itinerary_items(trip_code);
  `);
}
