const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/generate', aiController.generateResponse);
router.post('/bot', aiController.chatWithBot);

module.exports = router;
