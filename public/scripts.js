document.querySelector('#recommendation-button').addEventListener('click', async function() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(async function(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    const response = await fetch(`/get-nearby-restaurants?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    
    if (response.ok) {
      // Show restaurant images on the background
      const grid = document.querySelector('#background-grid');
      grid.innerHTML = '';
      for (let i = 0; i < data.restaurants.length; i++) {
        const restaurant = data.restaurants[i];
        const img = document.createElement('img');
        img.src = restaurant.image;
        grid.appendChild(img);
      }
      
      // Show recommendation
      const balloon = document.querySelector('#recommendation-balloon');
      balloon.textContent = `I recommend ${data.recommendation.name} because ${data.recommendation.reason}`;
      
      // Show restaurant location on the map
      // You should implement this part using Kakao Map JavaScript API
      
      // Show more info button
      const moreInfoButton = document.querySelector('#more-info-button');
      moreInfoButton.href = `https://map.kakao.com/link/to/${data.recommendation.name},${lat},${lng}`;
      moreInfoButton.style.display = 'block';
    } else {
      alert('An error occurred: ' + data.error);
    }
  }, function() {
    alert('Unable to retrieve your location');
  });
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


