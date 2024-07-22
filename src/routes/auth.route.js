const { Router } = require('express');
const { register, login, adminLogin, getUsers } = require('../controllers/auth.controller');
const { isAdmin } = require('../middlewares/is-admin.middleware');
const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/admin/login', adminLogin)
router.get('/users', isAdmin, getUsers)

module.exports = router;