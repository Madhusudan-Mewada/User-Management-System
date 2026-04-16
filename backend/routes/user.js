
// routes/user.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, createUser, updateUser, deleteUser, updateProfile } = require('../controllers/userController');

router.get('/', protect, authorize('Admin', 'Manager'), getUsers);
router.post('/', protect, authorize('Admin'), createUser);
router.put('/me', protect, updateProfile);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateUser);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteUser);
module.exports = router;