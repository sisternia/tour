const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications.controller');

router.get('/get-notifications/:userId', notificationController.getNotifications);
router.put('/mark-as-read/:notificationId', notificationController.markAsRead);
router.put('/mark-all-read/:userId', notificationController.markAllAsRead);

module.exports = router;
