function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function init() {
  if (localStorage.getItem("locationPermissionGranted") === "true") {
    getScoreForRestaurant(localStorage.getItem("latitude"), localStorage.getItem("longitude"));
  }
  // ... 나머지 코드 ...
}



function showPosition(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  // 지도를 초기화하고 사용자의 위치에 마커를 표시
  var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(lat, lng), // 지도의 중심좌표
      level: 3 // 지도의 확대 레벨
    };

  // 지도를 생성
  var map = new kakao.maps.Map(mapContainer, mapOption);

  // 마커를 생성하고 지도에 표시
  var markerPosition  = new kakao.maps.LatLng(lat, lng);
  var marker = new kakao.maps.Marker({
    position: markerPosition
  });
  marker.setMap(map);

  // 지도 중심좌표를 사용자 위치로 이동
  map.setCenter(new kakao.maps.LatLng(lat, lng));
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}




function createRaindrop() {
  const recommendationButton = document.getElementById("recommendation-button");
  const buttonRect = recommendationButton.getBoundingClientRect();

  const raindrop = document.createElement("div");
  raindrop.classList.add("raindrop");
  raindrop.style.backgroundColor = getRandomColor();

  const xPosition = buttonRect.left + Math.random() * recommendationButton.offsetWidth;
  const yPosition = buttonRect.top + Math.random() * recommendationButton.offsetHeight;
  raindrop.style.left = xPosition + "px";
  raindrop.style.top = yPosition + "px";

  raindrop.style.animationDuration = (Math.random() * 1 + 1) + "s";
  raindrop.style.animationName = "raindropRise";

  if (!raindrop) {
      return null;
  }

  return raindrop;
}


document.addEventListener("DOMContentLoaded", function () {
  const body = document.querySelector("body");
  const recommendationButton = document.getElementById("recommendation-button");

  const raindrops = [];
  const MAX_RAINDROPS = 50;

  for (let i = 0; i < MAX_RAINDROPS; i++) {
    const raindrop = document.createElement("div");
    raindrop.classList.add("raindrop");
    raindrops.push(raindrop);
  }

  function updateRaindrops() {
    for (let i = 0; i < raindrops.length; i++) {
      const raindrop = raindrops[i];
      if (!raindrop.parentNode) {
        recommendationButton.appendChild(raindrop);
        raindrop.style.left = `${Math.random() * 100}%`;
        raindrop.style.animationDelay = `${Math.random() * 3}s`;
      }
    }
    requestAnimationFrame(updateRaindrops);
  }

  function removeRaindrop(raindrop) {
    raindrop.remove();
  }
  const shimmerBorder = document.createElement("div");
  shimmerBorder.classList.add("shimmer-border");
  recommendationButton.appendChild(shimmerBorder);
  shimmerBorder.style.width = "calc(100% + 20px)";
  shimmerBorder.style.height = "calc(100% + 20px)";
  
  updateRaindrops();
  });

  document.addEventListener('DOMContentLoaded', async function () {
    if (localStorage.getItem("locationPermissionGranted") === "true") {
      const latitude = localStorage.getItem("latitude");
      const longitude = localStorage.getItem("longitude");
      const nearbyRestaurants = await getScoreForRestaurant(latitude, longitude);
      if (nearbyRestaurants && nearbyRestaurants.length > 0) {
        // 여기에서 적절한 음식점을 선택할 수 있습니다. 예를 들어 첫 번째 음식점을 사용하려면 다음과 같이 합니다.
        const selectedRestaurant = nearbyRestaurants[0];
        getScoreForRestaurant(selectedRestaurant);
      }
    }

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

  let x, y;

  const left = buttonRect.left;
  const right = buttonRect.right;
  const top = buttonRect.top;
  const bottom = buttonRect.bottom;

  const width = right - left;
  const height = bottom - top;

  const perimeter = 2 * (width + height);
  const distance = progress * perimeter;

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

// 버튼클릭 이벤트
const button = document.getElementById("recommendation-button");


button.addEventListener("click", async function() {
  if (localStorage.getItem("locationPermissionGranted") === "true") {
    const latitude = localStorage.getItem("latitude");
    const longitude = localStorage.getItem("longitude");
    const restaurants = await getScoreForRestaurant(latitude, longitude);
    displayRestaurants(restaurants, latitude, longitude);
    getGptResponse(restaurants); // 결과를 말풍선에 표시하도록 함수 호출
  } else {
    navigator.geolocation.getCurrentPosition(async function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      showPosition(position);
      const restaurants = await getScoreForRestaurant(latitude, longitude);
      displayRestaurants(restaurants, latitude, longitude);
      getGptResponse(restaurants); // 결과를 말풍선에 표시하도록 함수 호출
    });
  }

    const audio = new Audio("ok.mp3");
    audio.volume = 0.2; // 볼륨을 10%로 설정
    audio.play();

// 오버레이 페이드 인 효과 시작
let overlay = document.getElementById("overlay");
overlay.classList.add("fade-out");

setTimeout(function() {
  overlay.classList.add("fade-in");
  overlay.classList.remove("fade-out");

  setTimeout(function() {
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
newButton2.addEventListener("click", function() {
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
hideFunction("addFadingDot");



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


function showPosition(position, map) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  const latlng = new kakao.maps.LatLng(lat, lng);
  const marker = new kakao.maps.Marker({ position: latlng });

  marker.setMap(map);
}


document.addEventListener("DOMContentLoaded", () => {
  getLocation();
});


function displayRestaurantInfo(restaurant) {
  const restaurantName = restaurant.title;

  // 이미지를 삽입할 div를 선택합니다.
  const contentArea = document.querySelector(".content-area");
  contentArea.innerHTML = ""; // 이전 이미지를 제거합니다.

  // 선택된 음식점의 대표 이미지를 불러와서 컨텐츠 페이지에 표시하는 코드
  imageElement.src = restaurantImageUrl;
  imageElement.alt = restaurantName;

  // 이미지를 content-area div에 추가합니다.
  contentArea.appendChild(imageElement);


  const restaurantAddress = restaurant.address;
  const restaurantPhone = restaurant.telephone;


  // 음식점 이미지 출력
  const imageElement = document.querySelector("#restaurant-image-tag");
  imageElement.src = restaurantImageUrl;

  // 음식점 이름 출력
  const nameElement = document.querySelector("#restaurant-name");
  nameElement.textContent = restaurantName;

  // 음식점 주소 출력
  const addressElement = document.querySelector("#restaurant-address");
  addressElement.textContent = restaurantAddress;

  // 음식점 전화번호 출력
  const phoneElement = document.querySelector("#restaurant-phone");
  phoneElement.textContent = restaurantPhone;

}


});

function hideClass(className) {
const elements = document.getElementsByClassName(className);
for (let i = 0; i < elements.length; i++) {
  elements[i].style.display = "none";
}
}

function hideFunction(functionName) {
window[functionName] = function() {};
}



