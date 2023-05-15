// api.js 파일에 추가
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

import axios from 'axios';

export async function getNearbyRestaurants(lat, lng, apiKey) {
  const response = await axios.get(`https://dapi.kakao.com/v2/local/search/keyword.json`, {
    params: {
      query: '음식점',
      radius: 2000,
      x: lng,
      y: lat
    },
    headers: {
      Authorization: `KakaoAK ${apiKey}`
    }
  });
  return response.data.documents.slice(0, 15);
}

export async function getRestaurantImage(placeId, apiKey) {
  const response = await axios.get(`https://dapi.kakao.com/v2/local/search/place.json`, {
    params: {
      id: placeId
    },
    headers: {
      Authorization: `KakaoAK ${apiKey}`
    }
  });
  return response.data.documents[0].photo.url;
}

export async function getRestaurantRecommendation(restaurants) {
  // Implement your GPT API request here
}
