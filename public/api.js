z

  

async function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const container = document.getElementById('map');
  const options = {
    center: new kakao.maps.LatLng(latitude, longitude),
    level: 3
  };
  const map = new kakao.maps.Map(container, options);
  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(latitude, longitude)
  });
  marker.setMap(map);

  localStorage.setItem("locationPermissionGranted", "true");
  localStorage.setItem("latitude", position.coords.latitude);
  localStorage.setItem("longitude", position.coords.longitude);
  
  const nearbyRestaurants = await getNearbyRestaurants(latitude, longitude);

  if (nearbyRestaurants && nearbyRestaurants.documents && nearbyRestaurants.documents.length > 0) {
    const restaurantImages = await getRandomRestaurantImages(nearbyRestaurants.documents);
    // 여기서 restaurantImages를 사용하여 백그라운드 이미지를 설정할 수 있습니다.
  } else {
    console.log("근처 음식점을 찾을 수 없습니다.");
  }
}

// 기존의 코드를 유지하면서 에러 출력 부분을 제거하였습니다.
// 이렇게 하면 근처 음식점을 찾을 수 없는 경우에 대한 메시지만 출력됩니다.






function getScoreForRestaurant(restaurant) {
  if (!restaurant || !restaurant.place_name) {
    console.log("음식점 정보가 없습니다.");
    return 0;
  }
  // 기념일 점수
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const isAnniversary = restaurant.place_name.includes(`${month}월 ${date}일`);
  const anniversaryScore = isAnniversary ? 1 : 0;

  // 시간 점수
  const hour = today.getHours();
  const isLunchTime = hour >= 11 && hour <= 14;
  const isDinnerTime = hour >= 17 && hour <= 21;
  const timeScore = isLunchTime || isDinnerTime ? 1 : 0;

  // 인기 트렌드 포인트
  const TrendScore = Math.random() * 0.5;

  // 최종 점수
  const score = anniversaryScore + timeScore + TrendScore;

  console.log("음식점 이름:", restaurant.place_name);
  console.log("음식점 카테고리:", restaurant.category_name);
  console.log("기념일 점수:", anniversaryScore);
  console.log("시간 점수:", timeScore);
  console.log("인기 트렌드 점수:", TrendScore);
  console.log("최종 점수:", score);
  
  return score;
}

async function getRestaurantImage(placeName) {
  const SERVERLESS_FUNCTION_URL = `${window.location.origin}/.netlify/functions/get-nearby-restaurants`; // 서버리스 함수 URL

  const response = await fetch(SERVERLESS_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ restaurantName: placeName }),
  });

  const data = await response.json();

  const imageUrl = data.documents[0]?.place_photo?.[0]?.thumbnail_url || "./images/ys.jpg";
  return imageUrl;
}






// 위치 정보 제공에 동의하지 않은 경우 처리
function handleLocationPermissionDenied() {
// 위치 정보를 사용할 수 없는 경우 처리
// ...

// 위치 정보 제공에 동의하지 않은 것으로 표시
localStorage.setItem("locationPermissionGranted", "false");
}



function initMap() {
  // 사용자의 위치를 얻기 위한 geolocation API 사용
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}

async function displayRestaurantInfo(restaurant) {
  const restaurantName = restaurant.place_name;

  try {
    // Get restaurant details from the serverless function
    const response = await fetch("/.netlify/functions/get-nearby-restaurants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restaurantName }),
    });

    const detailData = await response.json();

    // Check if the response has the required data
    if (!detailData.documents || detailData.documents.length === 0) {
      console.log("검색 결과가 없습니다.");
      return;
    }

    // Get restaurant details
    const details = detailData.documents[0];
    const imageUrl = details.place_url;

    // 이미지 표시
    const imageElement = document.querySelector("#restaurant-image-tag");
    imageElement.src = imageUrl;

    console.log("음식점 이름:", restaurantName);
    console.log("음식점 주소:", restaurant.address_name);
    console.log("음식점 전화번호:", restaurant.phone);
    console.log("음식점 카테고리:", restaurant.category_name);
    console.log("음식점 위도:", restaurant.y);
    console.log("음식점 경도:", restaurant.x);

    // 추천 이유 계산 및 출력
    calculateAndDisplayRecommendationReason(restaurant);

  } catch (error) {
    console.error(error);
  }
}
