const mongoose = require('mongoose'); // Erase if already required
const { calculateCurrentPrice } = require('../controllers/helpers');

// Declare the Schema of the Mongo model
var offerSchema = new mongoose.Schema({
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

    discountPercentage:{
        type:String
    }
});


//Export the model
module.exports = mongoose.model('Offer', offerSchema);