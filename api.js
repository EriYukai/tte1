const clientId = "V_9Dy9NsieatgDWEMzdy"; // 클라이언트 아이디
const clientSecret = "8vrTehmebq"; // 시크릿
const apiUrl = "https://openapi.naver.com/v1/search/local.json"; // 음식점 API 엔드포인트
const gptApiUrl = "https://api.openai.com/v1/engines/davinci-codex/completions"; // Chat GPT API 엔드포인트

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

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
  navigator.geolocation.getCurrentPosition(showPosition);
}

// 위치 정보 제공에 동의한 경우 처리
function showPosition(position) {
  // 위치 정보를 사용하여 처리하는 로직
  function showPosition(position) {
    // 현재 위치 정보를 이용하여 지도에 마커를 표시하는 코드
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(latitude, longitude),
      zoom: 15
    });
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(latitude, longitude),
      map: map
    });
  
    // 가까운 음식점을 찾아서 출력하는 코드
    getNearbyRestaurants(latitude, longitude);
  }
  
  // 위치 정보 제공에 동의한 것으로 표시
  localStorage.setItem("locationPermissionGranted", "true");
  localStorage.setItem("latitude", position.coords.latitude);
  localStorage.setItem("longitude", position.coords.longitude);

  getNearbyRestaurants(position.coords.latitude, position.coords.longitude);
}

function getNearbyRestaurants(latitude, longitude) {
  const xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `${apiUrl}?query=음식점&display=30&sort=recent&start=1&radius=2000&coordinate=${longitude},${latitude}`
  );
  xhr.setRequestHeader("X-Naver-Client-Id", clientId);
  xhr.setRequestHeader("X-Naver-Client-Secret", clientSecret);
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const response = JSON.parse(this.responseText);
      if (response.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.items.length);
        const selectedRestaurant = response.items[randomIndex];
        displayRestaurantInfo(selectedRestaurant);
      } else {
        console.error("No restaurants found.");
      }
    }
  };
  xhr.send();
}

function displayRestaurantInfo(restaurant) {
  const restaurantName = restaurant.title;
  const defaultImageUrl = "./images/ys.jpg"; // 여기에 기본 이미지 URL을 설정하세요
  const restaurantImageUrl = defaultImageUrl; // restaurant.image가 없으므로 기본 이미지 URL을 사용합니다.

  // 선택된 음식점의 대표 이미지를 불러와서 컨텐츠 페이지에 표시하는 코드
  const imageElement = document.querySelector("#restaurant-image-tag");
  imageElement.src = restaurantImageUrl;

  // API에서 가져온 음식점 정보 출력
  console.log("음식점 이름:", restaurantName);
  console.log("음식점 주소:", restaurant.address);
  console.log("음식점 전화번호:", restaurant.telephone);
  console.log("음식점 카테고리:", restaurant.category);
  console.log("음식점 위도:", restaurant.mapx);
console.log("음식점 경도:", restaurant.mapy);
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
