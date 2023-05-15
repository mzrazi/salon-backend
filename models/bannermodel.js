const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var bannerSchema = new mongoose.Schema({
    imagepath:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      }],
});

//Export the model
module.exports = mongoose.model('Banner', bannerSchema);