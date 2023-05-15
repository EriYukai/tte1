// api.js

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }, reject);
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

export async function getNearbyRestaurants(lat, lng, apiKey) {
  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=음식점&radius=2000&x=${lng}&y=${lat}`, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`
    }
  });
  const data = await response.json();
  return data.documents.slice(0, 15);
}

export async function getRestaurantImage(placeId, apiKey) {
  const response = await fetch(`https://dapi.kakao.com/v2/local/search/place.json?id=${placeId}`, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`
    }
  });
  const data = await response.json();
  return data.documents[0].photo.url;
}

export async function getRestaurantRecommendation(restaurants) {
  // Implement your GPT API request here
}
