const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

async function searchRestaurant(query, headers, category_group_code, radius) {
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
  const searchUrl = `${KAKAO_SEARCH_API_URL}?query=${query}&category_group_code=${category_group_code}&radius=${radius}`;
  const searchResponse = await fetch(searchUrl, { headers });
  return await searchResponse.json();
}

async function getRestaurantDetails(placeId, headers) {
  const KAKAO_DETAIL_API_URL = "https://dapi.kakao.com/v2/local/search/place.json";
  const detailUrl = `${KAKAO_DETAIL_API_URL}?place_id=${placeId}`;
  const detailResponse = await fetch(detailUrl, { headers });
  return await detailResponse.json();
}

exports.handler = async function (event, context) {
  const KAKAO_API_KEY = process.env.KAKAO_API_KEY;

  if (!event.body || event.body.trim() === "") {
    console.error("Empty request body");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Empty request body" }),
    };
  }

  let data, restaurantName;
  try {
    data = JSON.parse(event.body);
    restaurantName = data.restaurant.title;
  } catch (error) {
    console.error("Error parsing JSON body:", event.body);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const headers = {
    "Authorization": `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    const query = encodeURIComponent(restaurantName);
    const category_group_code = "FD6"; // 음식점 카테고리 코드
    const radius = 5000; // 반경 5km 내 검색
    const searchData = await searchRestaurant(query, headers, category_group_code, radius);

    if (!searchData.documents || searchData.documents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "검색 결과가 없습니다." }),
      };
    }

    const placeId = searchData.documents[0].id;
    const detailData = await getRestaurantDetails(placeId, headers);

    if (!detailData.documents || detailData.documents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "상세 정보가 없습니다." }),
      };
    }

    const restaurantImageUrl = detailData.documents[0].photo && detailData.documents[0].photo[0].url ? detailData.documents[0].photo[0].url : "";

    return {
      statusCode: 200,
      body: JSON.stringify({ ...detailData, restaurantImageUrl }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
