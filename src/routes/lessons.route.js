const { Router } = require('express');
const { show, create, update, remove } = require('../controllers/lessons.controller');
const { isAdmin } = require('../middlewares/is-admin.middleware');
const router = Router();

router.get('/lessons', show);
router.post('/lessons', isAdmin, create);
router.put('/lessons/:id', isAdmin, update);
router.delete('/lessons/:id', isAdmin, remove);

module.exports = router;