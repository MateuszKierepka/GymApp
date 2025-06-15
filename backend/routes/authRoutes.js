const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/send-verification-code', authController.sendVerificationCode);
router.post('/verify-code', authController.verifyCode);
router.post('/reset-password', authController.resetPassword);

router.use(auth);
router.put('/account', authController.updateAccount);
router.put('/password', authController.updatePassword);
router.delete('/account', authController.deleteAccount);

module.exports = router;