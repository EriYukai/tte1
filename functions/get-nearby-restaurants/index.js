// get-nearby-restaurants.js

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { lat, lng } = event.queryStringParameters;

  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${lat}&x=${lng}&radius=20000&query=음식점`;
  const options = {
    headers: {
      'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Handle non-OK responses
      console.error('An error occurred: ' + data.message);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'An error occurred while fetching restaurant data: ' + data.message
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'An error occurred while fetching restaurant data'
      })
    };
  }
};
