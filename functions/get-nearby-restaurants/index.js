const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.getRestaurantDetails = async (event, context) => {
  const KAKAO_APP_KEY = process.env.KAKAO_APP_KEY;
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
  const KAKAO_DETAIL_API_URL = "https://dapi.kakao.com/v2/local/search/place.json";

  if (!event.body) return { statusCode: 400, body: JSON.stringify({ error: "Empty request body" }) };

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

    if (!searchData.documents || searchData.documents.length === 0) return { statusCode: 404, body: JSON.stringify({ message: "검색 결과가 없습니다." }) };

    const placeId = searchData.documents[0].id;
    const detailUrl = `${KAKAO_DETAIL_API_URL}?place_id=${placeId}`;
    const detailResponse = await fetch(detailUrl, { headers });
    const detailData = await detailResponse.json();

    if (!detailData.documents || detailData.documents.length === 0) return { statusCode: 404, body: JSON.stringify({ message: "상세 정보가 없습니다." }) };

    return { statusCode: 200, body: JSON.stringify(detailData) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
