const fetch = require('node-fetch');

exports.getRestaurantDetails = async function (event, context) {
  const KAKAO_APP_KEY = process.env.KAKAO_APP_KEY;
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
  const KAKAO_DETAIL_API_URL = "https://dapi.kakao.com/v2/local/search/place.json";

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "Empty request body" }) };
  }

  let data, restaurantName;
  try {
    data = JSON.parse(event.body);
    restaurantName = data.restaurantName;
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const headers = { "Authorization": `KakaoAK ${KAKAO_APP_KEY}`, "Content-Type": "application/json" };

  try {
    const query = encodeURIComponent(restaurantName);
    const category_group_code = "FD6";
    const radius = 5000;
    const searchUrl = `${KAKAO_SEARCH_API_URL}?query=${query}&category_group_code=${category_group_code}&radius=${radius}`;
    const searchResponse = await fetch(searchUrl, { headers });
    const searchData = await searchResponse.json();

    if (!searchData.documents || searchData.documents.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "검색 결과가 없습니다." }) };
    }

    const placeId = searchData.documents[0].id;
    const detailUrl = `${KAKAO_DETAIL_API_URL}?place_id=${placeId}`;
    const detailResponse = await fetch(detailUrl, { headers });
    const detailData = await detailResponse.json();

    if (!detailData.documents || detailData.documents.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "상세 정보가 없습니다." }) };
    }

    return { statusCode: 200, body: JSON.stringify(detailData) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// root/functions/generate-text.js
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async function (event, context) {
  const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/category.json";
  const category_group_code = "FD6"; // 음식점 카테고리 코드
  const radius = 5000; // 반경 2km 내 검색

  const data = JSON.parse(event.body);
  const { latitude, longitude } = data;
  const url = `${KAKAO_SEARCH_API_URL}?category_group_code=${category_group_code}&x=${longitude}&y=${latitude}&radius=${radius}`;

  const headers = {
    Authorization: `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json;charset=UTF-8",
    "Accept": "application/json",
    "KA": "sdk/1.38.0 os/javascript lang/en-US device/Win32 origin/https%3A%2F%2Feriyukai.github.io",
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error); // 에러를 콘솔에 출력하도록 추가
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
