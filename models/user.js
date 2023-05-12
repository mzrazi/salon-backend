const mongoose = require('mongoose'); // Erase if already required


const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },  
    Phone: { type:String, required: true },
    email: { type: String, required: true, unique: true },
    address:{type:String,default:null},
    gender:{type:String,default:null},
    pin:{type:String,default:null},
    password: { type: String, required: true },
    imagepath:{type:String,default:null },
    resetToken:{ type:String },
    resetTokenExpiration:{type:String},
    emailverified: { type: Boolean, default: false},
    tokens: [{ type: String }]
})


//Export the model
module.exports = mongoose.model('User', userSchema);