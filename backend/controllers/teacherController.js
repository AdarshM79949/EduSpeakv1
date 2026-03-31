const env = require('../config/env');
const db = require('../services/discordDB');

const USERS = env.channels.users;
const LESSONS = env.channels.lessons;
const QUIZZES = env.channels.quizzes;
const QUIZ_RESULTS = env.channels.quizResults;
const GRADES = env.channels.grades;
const PROGRESS = env.channels.progress;

// GET /api/teacher/students (get all students)
exports.getStudents = async (req, res) => {
  try {
    const users = await db.findWhere(USERS, u => u.role === 'student');
    res.json({ students: users.map(({ _messageId, password, ...u }) => u) });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/teacher/lessons (teacher's own lessons)
exports.myLessons = async (req, res) => {
  try {
    const lessons = await db.findWhere(LESSONS, l => l.teacherId === req.user.id);
    res.json({ lessons: lessons.map(({ _messageId, ...l }) => l) });
  } catch (err) {
    console.error('Get teacher lessons error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/teacher/quizzes (teacher's own quizzes)
exports.myQuizzes = async (req, res) => {
  try {
    const quizzes = await db.findWhere(QUIZZES, q => q.teacherId === req.user.id);
    res.json({ quizzes: quizzes.map(({ _messageId, ...q }) => q) });
  } catch (err) {
    console.error('Get teacher quizzes error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/teacher/grades (all grades given by this teacher)
exports.getGrades = async (req, res) => {
  try {
    const grades = await db.findWhere(GRADES, g => g.teacherId === req.user.id);
    res.json({ grades: grades.map(({ _messageId, ...g }) => g) });
  } catch (err) {
    console.error('Get grades error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/teacher/grades (give a grade)
exports.createGrade = async (req, res) => {
  try {
    const { studentId, quizId, grade, feedback } = req.body;
    if (!studentId || !grade) {
      return res.status(400).json({ error: 'studentId and grade are required.' });
    }
    const newGrade = await db.create(GRADES, {
      teacherId: req.user.id,
      studentId,
      quizId: quizId || null,
      grade,
      feedback: feedback || '',
    });
    const { _messageId, ...data } = newGrade;
    res.status(201).json({ grade: data });
  } catch (err) {
    console.error('Create grade error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/teacher/student/:studentId/progress
exports.studentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const [progressData, quizResults, grades] = await Promise.all([
      db.findWhere(PROGRESS, p => p.studentId === studentId),
      db.findWhere(QUIZ_RESULTS, r => r.studentId === studentId),
      db.findWhere(GRADES, g => g.studentId === studentId),
    ]);

    const avgScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((s, r) => s + (r.percentage || r.score || 0), 0) / quizResults.length)
      : 0;

    res.json({
      progress: {
        lessonsCompleted: progressData.length,
        quizzesTaken: quizResults.length,
        averageScore: avgScore,
        grades: grades.map(({ _messageId, ...g }) => g),
        recentQuizResults: quizResults.slice(0, 5).map(({ _messageId, ...r }) => r),
      },
    });
  } catch (err) {
    console.error('Get student progress error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/teacher/stats (teacher dashboard stats)
exports.stats = async (req, res) => {
  try {
    const [lessons, quizzes, students, quizResults] = await Promise.all([
      db.findWhere(LESSONS, l => l.teacherId === req.user.id),
      db.findWhere(QUIZZES, q => q.teacherId === req.user.id),
      db.findWhere(USERS, u => u.role === 'student'),
      db.findAll(QUIZ_RESULTS),
    ]);

    res.json({
      stats: {
        totalLessons: lessons.length,
        totalQuizzes: quizzes.length,
        totalStudents: students.length,
        totalQuizAttempts: quizResults.length,
        avgQuizScore: quizResults.length > 0
          ? Math.round(quizResults.reduce((s, r) => s + (r.percentage || 0), 0) / quizResults.length)
          : 0,
      },
    });
  } catch (err) {
    console.error('Get teacher stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
