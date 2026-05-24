require('dotenv').config();

const testGemini = async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: {
          parts: [{ text: "Hello World" }]
        }
      })
    });
    const data = await response.json();
    console.log("Vector length:", data.embedding?.values?.length);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
};

testGemini();
