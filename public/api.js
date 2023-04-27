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
  const SERVERLESS_FUNCTION_URL = `https://whateat.netlify.app/.netlify/functions/get-nearby-restaurants`; // 서버리스 함수 URL

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


async function getRestaurantDetails(restaurantName) {
  // ...
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


export async function displayRestaurantInfo(restaurant) {
  const restaurantName = restaurant.title;
  const details = await getRestaurantDetails(restaurantName);

  // 서버리스 함수를 호출하여 음식점 상세 정보를 가져옵니다.
  const response = await fetch(`https://whateat.netlify.app/.netlify/functions/get-nearby-restaurants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ restaurant: { title: restaurantName } }),
  });

  const data = await response.json();
  const detailData = data; // 수정된 부분
  const imageElement = document.querySelector("#restaurant-image-tag");
  imageElement.src = detailData.restaurantImageUrl;

  // 음식점 정보를 출력합니다.
  console.log("음식점 이름:", restaurantName);
  console.log("음식점 주소:", detailData.address_name);
  console.log("음식점 전화번호:", detailData.phone);
  console.log("음식점 카테고리:", detailData.category_name);
  console.log("음식점 위도:", detailData.y);
  console.log("음식점 경도:", detailData.x);

  // 추천 이유와 점수를 계산합니다.
  const today = new Date();
  const hour = today.getHours();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const isAnniversary = restaurantName.includes(`${month}월 ${date}일`);
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

  const TrendScore = Math.random() * 0.5;
  score += TrendScore;
  reason += `${restaurantName}은(는)`;

  if (score >= 2.5) {
    reason += " 추천할 만한 음식점입니다.";
  } else {
    reason += " 추천하기에는 좀 부족한 음식점입니다.";
  }

  // 이전 풍선을 제거하고 새 풍선을 추가합니다.
  const previousBalloons = document.querySelectorAll('.balloon');
  for (let i = 0; i < previousBalloons.length; i++) {
    previousBalloons[i].remove();
  }

  const contentArea = document.querySelector('.content-area');
  const balloon = document.createElement('div');
  balloon.className = 'balloon';
  balloon.innerText = reason;
  contentArea.insertBefore(balloon, contentArea.firstChild);

  console.log("최종 점수:", score);
  console.log("추천 이유:", reason);
}

document.addEventListener("DOMContentLoaded", function () {
  const newButton = document.getElementById("recommendation-button3");

  if (newButton) {
    newButton.addEventListener("click", async function () {
      const selectedRestaurant = document.querySelector(".selected");
      if (selectedRestaurant) {
        const restaurant = {
          title: selectedRestaurant.querySelector(".title").innerText,
        };
        const restaurantInfo = await displayRestaurantInfo(restaurant); // 이제 여기서 await를 사용할 수 있습니다.
      } else {
        alert("음식점을 선택해 주세요.");
      }
    });
  }
});

