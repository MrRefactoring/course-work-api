const router = require('express').Router();

router.use(require('./addChat'));
router.use(require('./addMessage'));
router.use(require('./editMessage'));
router.use(require('./getMessages'));
router.use(require('./removeChat'));

module.exports = router;
