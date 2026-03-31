require('dotenv').config();

const env = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  JWT_SECRET: process.env.JWT_SECRET || 'eduspeak_default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: process.env.PORT || 3000,

  // Channel IDs mapped to table names
  channels: {
    users: process.env.CHANNEL_USERS,
    sessions: process.env.CHANNEL_SESSIONS,
    lessons: process.env.CHANNEL_LESSONS,
    modules: process.env.CHANNEL_MODULES,
    quizzes: process.env.CHANNEL_QUIZZES,
    quizResults: process.env.CHANNEL_QUIZ_RESULTS,
    speakingSessions: process.env.CHANNEL_SPEAKING_SESSIONS,
    speakingResults: process.env.CHANNEL_SPEAKING_RESULTS,
    grades: process.env.CHANNEL_GRADES,
    progress: process.env.CHANNEL_PROGRESS,
    announcements: process.env.CHANNEL_ANNOUNCEMENTS,
    feedback: process.env.CHANNEL_FEEDBACK,
    logs: process.env.CHANNEL_LOGS,
    passwordResets: process.env.CHANNEL_PASSWORD_RESETS,
    settings: process.env.CHANNEL_SETTINGS,
  },
};

module.exports = env;
