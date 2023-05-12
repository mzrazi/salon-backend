var express = require('express');
const { userlogin, userSignup, verifyEmail } = require('../controllers/usercontrols');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', userlogin);
router.post('/signup', userSignup)
router.get('/verify-email/:token', verifyEmail)



module.exports = router;
