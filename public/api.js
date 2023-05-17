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
  const response = await fetch('/.netlify/functions/get-nearby-restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ lat, lng, apiKey })
  });
  const data = await response.json();
  return data;
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
