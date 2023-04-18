const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const fetchCategoryData = async (category_group_code, longitude, latitude, radius) => {
  const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
  const KAKAO_DETAIL_API_URL = "https://dapi.kakao.com/v2/local/search/place.json";
  const KAKAO_CATEGORY_API_URL = "https://dapi.kakao.com/v2/local/search/category.json";

  const headers = {
    "Authorization": `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json"
  };

  const categoryUrl = `${KAKAO_CATEGORY_API_URL}?category_group_code=${category_group_code}&x=${longitude}&y=${latitude}&radius=${radius}`;
  const categoryResponse = await fetch(categoryUrl, { headers });
  const categoryData = await categoryResponse.json();

  return categoryData;
};

const createResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body),
});

exports.handler = async function (event, context) {
  console.log("event.body:", event.body);
  
  if (!event.body) {
    return createResponse(400, { error: "Missing event body" });
  }
  
  let latitude, longitude;
  
  try {
    const parsedBody = JSON.parse(event.body);
    latitude = parsedBody.latitude;
    longitude = parsedBody.longitude;
  } catch (error) {
    console.error("Error parsing event body:", error);
    return createResponse(400, { error: "Invalid JSON in event body" });
  }
  
  const category_group_code = "FD6"; // 음식점 카테고리 코드
  const radius = 2000; // 반경 2km 내 검색

  try {
    const categoryData = await fetchCategoryData(category_group_code, longitude, latitude, radius);

    if (!categoryData.documents || categoryData.documents.length === 0) {
      return createResponse(204, null); // 수정된 부분
    }
    

    const response = createResponse(200, categoryData);
    console.log("response:", response);

    return response;
  } catch (error) {
    console.error(error);
    return createResponse(500, { error: error.message });
  }
};
