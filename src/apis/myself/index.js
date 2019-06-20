const router = require('express').Router();

router.use(require('./addBiometricData'));
router.use(require('./getChats'));

module.exports = router;
