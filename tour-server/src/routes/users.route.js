const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');

router.post('/register', userController.register);
router.post('/verify-otp', userController.verifyOTP);
router.post('/resend-otp', userController.resendOTP);
router.post('/login', userController.login);
router.post('/check-email', userController.checkEmailExists);
router.post('/reset-password', userController.resetPassword);
router.get('/view-customer', userController.view_customer);

module.exports = router;