// /api/handleUpload.cjs
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    console.log("handleUpload function started."); // 日志1：函数启动

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
        // 如果 Token 不存在，立即记录致命错误并退出
        console.error("FATAL ERROR: REPLICATE_API_TOKEN environment variable not found!");
        return res.status(500).json({ detail: "Server configuration error: Missing API Token." });
    }

    console.log("API Token found, proceeding..."); // 日志2：Token已找到

    if (req.method !== 'POST') {
        return res.status(405).json({ detail: 'Method Not Allowed' });
    }
    try {
        const response = await fetch('https://api.replicate.com/v1/files', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error("Error during fetch to Replicate:", error);
        res.status(500).json({ detail: `Proxy Error: ${error.message}` });
    }
};
