const express = require('express');
const router = express.Router();
const toursController = require('../controllers/tours.controller');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/create-tour', upload.any(), toursController.create_tour);
router.post('/update-tour/:id', upload.any(), toursController.updateTour);
router.get('/view-tour', toursController.view_tour);
router.get('/view-tour/:id', toursController.get_tour_by_id);
router.delete('/delete-tour/:id', toursController.deleteTour);

module.exports = router;
