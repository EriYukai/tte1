const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // GPT API 호출에 필요한 정보
  const KAKAO_API_KEY = "14f09bd760730c467aa000cb14fbb7e0";
  const KAKAO_APP_KEY = "a5f5f6ab161a7b4e31d6bd02bd4547e6";
  const apiKey = "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"; // 여기에 실제 GPT API 키를 입력해주세요.
  const gptApiUrl = "https://openapi.naver.com/v1/search/webkr";

  // 클라이언트로부터 받은 데이터
  const data = JSON.parse(event.body);

  // GPT API 호출 코드 작성
  // ...

  // 결과 반환
  return {
    statusCode: 200,
    body: JSON.stringify({ result: '결과를 여기에 작성하세요' }),
  };
};
