<template>
  <!-- 小寶箱 -->
  <div class="auth-box">
    <!-- 左邊的switch -->
    <div class="side-panel left-panel">
      <!-- 包裹箱 -->
      <div class="panel-content">
        <p class="welcome-text">welcome to Lumani</p>
        <p class="sub-text">do not have account ?</p>
        <el-button 
          @click="$router.replace({ name: 'register' })" 
          class="switch-button"
          :plain="true"
          color="#fb923c"
          size="large"
        >
          Register
        </el-button>
        <img src="@/assets/images/LominaLogo_B.png" alt="Logo" class="logo" />
        <p class="copyright">© 2025 Lumina, Inc. 版權所有</p>
      </div>
    </div>
    
    <!-- 右邊的login -->
    <div class="main-panel">
      <!-- 包裹箱 -->
      <div class="panel-content">
        <p class="title">Login</p>
        
        <el-form 
          :model="loginForm" 
          :rules="loginRules"
          ref="loginFormRef"
          class="login-form"
        >
          <!-- 帳號輸入框 -->
          <el-form-item prop="account">
            <el-input 
              v-model="loginForm.account" 
              placeholder="請輸入帳號"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <!-- 密碼輸入框 -->
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password"
              type="password" 
              placeholder="請輸入密碼"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
        </el-form>

        <el-button 
          text 
          class="forget-button"
        >
          ForgetPassword?
        </el-button>
        
        <ul class="social-login">
          <li class="social-item">
            <img src="@/assets/images/google.svg" alt="Google" />
          </li>
          <li class="social-item">
            <img src="@/assets/images/facebook.svg" alt="Facebook" />
          </li>
          <li class="social-item">
            <img src="@/assets/images/apple.svg" alt="Apple" />
          </li>
        </ul>
        
        <el-button 
          @click="handleLogin" 
          class="login-button"
          color="#fdba74"
          :loading="loading"
        >
          login
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  account: '',
  password: '',
});

// 表單驗證規則
const loginRules = reactive<FormRules>({
  account: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
  ],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      
      // 模擬登入處理
      setTimeout(() => {
        console.log('登入請求：', loginForm);
        ElMessage.success('登入成功！');
        router.push({ name: 'index' });
        loading.value = false;
      }, 1000);
    } else {
      ElMessage.error('請填寫完整登入資訊');
      return false;
    }
  });
};
</script>

<style lang="scss" scoped>
.auth-box {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.side-panel {
  height: 100%;
  padding-top: 96px;
  background-color: #f8f9fa;
  
  &.left-panel {
    min-width: 350px;
    
    @media (min-width: 1536px) {
      min-width: 400px;
    }
  }
}

.main-panel {
  width: 100%;
  height: 100%;
  padding-top: 88px;
  background-color: #e2e8f0;
}

.panel-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-text {
  font-size: 20px;
  padding-bottom: 64px;
}

.sub-text {
  padding-bottom: 12px;
}

:deep(.switch-button) {
  font-size: 24px;
  padding: 12px 20px;
  margin-bottom: 155px;
  border-radius: 12px;
  border-width: 2px;
}

.logo {
  margin-bottom: 8px;
}

.copyright {
  font-size: 12px;
  margin-top: 8px;
  color: #6b7280;
}

.title {
  font-size: 36px;
  padding-bottom: 64px;
  font-family: monospace;
}

.login-form {
  width: 60%;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input__wrapper) {
  background-color: #f1f5f9;
  box-shadow: none;
  border-radius: 12px;
  padding: 0 12px;
}

:deep(.el-input__inner) {
  height: 40px;
}

.forget-button {
  margin-bottom: 80px;
}

.social-login {
  display: flex;
  gap: 24px;
  align-items: center;
  list-style: none;
  padding: 0;
}

.social-item {
  width: 40px;
  height: 40px;
  padding: 4px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #9ca3af;
  }
  
  &:active {
    background-color: #bbbbbb;
  }
  
  img {
    width: 100%;
    height: 100%;
  }
}

:deep(.login-button) {
  position: relative;
  width: 208px;
  height: 40px;
  margin-top: 20px;
  border-radius: 12px;
  font-size: 16px;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, #f87171, #eab308);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    border-radius: 12px;
    z-index: 0;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:active::before {
    background: linear-gradient(to right, #fecaca, #fef08a);
    opacity: 1;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
}
</style>