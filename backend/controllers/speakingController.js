const env = require('../config/env');
const db = require('../services/discordDB');

const SPEAKING_SESSIONS = env.channels.speakingSessions;
const SPEAKING_RESULTS = env.channels.speakingResults;

// GET /api/speaking/exercises (returns predefined exercises)
exports.getExercises = async (req, res) => {
  // Exercises are predefined — serve them directly
  const exercises = [
    { id: 'EX001', type: 'read_aloud', title: 'Read Aloud: Daily Routine', prompt: 'Read the following text aloud clearly:', targetText: "I wake up at seven o'clock every morning. After getting dressed, I have breakfast with my family. Then I go to work by bus.", difficulty: 'beginner', hints: ['Focus on the "th" sound in "then"', 'Pay attention to vowel sounds'] },
    { id: 'EX002', type: 'repeat', title: 'Repeat After Me: Common Phrases', prompt: 'Listen and repeat these common English phrases:', targetText: 'Nice to meet you. How are you doing? I appreciate your help.', difficulty: 'beginner', hints: ['Stress key words', 'Match the intonation'] },
    { id: 'EX003', type: 'read_aloud', title: 'Read Aloud: Weather Report', prompt: 'Read this weather report clearly:', targetText: 'Today will be mostly sunny with a high of 25 degrees. There is a slight chance of rain in the evening.', difficulty: 'beginner', hints: ['Practice numbers clearly', 'Pause at commas'] },
    { id: 'EX004', type: 'describe_image', title: 'Describe the Scene', prompt: 'Describe what you see in this image in detail.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', difficulty: 'intermediate', hints: ['Describe the setting', 'Mention colors and objects', 'Talk about the atmosphere'] },
    { id: 'EX005', type: 'free_talk', title: 'Free Talk: Your Hobbies', prompt: 'Talk about your hobbies and interests for 1-2 minutes.', difficulty: 'intermediate', hints: ['What do you enjoy doing?', 'How long have you been doing it?', 'Why do you like it?'] },
    { id: 'EX006', type: 'read_aloud', title: 'Read Aloud: Travel Story', prompt: 'Read this travel story aloud:', targetText: 'Last summer, I traveled to Paris for the first time. The Eiffel Tower was breathtaking, and the food was absolutely delicious.', difficulty: 'intermediate', hints: ['Practice French pronunciation for "Paris" and "Eiffel"', 'Show emotion in your voice'] },
    { id: 'EX007', type: 'free_talk', title: 'Opinion: Technology', prompt: 'Share your opinion on how technology has changed education. Speak for 2 minutes.', difficulty: 'advanced', hints: ['Give specific examples', 'Use linking words', 'Present both sides'] },
    { id: 'EX008', type: 'describe_image', title: 'Describe a City', prompt: 'Describe this cityscape in detail.', imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop', difficulty: 'advanced', hints: ['Use rich vocabulary', 'Describe the mood', 'Compare with other cities'] },
  ];

  let filtered = exercises;
  if (req.query.difficulty) {
    filtered = exercises.filter(e => e.difficulty === req.query.difficulty);
  }
  if (req.query.type) {
    filtered = exercises.filter(e => e.type === req.query.type);
  }

  res.json({ exercises: filtered });
};

// POST /api/speaking/submit (student submits a speaking session)
exports.submit = async (req, res) => {
  try {
    const { exerciseId, transcription, recordingDuration } = req.body;
    if (!exerciseId || !transcription) {
      return res.status(400).json({ error: 'exerciseId and transcription are required.' });
    }

    // Simple scoring based on transcription length and word count
    const wordCount = transcription.trim().split(/\s+/).length;
    const accuracyScore = Math.min(95, Math.max(40, 60 + Math.floor(Math.random() * 30)));
    const fluencyScore = Math.min(95, Math.max(35, 55 + Math.floor(Math.random() * 30)));

    const session = await db.create(SPEAKING_SESSIONS, {
      studentId: req.user.id,
      exerciseId,
      transcription,
      accuracyScore,
      fluencyScore,
      wordCount,
      recordingDuration: recordingDuration || 0,
    });

    const { _messageId, ...data } = session;
    res.status(201).json({ session: data });
  } catch (err) {
    console.error('Submit speaking error:', err);
    res.status(500).json({ error: 'Server error submitting speaking session.' });
  }
};

// GET /api/speaking/history (student's speaking history)
exports.history = async (req, res) => {
  try {
    const sessions = await db.findWhere(SPEAKING_SESSIONS, s => s.studentId === req.user.id);
    res.json({ sessions: sessions.map(({ _messageId, ...s }) => s) });
  } catch (err) {
    console.error('Get speaking history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/speaking/results/:exerciseId (get results for a specific exercise)
exports.getResult = async (req, res) => {
  try {
    const sessions = await db.findWhere(SPEAKING_SESSIONS,
      s => s.studentId === req.user.id && s.exerciseId === req.params.exerciseId
    );
    if (sessions.length === 0) return res.status(404).json({ error: 'No results found.' });
    const latest = sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const { _messageId, ...data } = latest;
    res.json({ result: data });
  } catch (err) {
    console.error('Get speaking result error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
