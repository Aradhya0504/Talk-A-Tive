const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/:chatId', getMessages);

module.exports = router;
