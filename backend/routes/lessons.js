const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/lessonController');

// Public
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Teacher only (authenticated)
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

// Student marks lesson complete
router.post('/:id/complete', auth, ctrl.complete);

module.exports = router;
