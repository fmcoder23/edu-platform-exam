const { Router } = require('express');
const { show, create, update, remove, enroll, enrollments } = require('../controllers/courses.controller');
const { isAdmin } = require('../middlewares/is-admin.middleware');
const { isAuth } = require('../middlewares/is-auth.middleware');
const router = Router();

router.get('/courses', show);
router.get('/courses/enrollments', isAuth, enrollments);
router.post('/courses', isAdmin, create);
router.post('/courses/enroll/:courseId', isAuth, enroll);
router.put('/courses/:id', isAdmin, update);
router.delete('/courses/:id', isAdmin, remove);

module.exports = router;