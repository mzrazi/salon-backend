const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: {
    type:Date,
    required: true,
  },
  timeslot: {
    type: String,
    required: true,
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  totalDuration: {
    type: Number,
    required: true,
  },

  paid:{
    type:Boolean,
    default:false
  },

  status:{
    type:String,
    required:true,
    enum: ['booked', 'available', 'N/a'],
    default:'booked'
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);