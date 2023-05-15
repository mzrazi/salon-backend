const User=require('../models/user')
const  mongoose=require('mongoose')
var jwt = require('jsonwebtoken');
const bcrypt=require("bcrypt")
const nodemailer = require('nodemailer');
const gallery = require('../models/gallerymodel');



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
             
          
              const specialists = await Specialist.find({});
              
          
              const contact = await Contact.find({});
              res.status(200).json({
                status: 200,
                message: "success",
                offers,
                categories,
                specialists,
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
      }

}