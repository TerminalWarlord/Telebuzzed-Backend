const express = require('express');
const { authWall, getFullUserDetails, putEditProfile, putChangePassword } = require('../../controllers/user/authController');
const { postRequest, getList, getContent, getPendingRequests } = require('../../controllers/user/contentController');
const { postUserReview, getReviews } = require('../../controllers/user/reviewController')
const router = express.Router();

const multer = require('multer');
const { getCategories } = require('../../controllers/user/categoryController');
const { getImage } = require('../../controllers/user/imageController');


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

router.post('/user/request', authWall, upload.none(), postRequest);

router.post('/user/review', authWall, upload.none(), postUserReview);
router.get('/reviews', getReviews);
router.get('/categories', getCategories);


router.get('/pending-requests', getPendingRequests);

router.get('/list', getList);
router.get('/details/:username', getContent);



router.get('/image/:imagePath', getImage);
router.get('/user/get-details', getFullUserDetails);

router.put('/user/update', authWall, upload.single('avatar'), putEditProfile, getFullUserDetails);
router.put('/user/change-password', authWall, putChangePassword);




module.exports = router;