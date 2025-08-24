// /api/handlePrediction.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const REPLICATE_BASE_URL = 'https://api.replicate.com/v1/predictions';

    if (req.method === 'POST') { // 创建新任务
        try {
            const response = await fetch(REPLICATE_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
            });
            const data = await response.json();
            if (!response.ok) return res.status(response.status).json(data);
            res.status(201).json(data);
        } catch (error) {
            res.status(500).json({ detail: error.message });
        }
    } else if (req.method === 'GET') { // 获取任务状态
        const predictionId = req.query.id;
        if (!predictionId) return res.status(400).json({ detail: "Missing prediction ID" });
        try {
            const response = await fetch(`${REPLICATE_BASE_URL}/${predictionId}`, {
                headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` },
            });
            const data = await response.json();
            if (!response.ok) return res.status(response.status).json(data);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ detail: error.message });
        }
    } else {
        res.status(405).json({ detail: 'Method Not Allowed' });
    }
};
