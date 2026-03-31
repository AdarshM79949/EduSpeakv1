const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/teacherController');

router.use(auth); // All teacher routes require auth

router.get('/stats', ctrl.stats);
router.get('/students', ctrl.getStudents);
router.get('/lessons', ctrl.myLessons);
router.get('/quizzes', ctrl.myQuizzes);
router.get('/grades', ctrl.getGrades);
router.post('/grades', ctrl.createGrade);
router.get('/student/:studentId/progress', ctrl.studentProgress);

module.exports = router;
