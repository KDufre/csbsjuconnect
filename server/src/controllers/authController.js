import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { createToken } from '../utils/tokens.js';

const allowedDomains = ['csbsju.edu', 'csb.edu'];

function validSchoolEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.includes(domain);
}

export async function register(req, res) {
  const { email, name, password } = req.body;
  if (!email || !name || !password) return res.status(400).json({ message: 'Email, name, and password are required' });
  if (!validSchoolEmail(email)) return res.status(400).json({ message: 'Only CSBSJU/CSB email addresses are allowed' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: email.toLowerCase(), name, passwordHash });
  res.status(201).json({ token: createToken(user.id), user: user.toJSON() });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password || '', user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: createToken(user.id), user: user.toJSON() });
}

export async function me(req, res) {
  res.json({ user: req.user.toJSON() });
}
