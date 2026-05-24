require('dotenv').config();

const listModels = async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      const embedModels = data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));
      console.log("Embed Models:", embedModels.map(m => m.name));
    } else {
      console.log("Response:", data);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
};

listModels();
