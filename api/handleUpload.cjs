// /api/handleUpload.cjs
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return res.status(500).json({ detail: "Server configuration error: Missing API Token." });
  }
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
    res.status(500).json({ detail: `Proxy Error: ${error.message}` });
  }
};
