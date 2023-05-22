const servicemodel = require("../models/servicemodel");

module.exports={
    calculateCurrentPrice:async(service)=> {
       const selectedservice=await servicemodel.findById(service._id).populate('offer').exec()
       const offer =selectedservice.offer
      
        if (offer) {
          const discountPercentage = offer.discountPercentage;
           const result=selectedservice.price - (selectedservice.price * discountPercentage / 100);
           console.log(result);
           return result
        } else {
          return selectedservice;
        }
      }
}