<template>
  <div class="product-model-upload layout">
    <div class="headEdit">
      <div class="contentEdit">3D模型上傳區</div>
    </div>
    <!-- 上傳 -->
    <div class="upload-side">
      <div class="upload-group">
        <label class="upload-label">GLB / GLTF 模型</label>
        <input
          type="file"
          accept=".glb,.gltf"
          class="upload-input"
          
        />
      </div>

      <button class="save-button" >保存視角</button>
    </div>

    <!-- Canvas 預覽 -->
    <div class="preview-side">
      <div class="preview-wrapper">
        <canvas
          ref="canvasRef"
          class="preview-canvas"
        ></canvas>
        <!-- <div v-if="!modelReady" class="preview-placeholder">請上傳模型</div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// interface CameraPosition {
//   x: number;
//   y: number;
//   z: number;
// }

// interface ModelData {
//   glb: string | null;
//   camera: {
//     position: CameraPosition;
//     target: CameraPosition;
//   };
// }

// const model = defineModel<ModelData>({ required: true });
// const modelReady = ref(false);
// const canvasKey = ref(0);
// const canvasRef = ref<HTMLCanvasElement | null>(null);
// let scene: THREE.Scene | null = null;
// let camera: THREE.PerspectiveCamera;
// let controls: OrbitControls;
// let renderer: THREE.WebGLRenderer;

// function handleErrorWithMessage(message: string) {
//   return (error: unknown) => {
//     console.error(`${message}：`, error);
//     alert(message);
//   };
// }

// onMounted(() => {
//   initThree();
// });

// function initThree() {
//   nextTick(() => {
//     const canvas = canvasRef.value;
//     if (!canvas) return;

//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;

//     scene = new THREE.Scene();
//     scene.background = new THREE.Color("#f2f2f2");

//     renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
//     renderer.setSize(width, height, false);
//     renderer.outputColorSpace = THREE.SRGBColorSpace;

//     camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
//     camera.position.set(0, 2, 5);
//     scene.add(camera);

//     // 添加環境光
//     const ambientLight = new THREE.AmbientLight(0xffffff, 2);
//     scene.add(ambientLight);

//     // 添加主方向光源
//     const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
//     directionalLight.position.set(5, 10, 7.5);
//     scene.add(directionalLight);

//     // 添加輔助填充光
//     const fillLight = new THREE.DirectionalLight(0xffffff, 1);
//     fillLight.position.set(-5, 0, -5);
//     scene.add(fillLight);

//     controls = new OrbitControls(camera, renderer.domElement);
//     controls.target.set(0, 0, 0);
//     controls.update();

//     if (model.value.camera) {
//       camera.position.set(
//         model.value.camera.position.x,
//         model.value.camera.position.y,
//         model.value.camera.position.z
//       );
//       controls.target.set(
//         model.value.camera.target.x,
//         model.value.camera.target.y,
//         model.value.camera.target.z
//       );
//       controls.update();
//     }

//     animate();
//     window.addEventListener("resize", handleResize);
//   });
// }

// function animate() {
//   requestAnimationFrame(animate);
//   if (scene && renderer && camera) {
//     renderer.render(scene, camera);
//   }
// }

// function handleResize() {
//   const canvas = canvasRef.value;
//   if (!canvas) return;
//   const width = canvas.clientWidth;
//   const height = canvas.clientHeight;
//   renderer.setSize(width, height, false);
//   camera.aspect = width / height;
//   camera.updateProjectionMatrix();
// }

// function handleGLBFile(e: Event) {
//   const file = (e.target as HTMLInputElement).files?.[0];
//   if (!file) return;

//   model.value.glb = file;
//   const url = URL.createObjectURL(file);
//   modelReady.value = true;
//   canvasKey.value++;
//   nextTick(() => {
//     initThree();
//     const loader = new GLTFLoader();
//     loader.load(
//       url,
//       (gltf) => {
//         scene!.clear();
//         scene!.add(camera);

//         // 修復材質設置
//         gltf.scene.traverse((object) => {
//           if (object instanceof THREE.Mesh) {
//             if (object.material) {
//               object.material.needsUpdate = true;
//               // 如果是標準材質，確保設置正確的反射率和粗糙度
//               if (object.material.type === "MeshStandardMaterial") {
//                 object.material.roughness = 0.7;
//                 object.material.metalness = 0.3;
//               }
//               // 確保材質能夠接收光照
//               object.castShadow = true;
//               object.receiveShadow = true;
//             }
//           }
//         });

//         // 重新添加光源
//         const ambientLight = new THREE.AmbientLight(0xffffff, 2);
//         scene!.add(ambientLight);

//         const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
//         directionalLight.position.set(5, 10, 7.5);
//         scene!.add(directionalLight);

//         const fillLight = new THREE.DirectionalLight(0xffffff, 1);
//         fillLight.position.set(-5, 0, -5);
//         scene!.add(fillLight);

//         scene!.add(gltf.scene);

//         const box = new THREE.Box3().setFromObject(gltf.scene);
//         const center = box.getCenter(new THREE.Vector3());
//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);

//         const distance = maxDim * 1.8;
//         const direction = new THREE.Vector3(1, 1, 1).normalize();
//         camera.position.copy(
//           center.clone().add(direction.multiplyScalar(distance))
//         );
//         controls.target.copy(center);
//         controls.update();
//       },
//       undefined,
//       handleErrorWithMessage("GLB 模型載入失敗")
//     );
//   });
// }

// function saveCamera() {
//   model.value.camera = {
//     position: {
//       x: camera.position.x,
//       y: camera.position.y,
//       z: camera.position.z,
//     },
//     target: {
//       x: controls.target.x,
//       y: controls.target.y,
//       z: controls.target.z,
//     },
//   };
//   alert("視角已儲存");
// }
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  width: 100%;

  .headEdit {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;

    .contentEdit {
      font-size: 24px;
      color: $primary-b-d;
      font-weight: 600;
    }
  }
}

.preview-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/1;
  background-color: #f2f2f2;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 18px;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to bottom right, #fafafa, #f2f2f2);
}

.upload-side {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
  margin-bottom: 16px;
}

.upload-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.save-button {
  height: 40px;
  width: 80px;
  background-color: $primary-b-ll;
  color: $primary-b-d;
  border: 1px solid $primary-b-d;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $primary-b-l;
  }
}
</style>
