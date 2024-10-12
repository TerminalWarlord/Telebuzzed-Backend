
const { adminPostSubmission, getAllPosts, getPostDetails, putEditPost, deletePost } = require('../../controllers/admin/postController');
const express = require('express');
const { authWall } = require('../../controllers/user/authController');


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

router.put('/post/edit/:postSlug', authWall, upload.single('file'), putEditPost);
router.post('/post', authWall, upload.single('file'), adminPostSubmission);
router.delete('/post/delete/:postSlug', authWall, deletePost);
router.get('/post', getPostDetails);
router.get('/all_posts', getAllPosts);



module.exports = router;