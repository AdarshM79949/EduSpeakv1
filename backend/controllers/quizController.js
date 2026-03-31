const env = require('../config/env');
const db = require('../services/discordDB');

const QUIZZES = env.channels.quizzes;
const QUIZ_RESULTS = env.channels.quizResults;

// GET /api/quizzes
exports.getAll = async (req, res) => {
  try {
    let quizzes = await db.findAll(QUIZZES);
    if (req.query.category) {
      quizzes = quizzes.filter(q => q.category === req.query.category);
    }
    quizzes = quizzes.map(({ _messageId, ...q }) => q);
    res.json({ quizzes });
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({ error: 'Server error fetching quizzes.' });
  }
};

// GET /api/quizzes/:id
exports.getOne = async (req, res) => {
  try {
    const quiz = await db.findOne(QUIZZES, req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    const { _messageId, ...data } = quiz;
    res.json({ quiz: data });
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ error: 'Server error fetching quiz.' });
  }
};

// POST /api/quizzes (teacher only)
exports.create = async (req, res) => {
  try {
    const { title, description, category, timeLimit, questions, assignedClassId } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }
    const quiz = await db.create(QUIZZES, {
      title,
      description: description || '',
      category,
      timeLimit: timeLimit || 10,
      questions: questions || [],
      teacherId: req.user.id,
      isPublished: true,
      assignedClassId: assignedClassId || null,
    });
    const { _messageId, ...data } = quiz;
    res.status(201).json({ quiz: data });
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ error: 'Server error creating quiz.' });
  }
};

// PUT /api/quizzes/:id
exports.update = async (req, res) => {
  try {
    const updated = await db.update(QUIZZES, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Quiz not found.' });
    res.json({ quiz: updated });
  } catch (err) {
    console.error('Update quiz error:', err);
    res.status(500).json({ error: 'Server error updating quiz.' });
  }
};

// DELETE /api/quizzes/:id
exports.remove = async (req, res) => {
  try {
    const success = await db.remove(QUIZZES, req.params.id);
    if (!success) return res.status(404).json({ error: 'Quiz not found.' });
    res.json({ message: 'Quiz deleted.' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ error: 'Server error deleting quiz.' });
  }
};

// POST /api/quizzes/:id/submit (student submits quiz)
exports.submit = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await db.findOne(QUIZZES, req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    // Calculate score
    let score = 0;
    const totalQuestions = (quiz.questions || []).length;
    const gradedAnswers = (answers || []).map((ans, i) => {
      const question = quiz.questions?.[i];
      const isCorrect = question ? String(ans.selectedAnswer) === String(question.correctAnswer) : false;
      if (isCorrect) score += (question?.points || 10);
      return { questionId: question?.id || `q${i}`, selectedAnswer: ans.selectedAnswer, isCorrect };
    });

    const totalPoints = (quiz.questions || []).reduce((sum, q) => sum + (q.points || 10), 0);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    const result = await db.create(QUIZ_RESULTS, {
      quizId: req.params.id,
      quizTitle: quiz.title,
      studentId: req.user.id,
      score,
      totalPoints,
      totalQuestions,
      percentage,
      answers: gradedAnswers,
      timeTaken: timeTaken || 0,
    });

    const { _messageId, ...data } = result;
    res.status(201).json({ result: data });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Server error submitting quiz.' });
  }
};

// GET /api/quizzes/results/me (student's results)
exports.myResults = async (req, res) => {
  try {
    const results = await db.findWhere(QUIZ_RESULTS, r => r.studentId === req.user.id);
    res.json({ results: results.map(({ _messageId, ...r }) => r) });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/quizzes/:id/results (teacher views results for a quiz)
exports.quizResults = async (req, res) => {
  try {
    const results = await db.findWhere(QUIZ_RESULTS, r => r.quizId === req.params.id);
    res.json({ results: results.map(({ _messageId, ...r }) => r) });
  } catch (err) {
    console.error('Get quiz results error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
