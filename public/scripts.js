async function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const restaurants = await getRestaurants(lat, lon); // 수정된 부분
  displayRestaurants(restaurants, latitude, longitude);

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


const displayRestaurantInfo = async (placeId) => {
  if (!placeId) {
    console.error("올바르지 않은 placeId입니다.");
    return;
  }

  const response = await fetch(`/api/restaurant-details?place_id=${placeId}`);
  const data = await response.json();
  const restaurant = data.documents[0]; // 수정된 부분

  const imageElement = document.querySelector("#restaurant-image-tag");
  imageElement.src = restaurant.restaurantImageUrl;

  // 음식점 정보를 출력합니다.
  console.log("음식점 이름:", restaurant.place_name);
  console.log("음식점 주소:", restaurant.address_name);
  console.log("음식점 전화번호:", restaurant.phone);
  console.log("음식점 카테고리:", restaurant.category_name);
  console.log("음식점 위도:", restaurant.y);
  console.log("음식점 경도:", restaurant.x);

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

// scripts.js
document.addEventListener("DOMContentLoaded", function () {
  const newButton = document.getElementById("recommendation-button2");
  if (newButton) {
    newButton.addEventListener("click", async function () {
      const restaurants = await getRestaurants();
      displayRestaurants(restaurants, latitude, longitude);
    });
  }

  const restaurantList = document.getElementById("restaurant-list");
  if (restaurantList) {
    restaurantList.addEventListener("click", function (event) {
      if (event.target.tagName === "BUTTON") {
        const placeId = event.target.dataset.placeId;
        displayRestaurantInfo(restaurants[0].id); // 변경된 부분
      }
    });
  }
});







function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}



function createRaindrop() {
  const recommendationButton = document.getElementById("recommendation-button");
  const buttonRect = recommendationButton.getBoundingClientRect();

  const raindrop = document.createElement("div");
  raindrop.classList.add("raindrop");
  raindrop.style.backgroundColor = getRandomColor();

  const xPosition = buttonRect.left + Math.random() * recommendationButton.offsetWidth;
  const yPosition = buttonRect.top + Math.random() * recommendationButton.offsetHeight;
  raindrop.style.left = `${xPosition}px`;
  raindrop.style.top = `${yPosition}px`;

  raindrop.style.animationDuration = `${Math.random() * 1 + 1}s`;
  raindrop.style.animationName = "raindropRise";

  recommendationButton.parentNode.appendChild(raindrop);

  return raindrop;
}



document.addEventListener("DOMContentLoaded", function () {
  const recommendationButton = document.getElementById("recommendation-button");
  const MAX_RAINDROPS = 50;
  const raindrops = [];

  for (let i = 0; i < MAX_RAINDROPS; i++) {
    const raindrop = createRaindrop();
    recommendationButton.appendChild(raindrop);
  }

  function updateRaindrops() {
    raindrops.forEach((raindrop) => {
      if (!raindrop.parentNode) {
        recommendationButton.appendChild(raindrop);
        raindrop.style.left = `${Math.random() * 100}%`;
        raindrop.style.animationDelay = `${Math.random() * 3}s`;
      }
    });
    requestAnimationFrame(updateRaindrops);
  }
  updateRaindrops();

  // 모든 createRaindrop 클래스를 가진 요소에 대해 물방울 효과 적용
  const raindropButtons = document.querySelectorAll(".createRaindrop");
  raindropButtons.forEach((button) => {
    const raindrops = [];
    const MAX_RAINDROPS = 50;

    for (let i = 0; i < MAX_RAINDROPS; i++) {
      const raindrop = document.createElement("div");
      raindrop.classList.add("raindrop");
      raindrops.push(raindrop);
    }

    function updateRaindrops() {
      raindrops.forEach((raindrop) => {
        if (!raindrop.parentNode) {
          button.appendChild(raindrop);
          raindrop.style.left = `${Math.random() * 100}%`;
          raindrop.style.animationDelay = `${Math.random() * 3}s`;
        }
      });
      requestAnimationFrame(updateRaindrops);
    }

    const shimmerBorder = document.createElement("div");
    shimmerBorder.classList.add("shimmer-border");
    button.appendChild(shimmerBorder);
    shimmerBorder.style.width = "calc(100% + 20px)";
    shimmerBorder.style.height = "calc(100% + 20px)";

    updateRaindrops();
  });
});


  const menuButton = document.getElementById('menu-button');
  const menuList = document.getElementById('menu-list');

  let menuOpen = false;

  menuButton.addEventListener('click', function () {
    if (!menuOpen) {
      menuList.style.display = 'block';
      menuOpen = true;
    } else {
      menuList.style.display = 'none';
      menuOpen = false;
    }
  });

function createShimmerDot(angle, radius) {
  const shimmerDot = document.createElement("div");
  shimmerDot.classList.add("shimmer-dot");
  setShimmerDotSize(shimmerDot);

  const recommendationButton = document.getElementById("recommendation-button");
  const buttonRect = recommendationButton.getBoundingClientRect();
  const x = Math.cos(angle) * radius + buttonRect.left + radius - shimmerDot.offsetWidth / 2;
  const y = Math.sin(angle) * radius + buttonRect.top + radius - shimmerDot.offsetHeight / 2;
  shimmerDot.style.left = x + "px";
  shimmerDot.style.top = y + "px";
  return shimmerDot;
}

function updateShimmerDot(shimmerDot, progress) {
  const recommendationButton = document.getElementById("recommendation-button");
  const buttonRect = recommendationButton.getBoundingClientRect();
  const left = buttonRect.left;
  const right = buttonRect.right;
  const top = buttonRect.top;
  const bottom = buttonRect.bottom;
  const width = right - left;
  const height = bottom - top;
  const perimeter = 2 * (width + height);
  const distance = progress * perimeter;
  let x, y;
  if (distance <= width) {
    x = left + distance;
    y = top;
  } else if (distance <= width + height) {
    x = right;
    y = top + (distance - width);
  } else if (distance <= 2 * width + height) {
    x = right - (distance - width - height);
    y = bottom;
  } else {
    x = left;
    y = top + (2 * width + 2 * height - distance);
  }
  shimmerDot.style.left = x + "px";
  shimmerDot.style.top = y + "px";
  addFadingDot(x, y);
}

document.addEventListener("DOMContentLoaded", function () {
  const body = document.querySelector("body");
  const recommendationButton = document.getElementById("recommendation-button");
  const newButton = document.getElementById("recommendation-button2");
  if (newButton) {
    newButton.addEventListener("click", async function () {
      const restaurants = await getRestaurants();
      displayRestaurants(restaurants, latitude, longitude);
    });
  }
  let shimmerDot;
  let updateInterval;

  function startShimmerDotAnimation() {
      if (shimmerDot) {
          shimmerDot.remove();
      }

      const buttonRect = recommendationButton.getBoundingClientRect();
      shimmerDot = createShimmerDot(0, buttonRect);
      body.appendChild(shimmerDot);

      let progress = 0;
      const duration = 1500; // 2초 동안 한바퀴 도는 시간
      const interval = 5; // milliseconds

      if (updateInterval) {
          clearInterval(updateInterval);
      }

      updateInterval = setInterval(() => {
          const buttonRect = recommendationButton.getBoundingClientRect();
          const width = buttonRect.width;
          const height = buttonRect.height;
          const perimeter = 2 * (width + height);

          // 한 번의 간격동안 이동할 거리를 계산합니다.
          const distancePerInterval = (interval / duration) * perimeter;

          progress += distancePerInterval / perimeter;
          if (progress >= 1) {
              progress = 0;
          }
          updateShimmerDot(shimmerDot, progress);
      }, interval);
  }

  startShimmerDotAnimation();

  function stopShimmerDotAnimation() {
    clearInterval(updateInterval);
}


  window.addEventListener('resize', () => {
      stopShimmerDotAnimation();
      setTimeout(() => {
          startShimmerDotAnimation();
          setShimmerDotSize(shimmerDot);
      }, 100);
  });

  recommendationButton.addEventListener('transitionend', () => {
      const buttonRect = recommendationButton.getBoundingClientRect();
      updateShimmerDot(shimmerDot, progress, buttonRect);
  });
});

function setShimmerDotSize(shimmerDot) {
  const recommendationButton = document.getElementById("recommendation-button");
  const buttonRect = recommendationButton.getBoundingClientRect();

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const minSize = 6; // 최소 크기
  const maxSize = 25; // 최대 크기

  // 창의 크기를 기준으로 적절한 크기를 계산합니다.
  const size = Math.max(minSize, Math.min(maxSize, Math.min(windowWidth, windowHeight) / 36));

  // 크기와 관련된 스타일 속성을 설정합니다.
  shimmerDot.style.width = size + "px";
  shimmerDot.style.height = size + "px";
  shimmerDot.style.borderRadius = "0%";
  shimmerDot.style.boxShadow = `
    0 0 ${size / 2}px rgba(255, 255, 255, 0.8),
    0 0 ${size}px rgba(255, 255, 255, 0.6),
    0 0 ${size * 1.5}px rgba(255, 255, 255, 0.4),
    0 0 ${size * 2}px rgba(255, 255, 255, 0.2)
  `;
}

function createFadingDot(x, y) {
  const fadingDot = document.createElement("div");
  fadingDot.classList.add("shimmer-dot", "fading-dot");
  
  fadingDot.style.left = x + "px";
  fadingDot.style.top = y + "px";

  setShimmerDotSize(fadingDot); // 새로운 점의 크기와 스타일 설정

  return fadingDot;
}

function addFadingDot(x, y) {
  const body = document.querySelector("body");
  const fadingDot = createFadingDot(x, y);
  body.appendChild(fadingDot);

  setTimeout(() => {
      fadingDot.remove();
  }, 35);
}

async function displayRestaurants(restaurants, latitude, longitude) {
  const restaurantList = document.getElementById("restaurant-list");
  restaurantList.innerHTML = "";

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <h3>${restaurant.title}</h3>
      <p>${restaurant.address}</p>
      <p>${restaurant.category}</p>
      <button data-place-id="${restaurant.id}">자세히 보기</button>
    `;
    restaurantList.appendChild(listItem);
  }

  // 이 부분을 추가하세요.
  const detailButtons = document.querySelectorAll("[data-place-id]");
  for (const button of detailButtons) {
    button.addEventListener("click", async (e) => {
      const placeId = e.target.dataset.placeId;
      await displayRestaurantInfo(placeId);
    });
  }

  
  // 첫 번째 음식점 정보를 선택합니다.
  const selectedRestaurant = restaurants[0];

  // 이미지를 삽입할 div를 선택합니다.
  const contentArea = document.querySelector(".content-area");
  contentArea.innerHTML = ""; // 이전 이미지를 제거합니다.

  // 음식점 이미지 출력
  const imageElement = document.createElement("img");
  imageElement.id = "restaurant-image-tag";
  imageElement.src = selectedRestaurant.image_url;
  imageElement.alt = selectedRestaurant.title;

  // 이미지를 content-area div에 추가합니다.
  contentArea.appendChild(imageElement);

  // 음식점 이름 출력
  const nameElement = document.querySelector("#restaurant-name");
  nameElement.textContent = selectedRestaurant.title;

  // 음식점 주소 출력
  const addressElement = document.querySelector("#restaurant-address");
  addressElement.textContent = selectedRestaurant.address;

  // 음식점 전화번호 출력
  const phoneElement = document.querySelector("#restaurant-phone");
  phoneElement.textContent = selectedRestaurant.telephone;
}



// 버튼클릭 이벤트
const button = document.getElementById("recommendation-button");
button.addEventListener("click", async function () {
  if (localStorage.getItem("locationPermissionGranted") === "true") {
    const latitude = localStorage.getItem("latitude");
    const longitude = localStorage.getItem("longitude");
    const restaurants = await getScoreForRestaurant(latitude, longitude);
    displayRestaurants(restaurants, latitude, longitude);
    await displayRestaurantInfo(restaurants[0].id, latitude, longitude);
  } else {
    navigator.geolocation.getCurrentPosition(async function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      showPosition(position);
      const restaurants = await getScoreForRestaurant(latitude, longitude);
      displayRestaurants(restaurants, latitude, longitude);
      await displayRestaurantInfo(restaurants[0].id, latitude, longitude);
    });
  }


  const audio = new Audio("ok.mp3");
  audio.volume = 0.2; // 볼륨을 20%로 설정
  audio.play();

  // 오버레이 페이드 인 효과 시작
  let overlay = document.getElementById("overlay");
  overlay.classList.add("fade-out");

  setTimeout(function () {
    overlay.classList.add("fade-in");
    overlay.classList.remove("fade-out");

    setTimeout(function () {
      overlay.classList.remove("fade-in");
    }, 1000); // 2000ms (2초) 후에 페이드 인 효과가 끝납니다.
  }, 1000); // 2000ms (2초) 후에 페이드 인 효과를 시작합니다.

  // 현재 버튼 요소 가져오기
  const currentButton = document.getElementById("recommendation-button");

  // 버튼 숨기기
  currentButton.style.display = "none";

  // 새 버튼 생성
  const newButton = document.createElement("button");
  newButton.setAttribute("id", "recommendation-button3");
  newButton.classList.add("recommendation-button", "new-button", "createRaindrop"); // new-button 클래스 추가
  newButton.innerHTML = "정보확인";

  // 새 버튼2 생성
  const newButton2 = document.createElement("button");
  newButton2.setAttribute("id", "recommendation-button2");
  newButton2.classList.add("recommendation-button", "new-button2"); // new-button2 클래스 추가
  newButton2.innerHTML = "&#x21bb;";

  // 버튼2 클릭 이벤트
  newButton2.addEventListener("click", function () {
    location.reload();
  });

  // 버튼 컨테이너 생성
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  // 생성한 버튼 추가
  buttonContainer.appendChild(newButton);
  buttonContainer.appendChild(newButton2);

  const body = document.querySelector("body");
  body.appendChild(buttonContainer);

  // 숨겨진 클래스와 함수 호출
  hideClass("raindrop");
  hideClass("shimmer-border");
  hideClass("shimmer-dot");
  hideClass("fading-dot");
  hideFunction("createRaindrop");
  hideFunction("createShimmerDot");
  hideFunction("updateShimmerDot");
  hideFunction("setShimmerDotSize");
  hideFunction("createFadingDot");
  hideFunction("updateFadingDot");
  
  // 새 버튼 클릭 이벤트
  newButton.addEventListener("click", async function () {
  const selectedRestaurant = document.querySelector(".selected");
  let restaurants = [];
  if (selectedRestaurant) {
  const restaurant = {
  title: selectedRestaurant.querySelector(".title").innerText,
  };
  await displayRestaurantInfo(restaurants[0].id, latitude, longitude);
  } else {
  alert("음식점을 선택해 주세요.");
  }
  });
  });

// 위치 정보 확인 및 주변 음식점 이미지 표시 로직
function getLocation(map) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => showPosition(position, map),
      (error) => console.error(error)
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}



function hideClass(className) {
const elements = document.getElementsByClassName(className);
for (let i = 0; i < elements.length; i++) {
  elements[i].style.display = "none";
}
}

function hideFunction(functionName) {
window[functionName] = function() {};
}