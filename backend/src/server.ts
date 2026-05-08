import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { run, get, all } from './db';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'super_secret_key_for_assignment';

// Middleware for authentication
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- DASHBOARD ROUTES ---
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const totalLeads = await get('SELECT COUNT(*) as count FROM leads');
    const newLeads = await get('SELECT COUNT(*) as count FROM leads WHERE status = "New"');
    const qualifiedLeads = await get('SELECT COUNT(*) as count FROM leads WHERE status = "Qualified"');
    const wonLeads = await get('SELECT COUNT(*) as count FROM leads WHERE status = "Won"');
    const lostLeads = await get('SELECT COUNT(*) as count FROM leads WHERE status = "Lost"');
    const totalValue = await get('SELECT SUM(deal_value) as sum FROM leads');
    const wonValue = await get('SELECT SUM(deal_value) as sum FROM leads WHERE status = "Won"');

    res.json({
      totalLeads: totalLeads.count,
      newLeads: newLeads.count,
      qualifiedLeads: qualifiedLeads.count,
      wonLeads: wonLeads.count,
      lostLeads: lostLeads.count,
      totalValue: totalValue.sum || 0,
      wonValue: wonValue.sum || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- LEADS ROUTES ---
app.get('/api/leads', authenticate, async (req, res) => {
  const { status, source, search } = req.query;
  let query = 'SELECT * FROM leads WHERE 1=1';
  let params: any[] = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (source) {
    query += ' AND source = ?';
    params.push(source);
  }
  if (search) {
    query += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const leads = await all(query, params);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/leads/:id', authenticate, async (req, res) => {
  try {
    const lead = await get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    const notes = await all('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ ...lead, notes });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/leads', authenticate, async (req, res) => {
  const { name, company, email, phone, source, assigned_to, deal_value } = req.body;
  try {
    await run(`
      INSERT INTO leads (name, company, email, phone, source, assigned_to, deal_value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, company, email, phone, source, assigned_to, deal_value || 0]);
    res.status(201).json({ message: 'Lead created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/leads/:id', authenticate, async (req, res) => {
  const { name, company, email, phone, source, assigned_to, status, deal_value } = req.body;
  try {
    await run(`
      UPDATE leads 
      SET name = ?, company = ?, email = ?, phone = ?, source = ?, assigned_to = ?, status = ?, deal_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, company, email, phone, source, assigned_to, status, deal_value, req.params.id]);
    res.json({ message: 'Lead updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/leads/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    await run('UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/leads/:id', authenticate, async (req, res) => {
  try {
    await run('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- NOTES ROUTES ---
app.post('/api/leads/:id/notes', authenticate, async (req, res) => {
  const { content } = req.body;
  const created_by = (req as any).user.email;
  try {
    await run('INSERT INTO notes (lead_id, content, created_by) VALUES (?, ?, ?)', [req.params.id, content, created_by]);
    res.status(201).json({ message: 'Note added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
