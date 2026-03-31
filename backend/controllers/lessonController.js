const env = require('../config/env');
const db = require('../services/discordDB');

const LESSONS = env.channels.lessons;
const PROGRESS = env.channels.progress;

// GET /api/lessons
exports.getAll = async (req, res) => {
  try {
    let lessons = await db.findAll(LESSONS);

    // Optional filters
    if (req.query.skill) {
      lessons = lessons.filter((l) => l.skill === req.query.skill);
    }
    if (req.query.difficulty) {
      lessons = lessons.filter((l) => l.difficulty === req.query.difficulty);
    }

    // Don't expose internal fields
    lessons = lessons.map(({ _messageId, ...l }) => l);
    res.json({ lessons });
  } catch (err) {
    console.error('Get lessons error:', err);
    res.status(500).json({ error: 'Server error fetching lessons.' });
  }
};

// GET /api/lessons/:id
exports.getOne = async (req, res) => {
  try {
    const lesson = await db.findOne(LESSONS, req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
    const { _messageId, ...data } = lesson;
    res.json({ lesson: data });
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ error: 'Server error fetching lesson.' });
  }
};

// POST /api/lessons  (teacher only)
exports.create = async (req, res) => {
  try {
    const { title, description, skill, difficulty, type, content, duration, thumbnail } = req.body;

    if (!title || !skill || !difficulty) {
      return res.status(400).json({ error: 'Title, skill, and difficulty are required.' });
    }

    const lesson = await db.create(LESSONS, {
      title,
      description: description || '',
      skill,
      difficulty,
      type: type || 'text',
      content: content || '',
      duration: duration || 0,
      thumbnail: thumbnail || '',
      teacherId: req.user.id,
      viewCount: 0,
    });

    const { _messageId, ...data } = lesson;
    res.status(201).json({ lesson: data });
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ error: 'Server error creating lesson.' });
  }
};

// PUT /api/lessons/:id  (teacher only)
exports.update = async (req, res) => {
  try {
    const updated = await db.update(LESSONS, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lesson not found.' });
    res.json({ lesson: updated });
  } catch (err) {
    console.error('Update lesson error:', err);
    res.status(500).json({ error: 'Server error updating lesson.' });
  }
};

// DELETE /api/lessons/:id  (teacher only)
exports.remove = async (req, res) => {
  try {
    const success = await db.remove(LESSONS, req.params.id);
    if (!success) return res.status(404).json({ error: 'Lesson not found.' });
    res.json({ message: 'Lesson deleted.' });
  } catch (err) {
    console.error('Delete lesson error:', err);
    res.status(500).json({ error: 'Server error deleting lesson.' });
  }
};

// POST /api/lessons/:id/complete  (student marks completion)
exports.complete = async (req, res) => {
  try {
    await db.create(PROGRESS, {
      studentId: req.user.id,
      lessonId: req.params.id,
      completedAt: new Date().toISOString(),
    });
    res.json({ message: 'Lesson marked as completed.' });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
