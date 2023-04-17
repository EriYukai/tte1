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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
