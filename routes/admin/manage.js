const express = require('express');
const { authWall } = require('../../controllers/user/authController');

const { getUserRequests, postAdminApproval } = require('../../controllers/admin/manageContentController');

const router = express.Router();

const multer = require('multer');
const upload = multer();

// TODO: add back authwall

router.get('/requests', authWall, upload.none(), getUserRequests);
router.post('/requests', authWall, upload.none(), postAdminApproval);
// router.post('/signup', postSignUp);





module.exports = router;