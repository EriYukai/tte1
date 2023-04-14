const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // GPT API 호출에 필요한 정보
  const KAKAO_API_KEY = "14f09bd760730c467aa000cb14fbb7e0";
  const KAKAO_APP_KEY = "a5f5f6ab161a7b4e31d6bd02bd4547e6";
  const apiKey = process.env.GPT_API_KEY;
  const gptApiUrl = "https://api.openai.com/v1/engines/gpt-3.5-turbo/completions";


  // 클라이언트로부터 받은 데이터
  const data = JSON.parse(event.body);


  data.prompt = "너는 최고의 음식평론가야 너는 다정한 말투로 음식점을 추천해주는 존재야"

// GPT API 호출 코드 작성
const response = await fetch(gptApiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: data.prompt },
    ],
    max_tokens: 500,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0.9,
    presence_penalty: 0.9,
    timeout: 900,
  }),
});

const gptResponse = await response.json();
const result = gptResponse.choices[0].message.content.strip();


// 결과 반환
return {
  statusCode: 200,
  body: JSON.stringify({ result }),
};
};
