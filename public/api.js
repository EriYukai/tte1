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
