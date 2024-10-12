const express = require('express');
const { authWall, getFullUserDetails } = require('../../controllers/user/authController');
const { postRequest, getList, getContent, getPendingRequests } = require('../../controllers/user/contentController');
const { postUserReview, getReviews } = require('../../controllers/user/reviewController')
const router = express.Router();

const multer = require('multer');
const { getCategories } = require('../../controllers/user/categoryController');
const { getImage } = require('../../controllers/user/imageController');
const upload = multer();

router.post('/user/request', authWall, upload.none(), postRequest);

router.post('/user/review', authWall, upload.none(), postUserReview);
router.get('/reviews', getReviews);
router.get('/categories', getCategories);


router.get('/pending-requests', getPendingRequests);

router.get('/list', getList);
router.get('/details/:username', getContent);



router.get('/image/:imagePath', getImage);
router.get('/user/get-details', getFullUserDetails);





module.exports = router;