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

    statusMessage.value = '文件上传完成，正在创建任务...';
    const prediction = await createPrediction(swapImageUrl, targetVideoUrl);

    statusMessage.value = '任务已创建，正在处理中...';
    await pollPredictionStatus(prediction);
  } catch (error) {
    console.error(error);
    statusMessage.value = `发生错误: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

async function uploadFile(file) {
  const getUrlResponse = await fetch('/api/handleUpload', { // <-- 调用新地址
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

async function createPrediction(swapImageUrl, targetVideoUrl) {
  const response = await fetch('/api/handlePrediction', { // <-- 调用新地址
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: "116bbf0f4e14d808f655e87e5448233cceff10a45f659d71539cafb7163b2e84",
      input: {
        swap_image: swapImageUrl,
        target_video: targetVideoUrl,
      },
    }),
  });
  const prediction = await response.json();
  if (!response.ok) {
    throw new Error(prediction.detail || '创建任务失败');
  }
  return prediction;
}

async function pollPredictionStatus(prediction) {
  let currentPrediction = prediction;
  while (currentPrediction.status !== 'succeeded' && currentPrediction.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const response = await fetch(`/api/handlePrediction?id=${currentPrediction.id}`); // <-- 调用新地址
    currentPrediction = await response.json();
    if (!response.ok) {
      throw new Error(currentPrediction.detail || '查询状态失败');
    }
    statusMessage.value = `任务状态: ${currentPrediction.status}...`;
  }
  if (currentPrediction.status === 'succeeded') {
    statusMessage.value = '换脸成功！';
    resultUrl.value = currentPrediction.output;
  } else {
    throw new Error(`任务失败: ${currentPrediction.error}`);
  }
}
</script>

<style>
/* 样式部分保持不变 */
</style>
