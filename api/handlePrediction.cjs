// /api/createPrediction.cjs
const Replicate = require("replicate");

module.exports = async (req, res) => {
  // 检查 API Token
  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ detail: "Server configuration error: Missing API Token." });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method Not Allowed' });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const { swap_image, target_video } = req.body;

    // 使用官方截图中的最新、最精确的模型版本
    const modelVersion = "arabyai-replicate/roop_face_swap:2293f18a8dd50f6d62a8fdef15820817acd98f28fdb151e45783cc4b5e9aff51";
    
    // replicate.run() 会自动处理轮询，等待任务完成！
    const output = await replicate.run(modelVersion, {
      input: {
        swap_image: swap_image,
        target_video: target_video,
      }
    });

    // 直接返回成功的结果
    res.status(200).json({ status: 'succeeded', output: output });

  } catch (error) {
    console.error("Error running prediction:", error);
    res.status(500).json({ detail: `Error running prediction: ${error.message}` });
  }
};
