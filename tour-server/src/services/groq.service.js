const generateChatCompletion = async (messages, model = process.env.GROQ_API_MODEL) => {
    try {
        const response = await fetch(`${process.env.GROQ_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message || 'Groq API Error');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('Groq Service Error:', error);
        throw error;
    }
};

module.exports = {
    generateChatCompletion
};
