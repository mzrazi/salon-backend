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



const storageGallery = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/gallery');
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

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/add-offers', uploadOffers.single('image'), async (req, res) => {

  console.log(req.body);
 
  
  try {
    var newoffer = new Offer({
      imagepath: `/images/offers/${req.file.filename}`,
      services: req.body.services , // Assuming the selected service IDs are sent in the request body as an array in the 'services' field
      percentage:req.body.percentage
    }); 

    const savedOffer = await newoffer.save();

    // Update the service documents with the offer ID
    const offerId = savedOffer._id;
    const serviceIds = req.body.services;

    await Service.updateMany(
      { _id: { $in: serviceIds } },
      { offer: offerId  }
    );

    res.status(200).json({ message: 'done' });
  } catch (error) {
    console.log(error);
    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
      console.log(`${req.file.path} was deleted`);
    });
    res.status(500).json({ message: 'error' ,error});
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
      categories:data.categoryId,
      whatsapp:data.whatsappNumber,
      email:data.email,
      password:data.password,
      imagepath:`/images/specialists/${req.file.filename}`
    })
     try { 
     await newspecialist.save() 
      res.status(200).json({message:'done'})
    } catch (error) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
        console.log(`${req.file.path} was deleted`);
      });
      res.status(500).json({message:error,newspecialist})
    }
    
    }) 

  router.post('/add-service',uploadservices.single('image'),async(req,res)=>{
    try {
      const categoryId = req.body.categoryId;
  
      // Check if the category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Create a new service object
      const newService = new Service({
        title: req.body.title,
        price: req.body.price,
        duration: req.body.duration,
        description: req.body.description,
        imagepath:`/images/services/${req.file.filename}`,
        category: categoryId
      });
  
      // Save the service to the database
      const savedService = await newService.save();
  
      // Add the service ID to the services array of the category
      await Category.findByIdAndUpdate(categoryId, {
        $push: { services: savedService._id }
      });
  
      res.status(200).json({ message: 'Service added successfully', service: savedService });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding service' });
    }
  
  })

  router.post('/save-image', uploadGallery.single('image'), async (req, res) => {
    try {
      console.log(req.file);
      const newimage = new gallery({
        imagePath: `/images/gallery/${req.file.filename}`
      });
    
      await newimage.save();
    
      res.status(200).json({ message: "done" });
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
  

module.exports = router;
