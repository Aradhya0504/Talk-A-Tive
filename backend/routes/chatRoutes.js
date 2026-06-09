const express = require('express');
const {
  accessOrCreateDM,
  createGroupChat,
  getMyChats,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMyChats);
router.post('/', accessOrCreateDM);
router.post('/group', createGroupChat);
router.put('/group/rename', renameGroup);
router.put('/group/add', addToGroup);
router.put('/group/remove', removeFromGroup);

module.exports = router;
