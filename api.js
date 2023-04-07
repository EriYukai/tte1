const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${latitude}&x=${longitude}&radius=2000&query=음식점&page=1&size=30&sort=distance`;
const headers = {
  Authorization: `KakaoAK 14f09bd760730c467aa000cb14fbb7e0`
};
const KAKAO_API_KEY = "14f09bd760730c467aa000cb14fbb7e0";
const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

fetch(url, { headers })
  .then(response => response.json())
  .then(data => {
    // 결과 처리
  })
  .catch(error => {
    console.error("Error:", error);
  });

const gptApiUrl = "https://api.openai.com/v1/engines/davinci-codex/completions"; // Chat GPT API 엔드포인트

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// OpenAI API key 입력
const apiKey = "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";


// 페이지가 로드될 때, 이전에 위치 정보 제공에 동의한 적이 있다면 위치 정보 제공을 요구하지 않음
if (localStorage.getItem("locationPermissionGranted") === "true") {
  // 위치 정보 제공에 동의한 경우의 처리
  showPosition({
    coords: {
      latitude: localStorage.getItem("latitude"),
      longitude: localStorage.getItem("longitude"),
    },
  });
} else {
  navigator.geolocation.getCurrentPosition(function(position) {
    showPosition(position);
  });  
}

// 위치 정보 제공에 동의한 경우 처리
function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // 기존 코드를 삭제하고 새로운 코드를 추가하세요.
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
}

  
  // 위치 정보 제공에 동의한 것으로 표시
  localStorage.setItem("locationPermissionGranted", "true");
  localStorage.setItem("latitude", position.coords.latitude);
  localStorage.setItem("longitude", position.coords.longitude);


function getNearbyRestaurants(latitude, longitude) {
    const KAKAO_SEARCH_API_URL = "https://dapi.kakao.com/v2/local/search/category.json";
    const KAKAO_APP_KEY = "a5f5f6ab161a7b4e31d6bd02bd4547e6"; // REST API 키를 사용합니다.
    const category_group_code = "FD6"; // 음식점 카테고리 코드
    const radius = 5000; // 반경 2km 내 검색

    const url = `${KAKAO_SEARCH_API_URL}?category_group_code=${category_group_code}&x=${longitude}&y=${latitude}&radius=${radius}`;

    fetch(url, {
        headers: {
            Authorization: `KakaoAK ${KAKAO_APP_KEY}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // 검색 결과를 사용하여 다른 작업을 수행할 수 있습니다.
            console.log(data);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}



function displayRestaurantInfo(restaurant) {
  const restaurantName = restaurant.place_name;
  const restaurantImageUrl = restaurant.thumbnail_url || "./images/ys.jpg";

  const imageElement = document.querySelector("#restaurant-image-tag");
  imageElement.src = restaurantImageUrl;

  console.log("음식점 이름:", restaurantName);
  console.log("음식점 주소:", restaurant.address_name);
  console.log("음식점 전화번호:", restaurant.phone);
  console.log("음식점 카테고리:", restaurant.category_name);
  console.log("음식점 위도:", restaurant.y);
  console.log("음식점 경도:", restaurant.x);
}


// 위치 정보 제공에 동의하지 않은 경우 처리
function handleLocationPermissionDenied() {
// 위치 정보를 사용할 수 없는 경우 처리
// ...

// 위치 정보 제공에 동의하지 않은 것으로 표시
localStorage.setItem("locationPermissionGranted", "false");
}

// Chat GPT API 호출 예시
function getGptResponse(restaurant) {
  const prompt = `제가 추천하는 ${restaurant.title}은(는) ${restaurant.category} 전문점입니다. 여기에서는 ${restaurant.menuInfo} 등이 인기 메뉴입니다. 또한, ${restaurant.address}에 위치해 있으며, 전화번호는 ${restaurant.telephone}입니다. 이 음식점을 추천해드리는 이유는 ${restaurant.title}의 맛이 좋기 때문입니다. 이 음식점을 방문하시면 꼭 드셔보세요!`;
  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", gptApiUrl);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", `Bearer ${apiKey}`);
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const response = JSON.parse(this.responseText);
      console.log(response.choices[0].text);
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
