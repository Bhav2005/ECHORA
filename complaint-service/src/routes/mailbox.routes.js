const express = require('express');
const mailboxController = require('../controllers/mailbox.controller');

const router = express.Router();

router.get('/:mailboxId', mailboxController.getMailboxMessages);
router.post('/:mailboxId/reply', mailboxController.addReply);

module.exports = router;
