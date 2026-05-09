const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');

router.get('/all', bookingsController.getAllBookings);
router.get('/:bookingId', bookingsController.getBookingById);
router.get('/tour/:tourId', bookingsController.getBookingsByTour);
router.patch('/:bookingId/cancel', bookingsController.cancelBooking);
router.patch('/:bookingId/status', bookingsController.updateBookingStatus);
router.delete('/:bookingId', bookingsController.deleteBooking);

module.exports = router;
