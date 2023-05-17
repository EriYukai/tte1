// get-nearby-restaurants/index.js

exports.handler = async function(event, context) {
  // Get parameters from queryStringParameters instead of body
  const { lat, lng, apiKey } = event.queryStringParameters;

  // Dynamically import node-fetch
  const fetch = (await import('node-fetch')).default;

  // Fetch nearby restaurants
  const restaurantsResponse = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=음식점&radius=2000&x=${lng}&y=${lat}`, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`
    }
  });
  const restaurantsData = await restaurantsResponse.json();
  const restaurants = restaurantsData.documents.slice(0, 15);

  // Fetch restaurant recommendations
  const YOUR_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const recommendationResponse = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: `Here are some restaurants: ${restaurants.map(r => r.place_name).join(', ')}. Which one should I choose?`,
      max_tokens: 60
    })
  });
  const recommendationData = await recommendationResponse.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      restaurants,
      recommendation: {
        name: 'Recommended restaurant',
        reason: recommendationData.choices[0].text.trim()
      }
    })
  };
}
