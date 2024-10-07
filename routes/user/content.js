const express = require('express');
const { authWall } = require('../../controllers/user/authController');
const { postRequest } = require('../../controllers/user/contentController');
const router = express.Router();

const multer = require('multer');
const upload = multer();

router.post('/request', authWall, upload.none(), postRequest);
// router.post('/signup', postSignUp);





module.exports = router;