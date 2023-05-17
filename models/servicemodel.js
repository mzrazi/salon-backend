const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: String,
    required: true,
  },
  currentPrice:
   {
     type: Number,
     default:null

   },
  duration: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  offer:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    default:null
   },
imagepath:{
    type:String,
    required:true,
    unique:true,
    }
});

module.exports = mongoose.model('Service', serviceSchema);
