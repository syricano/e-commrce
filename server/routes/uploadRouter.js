import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Basic base64 upload to /uploads without external deps
router.post('/', auth, (req, res) => {
  try {
    const { filename, data } = req.body || {};
    if (!filename || !data) return res.status(400).json({ error: 'filename and base64 data required' });
    const safe = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const buf = Buffer.from(data.replace(/^data:[^;]+;base64,/, ''), 'base64');
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const full = path.join(dir, safe);
    fs.writeFileSync(full, buf);
    const url = `/uploads/${safe}`;
    return res.status(201).json({ url });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to upload' });
  }
});

export default router;

