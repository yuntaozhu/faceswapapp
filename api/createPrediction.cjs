// /api/createPrediction.cjs
const Replicate = require("replicate");

module.exports = async (req, res) => {
  // The Replicate library automatically reads the REPLICATE_API_TOKEN environment variable.
  const replicate = new Replicate();

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method Not Allowed' });
  }

  try {
    const { swap_image, target_video } = req.body;

    // Use the exact model version from the documentation for best results
    const modelVersion = "arabyai-replicate/roop_face_swap:2293f18a8dd50f6d62a8fdef15820817acd98f28fdb151e45783cc4b5e9aff51";
    
    // This powerful function handles the entire prediction lifecycle!
    console.log("Running prediction...");
    const output = await replicate.run(modelVersion, {
      input: {
        swap_image: swap_image,
        target_video: target_video,
      }
    });
    console.log("Prediction finished successfully.");

    // Send the final result back to the frontend
    res.status(200).json({ output: output });

  } catch (error) {
    console.error("Error running prediction:", error);
    // The error object from the library might contain more details
    const errorDetail = error.response ? await error.response.json() : error.message;
    res.status(500).json({ detail: errorDetail.detail || `Error running prediction` });
  }
};
