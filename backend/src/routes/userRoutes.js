const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, deleteAccount, upgradePremium, toggleTwoFactor, getNotifications, readNotification } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);
router.post('/upgrade', upgradePremium);
router.post('/2fa', toggleTwoFactor);
router.get('/notifications', getNotifications);
router.put('/notifications/:id', readNotification);

module.exports = router;
