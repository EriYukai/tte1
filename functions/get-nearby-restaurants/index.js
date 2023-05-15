const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const { getNearbyRestaurants, getRestaurantImage, getRestaurantRecommendation } = require('../api');

exports.handler = async function(event, context) {
  const { lat, lng } = event.queryStringParameters;

  try {
    const restaurants = await getNearbyRestaurants(lat, lng, process.env.KAKAO_API_KEY);
    for(let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      restaurant.image = await getRestaurantImage(restaurant.id, process.env.KAKAO_API_KEY);
    }

    const recommendation = await getRestaurantRecommendation(restaurants);

    return {
      statusCode: 200,
      body: JSON.stringify({
        restaurants,
        recommendation
      })
    };
  } catch(error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'An error occurred while fetching restaurant data'
      })
    };
  }
};
