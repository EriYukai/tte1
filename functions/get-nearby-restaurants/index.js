// get-nearby-restaurants/index.js 파일에 추가

const axios = require('axios');

exports.handler = async function(event, context) {
  const { lat, lng } = event.queryStringParameters;
  
  const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
    params: {
      query: '음식점',
      radius: 2000,
      page: 1,
      size: 15,
      sort: 'random',
      x: lng,
      y: lat,
    },
    headers: {
      Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response.data.documents),
  };
};

