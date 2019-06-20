const router = require('express').Router();

router.use(require('./signIn'));
router.use(require('./signUp'));
router.use(require('./byFace'));

module.exports = router;
