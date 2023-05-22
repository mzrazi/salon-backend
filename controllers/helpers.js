module.exports={
    calculateCurrentPrice:(service)=> {
        const offer = service.offer;
      
        if (offer) {
          const discountPercentage = offer.discountPercentage;
           const result=service.price - (service.price * discountPercentage / 100);
           console.log(result);
           return result
        } else {
          return service.price;
        }
      }
}