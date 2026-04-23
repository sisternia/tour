const express = require('express');
const router = express.Router();
const guidesController = require('../controllers/guides.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create-guide', upload.single('avatar'), guidesController.createGuide);
router.get('/view-guide', guidesController.view_guide);

module.exports = router;
