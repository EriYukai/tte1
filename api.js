const KAKAO_API_KEY = "14f09bd760730c467aa000cb14fbb7e0";
const KAKAO_APP_KEY = "a5f5f6ab161a7b4e31d6bd02bd4547e6";

const apiKey = "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"; // 여기에 실제 GPT API 키를 입력해주세요.
const gptApiUrl = "https://openapi.naver.com/v1/search/webkr";


function searchRestaurants(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`;

  const headers = {
    Authorization: `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json;charset=UTF-8",
    "Accept": "application/json",
    "KA": "sdk/1.38.0 os/javascript lang/en-US device/Win32 origin/https%3A%2F%2Feriyukai.github.io"
  };
  

  fetch(url, { headers })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const restaurant = data.documents[0]; // 가장 첫 번째 검색 결과 이용
      displayRestaurantInfo(restaurant); // displayRestaurantInfo 함수 호출
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}


  
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

function showPosition(position) {
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

  // 가까운 음식점을 찾아서 출력하는 코드.
  getNearbyRestaurants(latitude, longitude);

  localStorage.setItem("locationPermissionGranted", "true");
  localStorage.setItem("latitude", position.coords.latitude);
  localStorage.setItem("longitude", position.coords.longitude);
}


async function getNearbyRestaurants(latitude, longitude) {
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/category.json";
  const category_group_code = "FD6"; // 음식점 카테고리 코드
  const radius = 5000; // 반경 2km 내 검색
  const url = `${KAKAO_SEARCH_API_URL}?category_group_code=${category_group_code}&x=${longitude}&y=${latitude}&radius=${radius}`;

  const headers = {
    Authorization: `KakaoAK ${KAKAO_API_KEY}`,
    "Content-Type": "application/json;charset=UTF-8",
    "Accept": "application/json",
    "KA": "sdk/1.38.0 os/javascript lang/en-US device/Win32 origin/https%3A%2F%2Feriyukai.github.io"
  };
  
  fetch(url, { headers })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    if (!data.documents || data.documents.length === 0) {
      console.error("Error: No nearby restaurants found.");
      return;
    }

    // 점수가 가장 높은 음식점 선택
    const restaurants = data.documents;
    const scores = restaurants.map(getScoreForRestaurant);
    const maxScoreIndex = scores.reduce((maxIndex, score, index, scores) => {
      return score > scores[maxIndex] ? index : maxIndex;
    }, 0);
    const recommendedRestaurant = restaurants[maxScoreIndex];

    // 음식점 정보 출력
    displayRestaurantInfo(recommendedRestaurant);

    getGptResponse(recommendedRestaurant);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

}

function getScoreForRestaurant(restaurant) {
  if (!restaurant) {
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

  // 인기 트렌드 점수
  const naverTrendScore = Math.random() * 0.5;

  // 최종 점수
  const score = anniversaryScore + timeScore + naverTrendScore;

  console.log("음식점 이름:", restaurant.place_name);
  console.log("음식점 카테고리:", restaurant.category_name);
  console.log("기념일 점수:", anniversaryScore);
  console.log("시간 점수:", timeScore);
  console.log("인기 트렌드 점수:", naverTrendScore);
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

// Chat GPT API 호출
function getGptResponse(restaurant) {
  const prompt = `제가 추천하는 ${restaurant.title}은(는) ${restaurant.category} 전문점입니다. 여기에서는 ${restaurant.menuInfo} 등이 인기 메뉴입니다. 또한, ${restaurant.address}에 위치해 있으며, 전화번호는 ${restaurant.telephone}입니다. 이 음식점을 추천해드리는 이유는 ${restaurant.title}의 맛이 좋기 때문입니다. 이 음식점을 방문하시면 꼭 드셔보세요!`;
  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", gptApiUrl);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", `Bearer ${apiKey}`);
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const response = JSON.parse(this.responseText);
      const responseText = response.choices[0].text;
      console.log(responseText);

      // 결과를 말풍선 영역에 표시
      const gptResponseContainer = document.getElementById('gpt-response-container');
      const gptResponseText = gptResponseContainer.querySelector('.gpt-response-text');
      gptResponseText.innerText = responseText;
      gptResponseContainer.style.display = 'block'; // 말풍선 영역을 표시
    }
  };
  const requestBody = {
    prompt,
    temperature: 0.7,
    max_tokens: 60,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
  xhr.send(JSON.stringify(requestBody));
}

kakao.maps.load(() => {
  initMap();
});



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

function displayRestaurantInfo(restaurant) {
  const restaurantName = restaurant.place_name;
  const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/category.json";
  const category_group_code = "FD6"; // 음식점 카테고리 코드
  const radius = 5000; // 반경 2km 내 검색
  
  // 음식점 카테고리가 "음식점"일 때는 대표 이미지 가져오기
  // 음식점 카테고리가 "카페"일 때는 기본 이미지 경로 할당
  const restaurantImageUrl = restaurant.category_group_code === "FD6" 
    ? restaurant.thumbnail_url || "./images/ys.jpg"
    : "./images/cafe.jpg";

  const imageElement = document.querySelector("#restaurant-image-tag");
  imageElement.src = restaurantImageUrl;

  console.log("음식점 이름:", restaurantName);
  console.log("음식점 주소:", restaurant.address_name);
  console.log("음식점 전화번호:", restaurant.phone);
  console.log("음식점 카테고리:", restaurant.category_name);
  console.log("음식점 위도:", restaurant.y);
  console.log("음식점 경도:", restaurant.x);

  const today = new Date();
  const hour = today.getHours();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const isAnniversary = restaurant.place_name.includes(`${month}월 ${date}일`);
  const isLunchTime = hour >= 11 && hour <= 14;
  const isDinnerTime = hour >= 17 && hour <= 21;

  let reason = "";
  let score = 0;

  if (isAnniversary) {
    score++;
    reason = "오늘은 기념일이어서 ";
  }
  if (isLunchTime || isDinnerTime) {
    score++;
    reason += "지금은 점심이나 저녁시간이어서 ";
  }
  const naverTrendScore = Math.random() * 0.5;
  score += naverTrendScore;

  reason += `${restaurantName}은(는)`;

  if (score >= 2.5) {
    reason += " 추천할 만한 음식점입니다.";
  } else {
    reason += " 추천하기에는 좀 부족한 음식점입니다.";
  }

  const contentArea = document.querySelector('.content-area');
  const balloon = document.createElement('div');
  balloon.className = 'balloon';
  balloon.innerText = reason;
  contentArea.insertBefore(balloon, contentArea.firstChild);

  console.log("최종 점수:", score);
  console.log("추천 이유:", reason);
}
