const express = require('express');
const { authWall } = require('../../controllers/user/authController');

const { getUserRequests, postAdminApproval } = require('../../controllers/admin/manageContentController');

const router = express.Router();

const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/') // Specify the directory where files will be saved
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname) // Generate a unique filename
        }
    })
});
// TODO: add back authwall

router.get('/requests', authWall, upload.none(), getUserRequests);
router.post('/requests', authWall, upload.none(), postAdminApproval);






module.exports = router;