import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db, initializeSchema } from './server/db.ts';
import { seedDatabase } from './server/seed.ts';

initializeSchema();
seedDatabase();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

function sanitizeTripCode(raw: unknown): string {
  if (typeof raw !== 'string') return 'SILK-2026';
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
  return cleaned.length >= 3 ? cleaned : 'SILK-2026';
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'sqlite', timestamp: new Date().toISOString() });
});

// GET /api/destinations (supports ?search=, ?category=, ?featured=)
app.get('/api/destinations', (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const featured = req.query.featured === '1' || req.query.featured === 'true';

    let sql = `
      SELECT
        d.*,
        ROUND(COALESCE(AVG(r.rating), 5.0), 1) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM destinations d
      LEFT JOIN reviews r ON r.destination_slug = d.slug
    `;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (category && category !== 'All') {
      conditions.push('d.category = ?');
      params.push(category);
    }

    if (featured) {
      conditions.push('d.is_featured = 1');
    }

    if (search) {
      conditions.push(`(
        LOWER(d.name) LIKE ? OR
        LOWER(d.region) LIKE ? OR
        LOWER(d.tagline) LIKE ? OR
        LOWER(d.short_description) LIKE ? OR
        EXISTS (
          SELECT 1 FROM attractions a
          WHERE a.destination_id = d.id AND (LOWER(a.name) LIKE ? OR LOWER(a.summary) LIKE ?)
        )
      )`);
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY d.id ORDER BY d.is_featured DESC, d.id ASC';

    const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
    const attractionsStmt = db.prepare(
      'SELECT id, name, era, summary, highlight_tip, latitude, longitude FROM attractions WHERE destination_id = ? ORDER BY id ASC'
    );

    const formatted = rows.map((row) => ({
      ...row,
      travel_tips: safeJsonParse<string[]>(String(row.travel_tips_json || '[]'), []),
      attractions: attractionsStmt.all(row.id)
    }));

    res.json({ destinations: formatted });
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).json({ error: 'Failed to load destinations' });
  }
});

// GET /api/destinations/:slug
app.get('/api/destinations/:slug', (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const row = db
      .prepare(
        `
        SELECT
          d.*,
          ROUND(COALESCE(AVG(r.rating), 5.0), 1) AS avg_rating,
          COUNT(r.id) AS review_count
        FROM destinations d
        LEFT JOIN reviews r ON r.destination_slug = d.slug
        WHERE d.slug = ?
        GROUP BY d.id
      `
      )
      .get(slug) as Record<string, unknown> | undefined;

    if (!row) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    const attractions = db
      .prepare(
        'SELECT id, name, era, summary, highlight_tip, latitude, longitude FROM attractions WHERE destination_id = ? ORDER BY id ASC'
      )
      .all(row.id);

    const reviews = db
      .prepare(
        'SELECT id, destination_slug, author_name, author_country, rating, visit_season, title, comment, helpful_count, created_at FROM reviews WHERE destination_slug = ? ORDER BY id DESC'
      )
      .all(slug);

    const experiences = db
      .prepare('SELECT * FROM experiences WHERE destination_slug = ? ORDER BY id ASC')
      .all(slug) as Array<Record<string, unknown>>;

    res.json({
      destination: {
        ...row,
        travel_tips: safeJsonParse<string[]>(String(row.travel_tips_json || '[]'), []),
        attractions,
        reviews,
        experiences: experiences.map((exp) => ({
          ...exp,
          highlights: safeJsonParse<string[]>(String(exp.highlights_json || '[]'), [])
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching destination detail:', err);
    res.status(500).json({ error: 'Failed to load destination details' });
  }
});

// POST /api/destinations/:slug/reviews
app.post('/api/destinations/:slug/reviews', (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const destExists = db.prepare('SELECT id FROM destinations WHERE slug = ?').get(slug);
    if (!destExists) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    const { author_name, author_country, rating, visit_season, title, comment } = req.body || {};
    const cleanName = typeof author_name === 'string' ? author_name.trim().slice(0, 80) : '';
    const cleanCountry = typeof author_country === 'string' ? author_country.trim().slice(0, 80) : '';
    const cleanSeason = typeof visit_season === 'string' ? visit_season.trim().slice(0, 60) : 'Spring';
    const cleanTitle = typeof title === 'string' ? title.trim().slice(0, 140) : '';
    const cleanComment = typeof comment === 'string' ? comment.trim().slice(0, 1200) : '';
    const numericRating = Number(rating);

    if (!cleanName || !cleanCountry || !cleanTitle || !cleanComment) {
      res.status(400).json({ error: 'Please complete your name, country, review headline, and reflection.' });
      return;
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    const result = db
      .prepare(
        `
        INSERT INTO reviews (destination_slug, author_name, author_country, rating, visit_season, title, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      )
      .run(slug, cleanName, cleanCountry, numericRating, cleanSeason, cleanTitle, cleanComment);

    const created = db
      .prepare('SELECT * FROM reviews WHERE id = ?')
      .get(result.lastInsertRowid);

    const stats = db
      .prepare(
        'SELECT ROUND(COALESCE(AVG(rating), 5.0), 1) AS avg_rating, COUNT(id) AS review_count FROM reviews WHERE destination_slug = ?'
      )
      .get(slug);

    res.status(201).json({ review: created, stats });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// POST /api/reviews/:id/helpful
app.post('/api/reviews/:id/helpful', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid review id' });
      return;
    }
    const info = db.prepare('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    const updated = db.prepare('SELECT id, helpful_count FROM reviews WHERE id = ?').get(id);
    res.json({ review: updated });
  } catch (err) {
    console.error('Error updating helpful vote:', err);
    res.status(500).json({ error: 'Failed to update vote' });
  }
});

// DELETE /api/reviews/:id
app.delete('/api/reviews/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid review id' });
      return;
    }
    const existing = db.prepare('SELECT destination_slug FROM reviews WHERE id = ?').get(id) as
      | { destination_slug: string }
      | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    const stats = db
      .prepare(
        'SELECT ROUND(COALESCE(AVG(rating), 5.0), 1) AS avg_rating, COUNT(id) AS review_count FROM reviews WHERE destination_slug = ?'
      )
      .get(existing.destination_slug);
    res.json({ deletedId: id, stats });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// GET /api/experiences
app.get('/api/experiences', (req, res) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const rows =
      category && category !== 'All'
        ? (db.prepare('SELECT * FROM experiences WHERE category = ? ORDER BY id ASC').all(category) as Array<
            Record<string, unknown>
          >)
        : (db.prepare('SELECT * FROM experiences ORDER BY id ASC').all() as Array<Record<string, unknown>>);

    res.json({
      experiences: rows.map((row) => ({
        ...row,
        highlights: safeJsonParse<string[]>(String(row.highlights_json || '[]'), [])
      }))
    });
  } catch (err) {
    console.error('Error fetching experiences:', err);
    res.status(500).json({ error: 'Failed to load experiences' });
  }
});

// GET /api/culture
app.get('/api/culture', (req, res) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const rows =
      category && category !== 'All'
        ? db.prepare('SELECT * FROM culture_items WHERE category = ? ORDER BY sort_order ASC').all(category)
        : db.prepare('SELECT * FROM culture_items ORDER BY sort_order ASC').all();
    res.json({ items: rows });
  } catch (err) {
    console.error('Error fetching culture items:', err);
    res.status(500).json({ error: 'Failed to load culture items' });
  }
});

// GET /api/cuisine
app.get('/api/cuisine', (req, res) => {
  try {
    const course = typeof req.query.course === 'string' ? req.query.course.trim() : '';
    const rows =
      course && course !== 'All'
        ? (db.prepare('SELECT * FROM cuisine_items WHERE course_type = ? ORDER BY sort_order ASC').all(course) as Array<
            Record<string, unknown>
          >)
        : (db.prepare('SELECT * FROM cuisine_items ORDER BY sort_order ASC').all() as Array<Record<string, unknown>>);

    res.json({
      dishes: rows.map((row) => ({
        ...row,
        key_ingredients: safeJsonParse<string[]>(String(row.key_ingredients_json || '[]'), [])
      }))
    });
  } catch (err) {
    console.error('Error fetching cuisine items:', err);
    res.status(500).json({ error: 'Failed to load cuisine items' });
  }
});

// GET /api/gallery
app.get('/api/gallery', (req, res) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const rows =
      category && category !== 'All'
        ? db.prepare('SELECT * FROM gallery_items WHERE category = ? ORDER BY id ASC').all(category)
        : db.prepare('SELECT * FROM gallery_items ORDER BY id ASC').all();
    res.json({ photos: rows });
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to load gallery' });
  }
});

// POST /api/gallery/:id/like
app.post('/api/gallery/:id/like', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid photo id' });
      return;
    }
    const info = db.prepare('UPDATE gallery_items SET likes = likes + 1 WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    const photo = db.prepare('SELECT id, likes FROM gallery_items WHERE id = ?').get(id);
    res.json({ photo });
  } catch (err) {
    console.error('Error liking photo:', err);
    res.status(500).json({ error: 'Failed to update likes' });
  }
});

// GET /api/itinerary?trip_code=SILK-2026
app.get('/api/itinerary', (req, res) => {
  try {
    const tripCode = sanitizeTripCode(req.query.trip_code);
    const items = db
      .prepare('SELECT * FROM itinerary_items WHERE trip_code = ? ORDER BY day_number ASC, id ASC')
      .all(tripCode);
    res.json({ trip_code: tripCode, items });
  } catch (err) {
    console.error('Error fetching itinerary:', err);
    res.status(500).json({ error: 'Failed to load itinerary' });
  }
});

// POST /api/itinerary
app.post('/api/itinerary', (req, res) => {
  try {
    const { trip_code, item_type, item_slug, day_number, preferred_month, notes } = req.body || {};
    const tripCode = sanitizeTripCode(trip_code);
    const type = item_type === 'experience' ? 'experience' : 'destination';
    const slug = typeof item_slug === 'string' ? item_slug.trim().toLowerCase() : '';
    const dayNum = Math.max(1, Math.min(30, Number(day_number) || 1));
    const month = typeof preferred_month === 'string' && preferred_month.trim() ? preferred_month.trim().slice(0, 30) : 'April';
    const cleanNotes = typeof notes === 'string' ? notes.trim().slice(0, 400) : '';

    let title = '';
    let city = '';
    let imageUrl = '';

    if (type === 'destination') {
      const dest = db
        .prepare('SELECT name, region, hero_image FROM destinations WHERE slug = ?')
        .get(slug) as { name: string; region: string; hero_image: string } | undefined;
      if (!dest) {
        res.status(404).json({ error: 'Destination not found' });
        return;
      }
      title = `${dest.name} Discovery`;
      city = dest.name;
      imageUrl = dest.hero_image;
    } else {
      const exp = db
        .prepare('SELECT title, city_name, image_url FROM experiences WHERE slug = ?')
        .get(slug) as { title: string; city_name: string; image_url: string } | undefined;
      if (!exp) {
        res.status(404).json({ error: 'Experience not found' });
        return;
      }
      title = exp.title;
      city = exp.city_name;
      imageUrl = exp.image_url;
    }

    const result = db
      .prepare(
        `
        INSERT INTO itinerary_items (trip_code, item_type, item_slug, title, city, day_number, preferred_month, notes, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .run(tripCode, type, slug, title, city, dayNum, month, cleanNotes, imageUrl);

    const created = db.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ item: created });
  } catch (err) {
    console.error('Error adding itinerary item:', err);
    res.status(500).json({ error: 'Failed to add itinerary stop' });
  }
});

// PATCH /api/itinerary/:id
app.patch('/api/itinerary/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid item id' });
      return;
    }
    const existing = db.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Itinerary stop not found' });
      return;
    }

    const { day_number, preferred_month, notes } = req.body || {};
    const dayNum =
      day_number !== undefined ? Math.max(1, Math.min(30, Number(day_number) || 1)) : Number(existing.day_number);
    const month =
      typeof preferred_month === 'string' && preferred_month.trim()
        ? preferred_month.trim().slice(0, 30)
        : String(existing.preferred_month);
    const cleanNotes =
      typeof notes === 'string' ? notes.trim().slice(0, 400) : String(existing.notes || '');

    db.prepare('UPDATE itinerary_items SET day_number = ?, preferred_month = ?, notes = ? WHERE id = ?').run(
      dayNum,
      month,
      cleanNotes,
      id
    );

    const updated = db.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(id);
    res.json({ item: updated });
  } catch (err) {
    console.error('Error updating itinerary item:', err);
    res.status(500).json({ error: 'Failed to update itinerary stop' });
  }
});

// DELETE /api/itinerary/:id
app.delete('/api/itinerary/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid item id' });
      return;
    }
    const info = db.prepare('DELETE FROM itinerary_items WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Itinerary stop not found' });
      return;
    }
    res.json({ deletedId: id });
  } catch (err) {
    console.error('Error deleting itinerary item:', err);
    res.status(500).json({ error: 'Failed to remove itinerary stop' });
  }
});

// POST /api/inquiries
app.post('/api/inquiries', (req, res) => {
  try {
    const { full_name, email, travel_month, group_size, interests, message } = req.body || {};
    const cleanName = typeof full_name === 'string' ? full_name.trim().slice(0, 100) : '';
    const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 140) : '';
    const cleanMonth = typeof travel_month === 'string' ? travel_month.trim().slice(0, 40) : 'Spring 2027';
    const cleanGroup = typeof group_size === 'string' ? group_size.trim().slice(0, 40) : '2 Travelers';
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 1500) : '';
    const cleanInterests = Array.isArray(interests)
      ? interests.filter((x): x is string => typeof x === 'string').slice(0, 8)
      : [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanName || !emailRegex.test(cleanEmail) || !cleanMessage) {
      res.status(400).json({ error: 'Please provide your full name, a valid email address, and travel preferences.' });
      return;
    }

    const referenceCode = `UZ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    db.prepare(
      `
      INSERT INTO travel_inquiries (full_name, email, travel_month, group_size, interests_json, message, reference_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(cleanName, cleanEmail, cleanMonth, cleanGroup, JSON.stringify(cleanInterests), cleanMessage, referenceCode);

    res.status(201).json({
      inquiry: {
        reference_code: referenceCode,
        full_name: cleanName,
        travel_month: cleanMonth,
        group_size: cleanGroup
      }
    });
  } catch (err) {
    console.error('Error saving travel inquiry:', err);
    res.status(500).json({ error: 'Failed to submit travel inquiry' });
  }
});

async function startServer(): Promise<void> {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Uzbekistan Silk Road server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
