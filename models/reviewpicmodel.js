const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var reviewpicSchema = new mongoose.Schema({
    imagePath:{type:String,
        required:true,
        unique:true
      },
});

//Export the model
module.exports = mongoose.model('reviewpic', reviewpicSchema);