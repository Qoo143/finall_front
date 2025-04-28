<template>
  <div class="model-viewer-container">
    <div v-if="loading" class="loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>模型載入中...</span>
    </div>
    <div ref="modelViewerContainer" class="viewer-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: '3D 模型'
  },
  autoRotate: {
    type: Boolean,
    default: true
  },
  cameraControls: {
    type: Boolean,
    default: true
  },
  ar: {
    type: Boolean,
    default: false
  },
  exposure: {
    type: Number,
    default: 1
  },
  posterColor: {
    type: String,
    default: '#f7f7f7' // 使用你的 $bg-1 變數顏色
  }
});

const modelViewerContainer = ref<HTMLElement | null>(null);
const modelViewer = ref<any>(null);
const loading = ref(true);

// 動態引入 model-viewer
const initModelViewer = async () => {
  try {
    // 動態引入 model-viewer 元素
    await import('@google/model-viewer');
    
    if (modelViewerContainer.value) {
      // 創建 model-viewer 元素
      const viewer = document.createElement('model-viewer');
      
      // 設置基本屬性
      viewer.src = props.src;
      viewer.alt = props.alt;
      viewer.style.width = '100%';
      viewer.style.height = '100%';
      
      // 設置交互屬性
      if (props.autoRotate) viewer.setAttribute('auto-rotate', '');
      if (props.cameraControls) viewer.setAttribute('camera-controls', '');
      if (props.ar) viewer.setAttribute('ar', '');
      
      // 設置渲染屬性
      viewer.setAttribute('exposure', props.exposure.toString());
      viewer.setAttribute('poster-color', props.posterColor);
      
      // 清除容器並添加新的 viewer
      modelViewerContainer.value.innerHTML = '';
      modelViewerContainer.value.appendChild(viewer);
      
      // 保存引用以便後續操作
      modelViewer.value = viewer;
      
      // 綁定事件
      viewer.addEventListener('load', () => {
        loading.value = false;
      });
      
      viewer.addEventListener('error', (error: any) => {
        console.error('Model viewer error:', error);
        ElMessage.error('3D 模型載入失敗');
        loading.value = false;
      });
    }
  } catch (error) {
    console.error('Failed to load model-viewer:', error);
    ElMessage.error('3D 模型載入元件失敗');
    loading.value = false;
  }
};

// 監聽 src 變化，重新載入模型
watch(() => props.src, () => {
  if (modelViewer.value) {
    loading.value = true;
    modelViewer.value.src = props.src;
  }
});

onMounted(() => {
  initModelViewer();
});

onBeforeUnmount(() => {
  // 清理資源
  if (modelViewer.value) {
    const viewer = modelViewer.value;
    viewer.removeEventListener('load', () => {});
    viewer.removeEventListener('error', () => {});
  }
});
</script>

<style scoped lang="scss">
.model-viewer-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: $bg-1;
  border-radius: 12px;
  overflow: hidden;
}

.viewer-wrapper {
  width: 100%;
  height: 100%;
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(247, 247, 247, 0.8);
  z-index: 10;
  
  .loading-icon {
    font-size: 32px;
    color: $primary-b;
    animation: spin 1.5s infinite linear;
  }
  
  span {
    margin-top: 12px;
    color: $primary-b-d;
    font-size: 16px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>