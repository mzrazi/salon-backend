const User=require('../models/user')
const  mongoose=require('mongoose')
var jwt = require('jsonwebtoken');
const bcrypt=require("bcrypt")
const nodemailer = require('nodemailer');
const gallery = require('../models/gallerymodel');
var Offer=require('../models/offersmodel');
const Contact = require('../models/contactmodel');
const banner = require('../models/bannermodel');
var Category=require('../models/categorymodel');
const reviewpicmodel = require('../models/reviewpicmodel');
const Message = require('../models/messagemodel');
const Service = require('../models/servicemodel');
const { calculateCurrentPrice } = require('./helpers');
const Appointment = require('../models/appointmentmodel');
const Cancelledappointment = require('../models/cancelledappointmentmodel');
const Cart = require('../models/cartmodel');
const Completedappointment = require('../models/completedappointmentmodel');

const Specialist = require('../models/specialistmodel');
const Review = require('../models/reviewmodel');



module.exports={

    userSignup: async (req, res) => {
        try {
          const userdata = req.body;
          console.log(userdata);
        
          // Check if the email already exists and is verified
          const existingVerifiedUser = await User.findOne({ 
            email: userdata.email, 
            emailverified: true 
          });
          console.log(existingVerifiedUser);
          if (existingVerifiedUser) {
            return res.status(400).json({status:400, message: 'User already exists' });
          }
        
          // Check if the email already exists but is not verified
          let existingUser = await User.findOne({ 
            email: userdata.email, 
            emailverified: false 
          });
        
          if (existingUser) {
            // Generate a new token
            const token = jwt.sign({ email: userdata.email }, process.env.SECRET_KEY, {
              expiresIn: "1h"
            });
            const transporter = nodemailer.createTransport({
              host: 'smtp-relay.sendinblue.com',
              port: 587,
              secure: false,
              auth: {
                user: process.env.MAILER_Email,
                pass: process.env.MAILER_PASSWORD
              }
            });
            const mailOptions = {
              from: process.env.MAILER_Email,
              to: userdata.email,
              subject: 'Verify your email address',
              text: `Please click the following link to verify your email address:${process.env.APP_URL}/salon/verify-email/${token}`
            };
        
            try {
              await transporter.sendMail(mailOptions);
              console.log( "mail"+process.env.MAILER_Email);
              console.log('Email sent successfully');
              // Your code to handle success goes here
            } catch (error) {
              console.log('Error sending email:', error);
              // Your code to handle error goes here
            }
            
            return res.status(201).json({ status:201,
              message: 'User already exists, a new verification email has been sent', 
              user: existingUser 
            });
          } else {
            // Hash the password
            const hash = await bcrypt.hash(userdata.password, 10);
            // Create a new user
            const user = new User({ 
              userName: userdata.userName,
              Phone: userdata.phone,
              email: userdata.email,
              password: hash,
              emailverified: false
            });
        
            // Save the user
            await user.save();
    
          
            const token = jwt.sign({ email: userdata.email }, process.env.SECRET_KEY, {
              expiresIn: "1h"
            });
            // Send an email with the token
            const transporter = nodemailer.createTransport({
              host: 'smtp-relay.sendinblue.com',
              port: 587,
              secure: false,
              auth: {
                user: process.env.MAILER_Email,
                pass: process.env.MAILER_PASSWORD
              }
            });
           
          
            const mailOptions = {
              from: process.env.MAILER_Email,
              to: userdata.email,
              subject: 'Verify your email address',
              text: `Please click the following link to verify your email address:${process.env.APP_URL}/salon/verify-email/${token}`
            };
            
            try {
              await transporter.sendMail(mailOptions);
          
              console.log('Email sent successfully');
              // Your code to handle success goes here
            } catch (error) {
              console.log('Error sending email:', error);
              // Your code to handle error goes here
            }
            
            
            return res.status(201).json({ status:201,
              message: 'User created, verification email sent', 
              user 
            });
          }
         }catch (error) {
            console.log(error);
                return res.status(500).json({status:500, message: error.message });
           }
            },

    verifyEmail: async(req, res) => {
     try {
                  const token = req.params.token;
                  const decoded = jwt.verify(token, process.env.SECRET_KEY);
                  const user = await User.findOne({ email: decoded.email });
                  console.log(user);
                  if (!user) {
                    return res.status(401).json({ status: 401, message: "User not found" });
                  }
                  user.emailverified = true;
                  await user.save();
                  return res.status(200).json({ status: 200, message: "Email verified successfully" });
                } catch (error) {
                  console.error(error);
                  return res.status(500).json({ message:"error ",error });
        }
    },
    userlogin: async (req, res) => {
        const { email, password, token } = req.body;
        try {
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(401).json({ status: 401, message: "User not found" });
        }
        if (!user.emailverified) {
        return res.status(401).json({ status: 401, message: "email not verified" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
        return res.status(401).json({ status: 401, message: "Incorrect password" });
        }
        user.tokens.push(token);
        await user.save();
                    
        return res.status(200).json({ status: 200, message: "Login successful", user });
        } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Server error" });
        }
        },   
        

  homepagedata: async (req, res) => {
            try {
              const offers = await Offer.find({});
              
          
              const categories = await Category.find({});
             
          
              const banners = await banner.find().populate({
                path: 'services',
                populate: {
                  path: 'offer',
                },
              })
              .exec();
              console.log(banners);
              
              banners.forEach((banner) => {
                banner.services.forEach((service) => {
                  service.currentPrice = calculateCurrentPrice(service);
                });
              });
              
                
             
              
              const contact = await Contact.find({});
              const reviewpic= await reviewpicmodel.find({})

              res.status(200).json({
                status: 200,
                message: "success",
                categories,
                offers,
                banners,
                reviewpic,
                contact,
              });
            } catch (error) {
              console.error(error);
              res.status(500).json({ message: "Error retrieving data" });
            }
          },


            
    userdetails:async (req,res)=>{
        try {
          var id = req.body.userId
        
       const user= await User.findById(id).exec()
       if (!user) {
        return res.status(404).json({status:404, message: "User not found" });
      }
      return res.status(200).json({status:200,message:"succesful", user });
      } catch (error) {
          return res.status(500).json({status:500, message: "Error retrieving user" });
          
        }
      },
    
      getgallery:async(req,res)=>{
        try {

           const images=await gallery.find({}).exec()
           return res.status(200).json({status:200,message:"succesful", images });
            
        } catch (error) {
            return res.status(500).json({status:500, message: "Error retrieving gallery",error });
        }
      },
      savemessage:async(req,res)=>{

        var {title,email,message}=req.body
    
        
    
        var newmessage=new Message({
          title:title,
          useremail:email,
          message:message,
        })
        try {
          
          newmessage.save().then((doc)=>{
            res.status(200).json({status:200,message:"succesfull",newmessage})
          }).catch((err)=>{
            res.status(404).json({status:404,message:err.message})
          })
        } catch (error) {
    
          res.status(500).json({status:500,message:"internal error",err:error})
        }
    
    
    
      },

      getAllNotifications:async(req,res)=>{
  
        const { userId } = req.body;
      
        try {
          const Notifications= await notificationmodel
            .find({ $or: [{ user: userId }, { user: 'all' }] })
            .sort({ createdAt: -1 })
            .exec();
      
          if (Notifications.length === 0) {
            return res.status(404).json({ success: false, message: 'notifications not found for user' });
          }
      
          return res.status(200).json({ success: true, data: Notifications});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ success: false, message: 'Error fetching notifications' });
        }
      },


    findCategoryWithServices : async (req, res) => {
        const categoryId = req.body.categoryId;
      
        try {
          const category = await Category.findById(categoryId)
            .populate({
              path: 'services',
              populate: {
                path: 'offer',
                model: 'Offer',
              },
            })
            .exec();
      
          if (!category) {
            return res.status(404).json({ error: 'Category not found' });
          }
      
          // Category found with populated services
          const services = category.services;
      
          services.forEach(service => {
            const offer = service.offer;
      
            if (offer) {
              const discountPercentage = offer.discountPercentage;
              const currentPrice = service.price - (service.price * discountPercentage / 100);
                console.log(currentPrice);
              service.currentPrice = currentPrice;
            } else {
                service.currentPrice = service.price;
              }
          });
      
          res.status(200).json(category);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      },
  findServiceByIdAndGetRecommendedServices : async (req, res) => {
        const serviceId = req.body.serviceId;
      
        try {
          const service = await Service.findById(serviceId)
          .populate({
            path: 'category',
            model: 'Category',
            populate: {
              path: 'services',
              model: 'Service',
              populate: {
                path: 'offer',
                model: 'Offer',
              },
            },
          })
          .populate({
            path: 'offer',
            model: 'Offer',
          })
          .exec();
        

          console.log(service);
      
          if (!service) {
            return res.status(404).json({ error: 'Service not found' });
          }
      
          // Service found with populated category
          const recommendedServices = service.category.services.filter(s => s._id !== service._id);
          const selectedservice=await Service.findById(serviceId).populate('offer')
      
          // Calculate the current price for the service and the recommended services
          selectedservice.currentPrice = calculateCurrentPrice(service);
          recommendedServices.forEach(s => s.currentPrice = calculateCurrentPrice(s));
      
          res.status(200).json({
            selectedservice,
            recommendedServices,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      },

      findOfferAndPopulateServices: async (req, res) => {
        const offerId = req.body.offerId;
      
        try {
          // Find the offer document
          const offer = await Offer.findById(offerId)
          .populate({
            path: 'services',
            model: 'Service',
            populate: {
              path: 'offer',
              model: 'Offer',
            },
          })
          .exec();
        
      
          if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
          }
      
        
          offer.services.forEach(service =>service.currentPrice =  calculateCurrentPrice(service));
      
        
          
          res.status(200).json({message:'succces',offer});
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      },
      bookingpage: async (req, res) => {
        try {
         
          const timestamp = req.body.date; // Unix timestamp in seconds
          const dateObj = new Date(timestamp * 1000);
          const appointmentsByDate = [];
      
          // Create start and end of day
          const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
          const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
          // Find all appointments for the day
          const appointments = await Appointment.find({
            date: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          }).exec();
      
          // Group appointments by timeslot
          const appointmentsByTimeSlot = {};
          appointments.forEach((appointment) => {
            if (!appointmentsByTimeSlot[appointment.timeslot]) {
              appointmentsByTimeSlot[appointment.timeslot] = [];
            }
            appointmentsByTimeSlot[appointment.timeslot].push(appointment);
          });
      
          // Create timeSlots array
          const timeSlots = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];
      
          // Remove time slots that have appointments booked
          Object.entries(appointmentsByTimeSlot).forEach(([timeslot, appointments]) => {
            const index = timeSlots.indexOf(timeslot);
            if (index !== -1) {
              timeSlots.splice(index, 1);
            }
          });
      
   
          appointmentsByDate.push({ date: timestamp, timeSlots: timeSlots });
      
          return res.status(200).json({ message: 'success', appointmentsByDate });
        } catch (error) {
          res.status(500).json({ message: 'error', error: error.message });
        }
      },
      
      
      addAppointment : async (req, res) => {
        try {
          const timestamp = req.body.date; // Unix timestamp in seconds
  const date = new Date(timestamp * 1000); // convert to milliseconds
  // output: Wed May 05 2021 15:45:01 GMT-0400 (Eastern Daylight Time)
  
  
          // create a new appointment object
          const newAppointment = new Appointment({
            date:date,
            timeslot: req.body.timeslot,
            services: req.body.serviceId, // assuming you have an array of serviceIds in the form data
            userId: req.body.userId,
            totalAmount: req.body.totalAmount,
            totalDuration: req.body.totalDuration,
          });
      
          // save the appointment to the database
          const savedAppointment = await newAppointment.save();
      
          // populate the service data for the saved appointment
          await savedAppointment.populate('services')
          
          await Cart.findOneAndUpdate(
            { userId: req.body.userId },
            { $set: { services: [] } }
          );
      
      
          res.status(200).json({ message: 'Appointment added successfully', appointment: savedAppointment });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Error adding appointment', error });
        }
      },


      userCancelAppointment:async(req,res)=> {
        try {
  
          const {appointmentId,reason}=req.body
          const appointment = await Appointment.findById(appointmentId)
          if (!appointment) {
           return  res.status(404).json({message:'Appointment not found'});
          }
          const cancelledAppointment = new Cancelledappointment({
            date: appointment.date,
            timeslot: appointment.timeslot,
            services: appointment.services,
            userId: appointment.userId,
            specialistId:appointment.specialistId,
            totalAmount: appointment.totalAmount,
            totalDuration: appointment.totalDuration,
            reason:reason,
            cancelledby:'user'
          });
          const cancelled =await cancelledAppointment.save();
          if(!cancelled){
            return res.status(500).json({status:500 ,message:'cancellation error'})
          }
          const deleted=await Appointment.findByIdAndDelete(appointmentId);
  
          if(!deleted){
            cancelledAppointment.deleteOne()
  
            return res.status(500).json({status:500 ,message:'cancellation error'})
  
          }
  
          // const specialist=await Specialist.findById(appointment.specialistId)
          // const tokens=specialist.tokens
          // const response = await admin.messaging().sendMulticast({
          //   tokens,
          //   notification: {
          //     title:' cancelled ',
          //     body: 'appointment cancelled by user because of' +reason
          //   }
          // });
          // console.log('FCM response:', response);
  
  
          
          return res.status(200).json({message:'success',cancelledAppointment})
        } catch (err) {
          return res.status(500).json({message:'error',err})
          
         
        }
      },

addToCart : async (req, res) => {
        const { userId, serviceId } = req.body;
      
        try {
          const cart = await Cart.findOne({ user: userId });
          if (!cart) {
            // If cart doesn't exist, create a new one
            const newCart = new Cart({
              user: userId,
              services: [serviceId],
            });
            await newCart.save();
           return res.status(200).json({ message: 'Service added to cart' ,newCart});
          } else {
            // If cart exists, add the service to the existing cart
            cart.services.push(serviceId);
            await cart.save();
            return res.status(200).json({ message: 'Service added to cart' ,cart});
          }
      
         
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error adding service to cart' });
        }
      },

      
 removeFromCart:async (req, res) => {
  const { userId, serviceId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const serviceIndex = cart.services.indexOf(serviceId);
    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service not found in cart' });
    }

    cart.services.splice(serviceIndex, 1);
    await cart.save();

    res.status(200).json({ message: 'Service removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error removing service from cart' });
  }
},


 getCartByUserId: async (req, res) => {
  const { userId } = req.body;

  try {
    var cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'services',
        populate: {
          path: 'offer',
        },
      })
      .exec();

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Calculate the actual price for each service in the cart
   cart.services = cart.services.map((service) => {
      service.currentPrice = calculateCurrentPrice(service);
      return service;
    });

    res.status(200).json({ cart});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving cart' });
  }
},

getupcomingappointments:async(req,res)=>{
  try{

    const {userId}=req.body
  
    var upcomingAppointments = await Appointment.find({
      userId: userId,
      status: 'booked'
      
    })
    .populate('userId')
    .populate('services')
    .populate('specialistId')
    .exec()
    console.log(upcomingAppointments);

  
    
    
    if (upcomingAppointments.length === 0) {
      return res.status(404).json({ message: 'No upcoming appointments found' });
    }
     
    const updatedAppointments = upcomingAppointments.map((appointment) => {
      const updatedServices = appointment.services.map((service) => {
        service.currentPrice = calculateCurrentPrice(service);
        return service;
      });

      appointment.services = updatedServices;
      return appointment;
    });
    return res.status(200).json({ message: 'success', appointments:updatedAppointments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error finding appointments', error });
  }},

 completedappointments:async (req,res)=>{
    try {

      const{userId}=req.body

      var appointments=await  Completedappointment.find({userId}) 
      .populate('userId')
      .populate('services')
      .populate('specialistId')
      .exec()
      console.log('completed'+appointments);

      

      if(!appointments){
       return res.status(404).json({message:'not found'})
      }

      const updatedAppointments = appointments.map((appointment) => {
        const updatedServices = appointment.services.map((service) => {
          service.currentPrice = calculateCurrentPrice(service);
          return service;
        });
  
        appointment.services = updatedServices;
        return appointment;
      });
      return res.status(200).json({ message: 'success', appointments:updatedAppointments });

    } catch (error) {
      console.log(error);
     return  res.status(500).json({message:'error',error})
    }
  },

  assignSpecialist :async (req, res) => {
    const appointmentId = req.body.appointmentId;
    const specialistId = req.body.specialistId;
  
    try {
      // Check if the appointment exists
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      // Assign the specialist to the appointment
      appointment.specialistId = specialistId;
      await appointment.save();
  
      res.status(200).json({ message: 'Specialist assigned successfully', appointment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error assigning specialist to appointment' });
    }
  },


  

searchServices :async (req, res) => {
  const keyword = req.body.keyword

  try {
    // Find services that match the keyword or have similar attributes
    var services = await Service.find({
      
         title: { $regex: keyword, $options: 'i' }  // Case-insensitive title match
        }).populate('offer')

       services = services.map((service) => {
          service.currentPrice = calculateCurrentPrice(service);
          return service;
        });
    

    res.status(200).json({message:"success", services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching services' });
  }
},


addreview:async(req,res)=>{
  const { appointmentId, review, reliability, tidiness, response, accuracy, pricing, rating, complete,recommendation} = req.body;
  try {

    const appointment=await  Completedappointment.findById(appointmentId)
    if(!appointment){
      return res.status(404).json({message:"not found"})
    }
    console.log(appointment);

    if(!appointment.userId || !appointment.specialistId) {
      return res.status(400).json({ message: "Missing userId or specialistId in appointment" });
    }

    const existingReview = await Review.findOne({ appointmentId });
    if(existingReview) {
      return res.status(400).json({ message: "A review has already been submitted for this appointment" });
    }

    const {userId,specialistId}=appointment
    const newReview = new Review({userId,specialistId, appointmentId, review, reliability, tidiness, response, accuracy, pricing, rating, complete,recommendation});
    const savedReview = await newReview.save();
    const specialist=await Specialist.findById(specialistId)
    const reviewId = savedReview._id
    specialist.reviews.push(reviewId)
    await specialist.save();
    await Completedappointment.findByIdAndUpdate(
      appointmentId,
      { reviewed: true },
      { new: true }
    );


    res.status(201).json({message:'done',savedReview});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }

},





    }
    
    
      
      
      
          
      

