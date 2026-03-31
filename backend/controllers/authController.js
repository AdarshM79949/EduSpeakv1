const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../services/discordDB');
const { hashPassword, comparePassword } = require('../utils/hash');

const USERS = env.channels.users;
const SESSIONS = env.channels.sessions;

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required: name, email, password, role.' });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student, teacher, or admin.' });
    }

    // Check if user already exists
    const existing = await db.findWhere(USERS, (u) => u.email === email);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.create(USERS, {
      name,
      email,
      password: hashedPassword,
      role,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Store session
    await db.create(SESSIONS, { userId: user.id, token });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await db.findWhere(USERS, (u) => u.email === email);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    await db.create(SESSIONS, { userId: user.id, token });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const users = await db.findWhere(USERS, (u) => u.email === email);
    if (users.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const resetToken = require('uuid').v4();
    await db.create(env.channels.passwordResets, {
      userId: users[0].id,
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    });

    res.json({ message: 'If the email exists, a reset link has been sent.', resetToken });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const resets = await db.findWhere(env.channels.passwordResets, (r) => r.token === token);
    if (resets.length === 0) return res.status(400).json({ error: 'Invalid or expired reset token.' });

    const resetRecord = resets[0];
    if (new Date(resetRecord.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.update(USERS, resetRecord.userId, { password: hashedPassword });
    await db.remove(env.channels.passwordResets, resetRecord.id);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await db.findOne(USERS, req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
