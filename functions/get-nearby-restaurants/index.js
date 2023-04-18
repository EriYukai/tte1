const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async function (event, context) {
  const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
  const KAKAO_DETAIL_API_URL = "https://dapi.kakao.com/v2/local/search/place.json";

  const data = JSON.parse(event.body);
  const { restaurantName } = data;

  const headers = {
    "Authorization": `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    const query = encodeURIComponent(restaurantName);
    const category_group_code = "FD6"; // 음식점 카테고리 코드
    const radius = 5000; // 반경 5km 내 검색
    const searchUrl = `${KAKAO_SEARCH_API_URL}?query=${query}&category_group_code=${category_group_code}&radius=${radius}`;
    const searchResponse = await fetch(searchUrl, { headers });
    const searchData = await searchResponse.json();

    if (!searchData.documents || searchData.documents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "검색 결과가 없습니다." }),
      };
    }

    const placeId = searchData.documents[0].id;
    const detailUrl = `${KAKAO_DETAIL_API_URL}?place_id=${placeId}`;
    const detailResponse = await fetch(detailUrl, { headers });
    const detailData = await detailResponse.json();

    if (!detailData.documents || detailData.documents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "상세 정보가 없습니다." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(detailData),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};