const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/myself', require('./myself'));
router.use('/chat', require('./chat'));
router.use('/search', require('./search'));

module.exports = router;
