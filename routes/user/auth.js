const express = require('express');

const router = express.Router();

const { postSignIn, postSignUp, getUser } = require('../../controllers/user/authController');


router.post('/signin', postSignIn);
router.post('/signup', postSignUp);

router.get('/me', getUser)





module.exports = router;