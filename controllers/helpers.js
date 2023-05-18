module.exports={
    calculateCurrentPrice:(service)=> {
        const offer = service.offer;
      
        if (offer) {
          const discountPercentage = offer.percentage;
          return service.price - (service.price * discountPercentage / 100);
        } else {
          return service.price;
        }
      }
}