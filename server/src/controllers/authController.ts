import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AllocationConfig } from '../models/AllocationConfig';
import { createToken } from '../utils/auth';

export async function register(req: Request, res: Response): Promise<void> {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || password.length < 6) {
    res.status(400).json({ message: 'Name, valid email and password of at least 6 characters are required.' });
    return;
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  await AllocationConfig.create({
    userId: user._id,
    categories: [
      { name: 'Needs', type: 'PERCENTAGE', percentage: 50, sortOrder: 0 },
      { name: 'Savings', type: 'PERCENTAGE', percentage: 30, sortOrder: 1 },
      { name: 'Others', type: 'REMAINING', sortOrder: 2 },
    ],
  });

  res.status(201).json({
    token: createToken(String(user._id)),
    user: { id: String(user._id), name: user.name, email: user.email },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  res.json({
    token: createToken(String(user._id)),
    user: { id: String(user._id), name: user.name, email: user.email },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId).select('_id name email');
  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }
  res.json({ user: { id: String(user._id), name: user.name, email: user.email } });
}
