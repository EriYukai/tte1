// const fetch = require("node-fetch"); // 이 줄을 주석 처리
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args)); // 이 줄을 추가
const KAKAO_CATEGORY_API_URL = "https://dapi.kakao.com/v2/local/search/category.json";

exports.handler = async function (event, context) {
  const KAKAO_API_KEY = process.env.KAKAO_API_KEY;

  const { latitude, longitude } = JSON.parse(event.body);
  const category_group_code = "FD6"; // 음식점 카테고리 코드
  const radius = 2000; // 반경 2km 내 검색

  const headers = {
    "Authorization": `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    const categoryUrl = `${KAKAO_CATEGORY_API_URL}?category_group_code=${category_group_code}&x=${longitude}&y=${latitude}&radius=${radius}`;
    const categoryResponse = await fetch(categoryUrl, { headers });
    const categoryData = await categoryResponse.json();

    if (!categoryData.documents || categoryData.documents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No nearby restaurants found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(categoryData),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
