var express = require('express');
var router = express.Router();
const multer=require('multer')
var path=require('path')
const mongoose=require('mongoose')
const fs = require('fs');
const Category = require('../models/categorymodel');
const Contact = require('../models/contactmodel');
const Service = require('../models/servicemodel');
const specialist = require('../models/specialistmodel');
const Offer=require('../models/offersmodel');
const gallery = require('../models/gallerymodel');
const { addContact, sendnotification, completedjob } = require('../controllers/admincontrol');
const banner = require('../models/bannermodel');
const reviewpic = require('../models/reviewpicmodel');



const storageGallery = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/gallery');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});
const storagereview= multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/review');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});


const storageImages = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/categories');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});
const storageServices = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/services');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});

const storageOffers = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/offers');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});
const storagebanner = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/banners');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});
const storagespecialists = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/specialists');
  },
  filename: function(req, file, cb) {
    cb(null, `file-${Date.now()}-${Math.random()}${path.extname(file.originalname)}`);
  }
});

const uploadCategories = multer({ storage: storageImages });
const uploadOffers = multer({ storage: storageOffers });
const uploadSpecialist = multer({ storage:storagespecialists });
const uploadservices = multer({ storage:storageServices });
const uploadGallery=multer({ storage: storageGallery});
const uploadbanner=multer({ storage: storagebanner});
const uploadreview=multer({ storage: storagereview});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/add-offers', uploadOffers.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No image file provided');
    }

    const newOffer = new Offer({
      imagepath: `/images/offers/${req.file.filename}`,
      services: req.body.services,
      discountPercentage: req.body.discountPercentage
    });

    const savedOffer = await newOffer.save();

    const offerId = savedOffer._id;
    const serviceIds = req.body.services;

    await Service.updateMany(
      { _id: { $in: serviceIds } },
      { offer: offerId }
    );

    res.status(200).json({ message: 'Offer added successfully' });
  } catch (error) {
    console.error(error);

    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error(err);
        console.log(`${req.file.path} was deleted`);
      });
    }

    res.status(500).json({ message: 'Error adding offer', error: error.message });
  }
});



router.post('/add-category',uploadCategories.single('image'),async(req,res)=>{

  console.log(req.body);
  var data=req.body
  var newcategory= new Category({
    title:data.title,
    imagepath:`/images/categories/${req.file.filename}`
  })
   try { 
   await newcategory.save() 
    res.status(200).json({message:'done',newcategory})
  } catch (error) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
      console.log(`${req.file.path} was deleted`);
    });
    res.status(500).json({message:'error'+error})
  }
  
  })

  router.post('/add-specialist',uploadSpecialist.single('image'),async(req,res)=>{
    var data=req.body
    console.log(data);
   
    var newspecialist= new specialist({
      name:data.name,
      // categories:data.categoryId,
      whatsapp:data.whatsapp,
      email:data.email,
      password:data.password,
      imagepath:`/images/specialists/${req.file.filename}`
    })
     try { 
     await newspecialist.save() 
      res.status(200).json({message:'done',newspecialist})
    } catch (error) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
        console.log(`${req.file.path} was deleted`);
      });
      res.status(500).json({message:error,newspecialist})
    }
    
    }) 

    router.post('/add-service', uploadservices.array('images', 5), async (req, res) => {
      try {
        const categoryId = req.body.categoryId;
    
        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
    
        // Create an array to store the image paths
        const imagePaths = req.files.map((file) => `/images/services/${file.filename}`);
       
        // Create a new service object
        const newService = new Service({
          title: req.body.title,
          price: req.body.price,
          duration: req.body.duration,
          description: req.body.description,
          imagepath: imagePaths,
          category: categoryId,
        });
    
        // Save the service to the database
        const savedService = await newService.save();
    
        // Add the service ID to the services array of the category
        await Category.findByIdAndUpdate(categoryId, {
          $push: { services: savedService._id },
        });
    
        res.status(200).json({ message: 'Service added successfully', service: savedService });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding service' });
      }
    });
    

  router.post('/save-image', uploadGallery.single('image'), async (req, res) => {
    try {
      console.log(req.file);
      const newimage = new gallery({
        imagePath: `/images/gallery/${req.file.filename}`
      });
    
      await newimage.save();
    
      res.status(200).json({ message: "done" },newimage);
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log(err);
          console.log(`${req.file.path} was deleted`);
        });
      }
      res.status(500).json({ message: "error", error });
    }
  });

  router.post('/add-banner', uploadbanner.single('image'), async (req, res) => {

    console.log(req.body);
   
    
    try {
      var newbanner = new banner({
        imagepath: `/images/banners/${req.file.filename}`,
        services: req.body.services , 
      }); 
  
      const savedbanner = await newbanner.save();
  
      
      res.status(200).json({ message: 'done',savedbanner });
    } catch (error) {
      console.log(error);
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
        console.log(`${req.file.path} was deleted`);
      });
      res.status(500).json({ message: 'error' ,error});
    }
  });

  router.post('/save-reviewimage', uploadreview.single('image'), async (req, res) => {
    try {
      console.log(req.file);
      const newimage = new reviewpic({
        imagePath: `/images/review/${req.file.filename}`
      });
    
      await newimage.save();
    
      res.status(200).json({ message: "done" ,newimage});
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log(err);
          console.log(`${req.file.path} was deleted`);
        });
      }
      res.status(500).json({ message: "error", error });
    }
  });

  router.post('/add-contact',addContact)
  router.post('/send-notification',sendnotification)
  router.post('/complete-job',completedjob)
  

module.exports = router;
