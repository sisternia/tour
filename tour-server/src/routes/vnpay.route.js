const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpay.controller');

router.post('/create_payment_url', vnpayController.createPaymentUrl);
router.post('/create_offline_booking', vnpayController.createOfflineBooking);
router.get('/return', vnpayController.vnpayReturn);
router.get('/ipn', vnpayController.vnpayIpn);
router.get('/status/:bookingId', vnpayController.getPaymentStatus);

module.exports = router;
