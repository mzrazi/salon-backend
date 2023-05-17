var express = require('express');
const { userlogin, userSignup, verifyEmail, userdetails, getgallery, homepagedata, savemessage, findCategoryWithServices } = require('../controllers/usercontrols');
var router = express.Router();
const multer=require('multer');
const User = require('../models/user');
var path=require('path')
const fs = require('fs');



const storageImages = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/userpic');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});


const uploadProfilepic = multer({ storage: storageImages });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', userlogin);
router.post('/signup', userSignup)
router.get('/verify-email/:token', verifyEmail)
router.post("/user-details", userdetails)
router.post('/message',savemessage)
router.put('/edit-profile', uploadProfilepic.single('image'), async (req, res) => {
  try {
    // Find user by id
    var updates = req.body;
    var ID = req.body.userId;

    if (req.file) {
      // Delete previous image if exists
      const user = await User.findById(ID);
      if (user.imagepath) {
        fs.unlink(path.join(__dirname, '..', 'public', user.imagepath), (err) => {
          if (err) console.log(err);
          console.log(`${user.imagepath} was deleted`);
        });
      }

      // Update image path
      updates.imagepath = `/images/userpic/${req.file.filename}`;
    }

    // Update user details
    const updatedUser = await User.findOneAndUpdate(
      { _id: ID },
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({ status: 200, message: "Profile updated successfully", updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "error updating profile", err: error });
  }
});

router.get('/gallery',getgallery)
router.get('/home',homepagedata)
router.post('/services-page',findCategoryWithServices)







module.exports = router;
