const Contact = require('../models/contactmodel');
const  mongoose=require('mongoose');
const notification = require('../models/notificationmodel');
const User = require('../models/user');
const admin = require('firebase-admin');
const Appointment = require('../models/appointmentmodel');
const Completedappointment = require('../models/completedappointmentmodel');




const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
module.exports={


addContact:async(req,res)=>{

        const { phoneNumber, whatsappNumber } = req.body;
  console.log(req.body);
        try {
          let contact = await Contact.findOne();
          if (contact) {
            contact.phoneNumber = phoneNumber;
            contact.whatsappNumber = whatsappNumber;
            await contact.save();
            res.status(200).json({ message: 'Contact information updated successfully.',contact });
          } else {
            contact = new Contact({ phoneNumber, whatsappNumber });
            await contact.save();
            res.status(200).json({ message: 'Contact information added successfully.',contact });
          }
        } catch (error) {
          res.status(500).json({ message:error ,errmessage: 'Failed to save contact information.' });
        }


        
    },


sendnotification:async(req,res)=>{
        const { title, message, selectedUsers } = req.body;
  
        const body =message

  
        try {
          // If "Select All" is checked, retrieve all email-verified users' tokens
          let tokens = [];
          if (selectedUsers === 'all') {
            const users = await User.find({ emailverified: true });
            tokens = users.flatMap((user) => user.tokens);
            console.log(tokens);
          } else if (selectedUsers) { // Find the specific user and retrieve their token
            const user = await User.findOne({ _id: selectedUsers });
            if (!user) {
            return res.status(400).json({message:'User not found'});
            }
            tokens = user.tokens;
          } else {
            return res.status(400).json({message:'Please select a user'});
          }
      
          if (tokens.length === 0) {
            return res.status(400).json({message:'no valid tokens found'});
          }
      
        console.log(tokens);
          const response = await admin.messaging().sendMulticast({
            tokens,
            notification: {
              title:title,
              body:body
            }
          });
          console.log('FCM response:', response);
      
          const invalidTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              invalidTokens.push(tokens[idx]);
            }
          });
      
          if (invalidTokens.length > 0) { // Remove invalid tokens from user's tokens array
            await User.updateMany({
              tokens: {
                $in: invalidTokens
              }
            }, {
              $pull: {
                tokens: {
                  $in: invalidTokens
                }
              }
            });
          }
         
      
          const newNotification = new notification({ title, message,user:selectedUsers });
    
      // Save the document to the database
      newNotification.save()
       
      
          // Send JSON response if notification sent successfully
          res.json({
            message: 'Notification sent successfully'
          });
        } catch (error) {
          console.error(error);
      
          // Send appropriate error message in JSON response
          if (error.code === 'messaging/invalid-argument' && error.message === 'tokens must be a non-empty array') {
            res.status(400).json({
              error: 'No valid tokens found',
              message: 'No valid tokens found'
            });
          } else if (error.message === 'User not found') {
            res.status(404).json({
              error: 'User not found',
              message: 'User not found'
            });
          } else {
            console.log(error)
            res.status(500).json({
             
              message: 'An internal server error occurred',
              error
            });
          }
        }
      },
      completedjob:async(req,res)=>{
        try {
  
          const {appointmentId}=req.body
          const appointment = await Appointment.findById(appointmentId)
          if (!appointment) {
          return res.status(404).json({message:'Appointment not found'});
          }
          const completedAppointment = new Completedappointment({
            date: appointment.date,
            timeslot: appointment.timeslot,
            services: appointment.services,
            userId: appointment.userId,
            totalAmount: appointment.totalAmount,
            totalDuration: appointment.totalDuration,
            paid:appointment.paid
          });
          await completedAppointment.save();
          await Appointment.findByIdAndDelete(appointmentId);
  
          const user=await User.findById(appointment.userId)
          // const tokens=user.tokens
          // const response = await admin.messaging().sendMulticast({
          //   tokens,
          //   notification: {
          //     title:' completed ',
          //     body: 'job completed'
          //   }
          // });
          // console.log('FCM response:', response);
  
  
          
          return res.status(200).json({message:'success', completedAppointment})
        } catch (err) {
          res.status(500).json({message:'error',err})
          console.error(err);
         
        }
  
      }
    
      }

