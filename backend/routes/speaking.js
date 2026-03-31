const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/speakingController');

router.get('/exercises', ctrl.getExercises);
router.post('/submit', auth, ctrl.submit);
router.get('/history', auth, ctrl.history);
router.get('/results/:exerciseId', auth, ctrl.getResult);

module.exports = router;
