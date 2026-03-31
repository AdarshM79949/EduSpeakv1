const express = require('express');
const cors = require('cors');
const env = require('./config/env');

// Initialize Discord bot (connects on import)
require('./config/discord');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/speaking', require('./routes/speaking'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 EduSpeak backend running on http://localhost:${env.PORT}`);
});
