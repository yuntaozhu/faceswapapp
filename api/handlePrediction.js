// /api/handlePrediction.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const REPLICATE_BASE_URL = 'https://api.replicate.com/v1/predictions';
    try {
        if (req.method === 'POST') {
            const response = await fetch(REPLICATE_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
            });
            const data = await response.json();
            res.status(response.status).json(data);
        } else if (req.method === 'GET') {
            const predictionId = req.query.id;
            if (!predictionId) return res.status(400).json({ detail: "Missing prediction ID" });
            const response = await fetch(`${REPLICATE_BASE_URL}/${predictionId}`, {
                headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` },
            });
            const data = await response.json();
            res.status(response.status).json(data);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).json({ detail: 'Method Not Allowed' });
        }
    } catch (error) {
        res.status(500).json({ detail: `Proxy Error: ${error.message}` });
    }
};
