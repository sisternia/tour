const groqService = require('../services/groq.service');

const generateResponse = async (req, res) => {
    try {
        const { prompt, systemPrompt, model } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const messages = [
            { role: 'system', content: systemPrompt || 'You are a helpful travel assistant. You help administrators create attractive tour packages. Answer in Vietnamese.' },
            { role: 'user', content: prompt }
        ];

        const response = await groqService.generateChatCompletion(messages, model);

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate AI response'
        });
    }
};

module.exports = {
    generateResponse
};
