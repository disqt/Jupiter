import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import pool from '../db';

const router = Router();
const SALT_ROUNDS = 12;

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many attempts, try again later' },
});

router.use(authLimiter);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nickname, password, invite_code } = req.body;

    if (!nickname || !password || !invite_code) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (invite_code !== (process.env.INVITE_CODE || '')) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }

    if (nickname.length < 2 || nickname.length > 50) {
      return res.status(400).json({ error: 'Nickname must be 2-50 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if nickname already taken
    const existing = await pool.query('SELECT id FROM users WHERE nickname = $1', [nickname]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Nickname already taken' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (nickname, password_hash) VALUES ($1, $2) RETURNING id, nickname, created_at',
      [nickname, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '30d' });

    res.status(201).json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;

    if (!nickname || !password) {
      return res.status(400).json({ error: 'Nickname and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid nickname or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid nickname or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '30d' });

    res.json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/me
router.put('/me', async (req, res) => {
  try {
    const { nickname, password, current_password } = req.body;

    // Verify current password
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (current_password) {
      const valid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    if (nickname) {
      if (nickname.length < 2 || nickname.length > 50) {
        return res.status(400).json({ error: 'Nickname must be 2-50 characters' });
      }
      const existing = await pool.query('SELECT id FROM users WHERE nickname = $1 AND id != $2', [nickname, req.userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Nickname already taken' });
      }
      await pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [nickname, req.userId]);
    }

    if (password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password required to change password' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);
    }

    const updated = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [req.userId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
