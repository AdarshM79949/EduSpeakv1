const env = require('../config/env');
const db = require('../services/discordDB');

const USERS = env.channels.users;
const LESSONS = env.channels.lessons;
const QUIZZES = env.channels.quizzes;
const QUIZ_RESULTS = env.channels.quizResults;
const LOGS = env.channels.logs;
const SETTINGS = env.channels.settings;
const FEEDBACK = env.channels.feedback;
const ANNOUNCEMENTS = env.channels.announcements;
const PROGRESS = env.channels.progress;
const SPEAKING_SESSIONS = env.channels.speakingSessions;

// GET /api/admin/users (all users)
exports.getUsers = async (req, res) => {
  try {
    let users = await db.findAll(USERS);
    if (req.query.role) {
      users = users.filter(u => u.role === req.query.role);
    }
    res.json({ users: users.map(({ _messageId, password, ...u }) => u) });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/admin/users/:id (update user)
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, name } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name) updateData.name = name;

    const updated = await db.update(USERS, req.params.id, updateData);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    const { password, ...data } = updated;
    res.json({ user: data });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const success = await db.remove(USERS, req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/analytics
exports.analytics = async (req, res) => {
  try {
    const [users, lessons, quizzes, quizResults, progress, speakingSessions] = await Promise.all([
      db.findAll(USERS),
      db.findAll(LESSONS),
      db.findAll(QUIZZES),
      db.findAll(QUIZ_RESULTS),
      db.findAll(PROGRESS),
      db.findAll(SPEAKING_SESSIONS),
    ]);

    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');

    // Calculate quiz pass rate (>= 60%)
    const passedQuizzes = quizResults.filter(r => (r.percentage || 0) >= 60).length;
    const quizPassRate = quizResults.length > 0 ? Math.round((passedQuizzes / quizResults.length) * 100) : 0;

    // Lesson completion rate
    const completionRate = lessons.length > 0 && students.length > 0
      ? Math.round((progress.length / (lessons.length * students.length)) * 100)
      : 0;

    // Popular lessons (by view count)
    const popularLessons = lessons
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5)
      .map(l => ({ lessonId: l.id, title: l.title, viewCount: l.viewCount || 0 }));

    // Recent signups
    const recentSignups = users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(({ _messageId, password, ...u }) => u);

    res.json({
      analytics: {
        totalUsers: users.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalLessons: lessons.length,
        totalQuizzes: quizzes.length,
        quizzesTaken: quizResults.length,
        speakingSessions: speakingSessions.length,
        lessonsCompleted: progress.length,
        quizPassRate,
        lessonCompletionRate: Math.min(completionRate, 100),
        popularLessons,
        recentSignups,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await db.findAll(LOGS);
    res.json({ logs: logs.map(({ _messageId, ...l }) => l) });
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/admin/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }
    const announcement = await db.create(ANNOUNCEMENTS, {
      title,
      message,
      targetRole: targetRole || 'all',
      authorId: req.user.id,
    });
    const { _messageId, ...data } = announcement;
    res.status(201).json({ announcement: data });
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await db.findAll(ANNOUNCEMENTS);
    res.json({ announcements: announcements.map(({ _messageId, ...a }) => a) });
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await db.findAll(SETTINGS);
    res.json({ settings: settings.length > 0 ? settings[0] : {} });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
  try {
    const existing = await db.findAll(SETTINGS);
    if (existing.length > 0) {
      const updated = await db.update(SETTINGS, existing[0].id, req.body);
      res.json({ settings: updated });
    } else {
      const created = await db.create(SETTINGS, req.body);
      const { _messageId, ...data } = created;
      res.status(201).json({ settings: data });
    }
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/admin/feedback
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await db.findAll(FEEDBACK);
    res.json({ feedback: feedback.map(({ _messageId, ...f }) => f) });
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
