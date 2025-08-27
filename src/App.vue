<template>
  <div id="app-container">
    <div class="container">
      <h1>AI 视频换脸工具</h1>
      <p>上传一张源图片和目标视频，即可体验换脸效果。</p>

      <div class="form-group">
        <label for="swap-image">源图片 (包含人脸)</label>
        <input type="file" id="swap-image" @change="handleSourceImageUpload" accept="image/png, image/jpeg">
      </div>

      <div class="form-group">
        <label for="target-video">目标视频</label>
        <input type="file" id="target-video" @change="handleTargetVideoUpload" accept="video/mp4">
      </div>

      <button @click="startFaceSwap" :disabled="isLoading">
        {{ isLoading ? '处理中...' : '开始换脸' }}
      </button>

      <div id="status">{{ statusMessage }}</div>
      <div class="loader" v-if="isLoading"></div>
      
      <div id="result" v-if="resultUrl">
        <video controls :src="resultUrl"></video>
        <a :href="resultUrl" download="result.mp4">下载视频</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const sourceImageFile = ref(null);
const targetVideoFile = ref(null);
const isLoading = ref(false);
const statusMessage = ref('');
const resultUrl = ref('');

const handleSourceImageUpload = (event) => {
  sourceImageFile.value = event.target.files[0];
};

const handleTargetVideoUpload = (event) => {
  targetVideoFile.value = event.target.files[0];
};

const startFaceSwap = async () => {
  if (!sourceImageFile.value || !targetVideoFile.value) {
    statusMessage.value = '错误：请同时上传源图片和目标视频。';
    return;
  }
  
  isLoading.value = true;
  statusMessage.value = '准备开始...';
  resultUrl.value = '';

  try {
    statusMessage.value = '正在上传源图片...';
    const swapImageUrl = await uploadFile(sourceImageFile.value);
    
    statusMessage.value = '正在上传目标视频...';
    const targetVideoUrl = await uploadFile(targetVideoFile.value);
    
    statusMessage.value = '文件上传完成，正在创建并等待任务完成... (这可能需要1-3分钟)';
    const finalResult = await createPrediction(swapImageUrl, targetVideoUrl);
    
    statusMessage.value = '换脸成功！';
    // Replicate 的输出是一个数组，我们取第一个元素
    resultUrl.value = finalResult.output[0];

  } catch (error) {
    console.error(error);
    statusMessage.value = `发生错误: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 步骤 1 & 2: 获取上传URL，然后直接上传文件
async function uploadFile(file) {
  const getUrlResponse = await fetch('/api/handleUpload.cjs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
    }),
  });
  if (!getUrlResponse.ok) {
      const errorData = await getUrlResponse.json();
      throw new Error(`获取上传URL失败: ${errorData.detail}`);
  }
  const { upload_url, serving_url } = await getUrlResponse.json();
  
  await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  return serving_url;
}

// 步骤 3: 调用新的后端来创建并等待预测结果
async function createPrediction(swapImageUrl, targetVideoUrl) {
  const response = await fetch('/api/createPrediction.cjs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      swap_image: swapImageUrl,
      target_video: targetVideoUrl,
    }),
  });
  
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || '创建预测任务失败');
  }
  return result;
}
</script>

<style>
/* 样式部分保持不变 */
#app-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #f4f7f6;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
}
.container {
    background-color: #ffffff;
    padding: 30px 40px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 600px;
    text-align: center;
}
h1 {
    color: #1a1a1a;
    margin-bottom: 10px;
}
p {
    color: #666;
    margin-bottom: 30px;
}
.form-group {
    margin-bottom: 25px;
    text-align: left;
}
label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
}
input[type="file"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 16px;
}
button {
    width: 100%;
    padding: 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}
#status {
    margin-top: 25px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    min-height: 25px;
}
.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
#result {
    margin-top: 30px;
}
#result video {
    max-width: 100%;
    border-radius: 8px;
    border: 1px solid #ddd;
}
#result a {
    display: inline-block;
    margin-top: 15px;
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
}
</style>
