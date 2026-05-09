const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');

router.post('/send', messagesController.sendMessage);
router.get('/history/:user1/:user2', messagesController.getChatHistory);
router.patch('/read/:messageId', messagesController.markAsRead);
router.get('/conversations/:userId', messagesController.getConversations);

module.exports = router;
