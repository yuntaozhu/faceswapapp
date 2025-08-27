// /api/diagnose.js

module.exports = (req, res) => {
    // 直接、唯一地检查环境变量
    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (apiToken && apiToken.length > 10) {
        // 如果 Token 存在且看起来有效，返回成功信息
        res.status(200).json({
            status: "SUCCESS",
            message: "环境变量 REPLICATE_API_TOKEN 已被成功找到。",
            tokenPreview: `${apiToken.substring(0, 4)}...${apiToken.substring(apiToken.length - 4)}` // 返回一个安全的预览
        });
    } else if (apiToken) {
        // 如果存在但格式不对
        res.status(500).json({
            status: "ERROR",
            message: "环境变量 REPLICATE_API_TOKEN 存在，但其值似乎无效或过短。",
            token: apiToken
        });
    } else {
        // 如果完全找不到
        res.status(500).json({
            status: "ERROR",
            message: "致命错误：环境变量 REPLICATE_API_TOKEN 未找到。这是导致服务器崩溃的根本原因。"
        });
    }
};
