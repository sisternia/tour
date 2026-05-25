const express = require('express');
const router = express.Router();
const multer = require('multer');
const reviewsController = require('../controllers/reviews.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', upload.array('images', 10), reviewsController.createReview);
router.get('/tour/:tour_id', reviewsController.getReviewsByTour);
router.get('/user/:user_id/images', reviewsController.getUserReviewImages);
router.get('/can-review/:tour_id', reviewsController.getReviewableBookings);

module.exports = router;
