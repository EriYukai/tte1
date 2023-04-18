const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// 페이지가 로드될 때, 이전에 위치 정보 제공에 동의한 적이 있다면 위치 정보 제공을 요구하지 않음
if (localStorage.getItem("locationPermissionGranted") === "true") {
  // 위치 정보 제공에 동의한 경우의 처리
  showPosition({
    coords: {
      latitude: parseFloat(localStorage.getItem("latitude")),
      longitude: parseFloat(localStorage.getItem("longitude")),
    },
  });
} else {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      showPosition(position);
    },
    (error) => {
      console.log("Geolocation error:", error);
    },
    geolocationOptions
  );
}

async function getNearbyRestaurants(latitude, longitude) {
  try {
    const response = await fetch(
      `${window.location.origin}/.netlify/functions/get-nearby-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude: latitude, longitude: longitude }),
      }
    );

    if (response.status === 204) {
      console.error("Error: No nearby restaurants found.");
      return;
    }
    
    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.error("Error: No nearby restaurants found.");
      return;
    }

    return data;

  } catch (error) {
    console.error("Error:", error);
  }
}


async function showPosition(position) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();

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
    // 음식점 정보를 가져와 각 음식점에 대한 점수를 계산합니다.
    nearbyRestaurants.documents.forEach(restaurant => {
      getScoreForRestaurant(restaurant);
    });
  } else {
    // 음식점이 없을 때 적절한 메시지를 출력합니다.
    console.log("근처 음식점을 찾을 수 없습니다.");
    // 여기에 추가적인 처리를 할 수 있습니다.
  }
}






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
  const KAKAO_PLACE_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
  const query = encodeURIComponent(placeName);

  const headers = {
    Authorization: `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json",
    KA: "sdk/1.38.0 os/javascript lang/en-US device/Win32 origin/https%3A%2F%2Feriyukai.github.io",
  };

  const url = `${KAKAO_PLACE_API_URL}?query=${query}&page=1&size=1&sort=accuracy`;

  const response = await fetch(url, { headers });
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
