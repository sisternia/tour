const express = require('express');
const router = express.Router();
const guidesController = require('../controllers/guides.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create-guide', upload.single('avatar'), guidesController.createGuide);
router.get('/get-guides', guidesController.getGuides);
router.get('/view-guide', guidesController.view_guide);

// Language and Field routes
router.post('/add-language', guidesController.addLanguage);
router.post('/add-field', guidesController.addField);
router.get('/get-languages', guidesController.getLanguages);
router.get('/get-fields', guidesController.getFields);
router.get('/get-guide/:id', guidesController.getGuideById);
router.post('/update-guide/:id', upload.single('avatar'), guidesController.updateGuide);
router.delete('/delete-guide/:id', guidesController.deleteGuide);

module.exports = router;
