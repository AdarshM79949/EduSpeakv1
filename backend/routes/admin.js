const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(auth); // All admin routes require auth

// Users
router.get('/users', ctrl.getUsers);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

// Analytics
router.get('/analytics', ctrl.analytics);

// Logs
router.get('/logs', ctrl.getLogs);

// Announcements
router.get('/announcements', ctrl.getAnnouncements);
router.post('/announcements', ctrl.createAnnouncement);

// Settings
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);

// Feedback
router.get('/feedback', ctrl.getFeedback);

module.exports = router;
