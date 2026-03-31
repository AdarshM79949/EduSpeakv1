const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/quizController');

// Public
router.get('/', ctrl.getAll);
router.get('/results/me', auth, ctrl.myResults);
router.get('/:id', ctrl.getOne);
router.get('/:id/results', auth, ctrl.quizResults);

// Authenticated
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);
router.post('/:id/submit', auth, ctrl.submit);

module.exports = router;
