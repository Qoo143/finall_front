<template>
  <!-- 小寶箱 -->
  <div class="auth-box">
    <!-- 左邊的register表單 -->
    <div class="main-panel">
      <!-- 包裹箱 -->
      <div class="panel-content">
        <p class="title">Register</p>

        <el-form
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
          class="register-form"
        >
          <!-- 使用者輸入框 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="輸入使用者名稱"
              :prefix-icon="User"
            >
              <template #suffix>
                <el-icon v-if="usernameStatus === 'success'" class="success-icon">
                  <Check />
                </el-icon>
                <el-icon v-else-if="usernameStatus === 'error'" class="error-icon">
                  <Close />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 信箱輸入框 -->
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="輸入帳號信箱"
              :prefix-icon="Message"
            >
              <template #suffix>
                <el-icon v-if="emailStatus === 'success'" class="success-icon">
                  <Check />
                </el-icon>
                <el-icon v-else-if="emailStatus === 'error'" class="error-icon">
                  <Close />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 密碼輸入框 -->
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="請輸入密碼"
              :prefix-icon="Lock"
              show-password
            >
              <template #suffix>
                <el-icon v-if="passwordStatus === 'success'" class="success-icon">
                  <Check />
                </el-icon>
                <el-icon v-else-if="passwordStatus === 'error'" class="error-icon">
                  <Close />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 二次密碼輸入框 -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="請再次輸入密碼"
              :prefix-icon="Lock"
              show-password
            >
              <template #suffix>
                <el-icon v-if="confirmPasswordStatus === 'success'" class="success-icon">
                  <Check />
                </el-icon>
                <el-icon v-else-if="confirmPasswordStatus === 'error'" class="error-icon">
                  <Close />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>

        <el-button 
          @click="handleRegister" 
          class="register-button"
          color="#fdba74"
          :loading="loading"
        >
          register
        </el-button>
      </div>
    </div>
    
    <!-- 右邊的switch -->
    <div class="side-panel right-panel">
      <!-- 包裹箱 -->
      <div class="panel-content">
        <p class="welcome-text">welcome to Lumani</p>
        <p class="sub-text">want to login?</p>
        <el-button 
          @click="$router.replace({ name: 'login' })" 
          class="switch-button"
          :plain="true"
          color="#fb923c"
          size="large"
        >
          Login
        </el-button>
        <img src="@/assets/images/LominaLogo_B.png" alt="Logo" class="logo" />
        <p class="copyright">© 2025 Lumina, Inc. 版權所有</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus';
import { User, Lock, Message, Check, Close } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const registerFormRef = ref<FormInstance>();
const loading = ref(false);

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// 正則表達式
const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{8,20}$/;
const allowedSymbols = '@#$%^&*-';

// 驗證狀態
const usernameStatus = ref<'' | 'success' | 'error'>('');
const emailStatus = ref<'' | 'success' | 'error'>('');
const passwordStatus = ref<'' | 'success' | 'error'>('');
const confirmPasswordStatus = ref<'' | 'success' | 'error'>('');

// 自定義驗證規則
const validateUsername = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback();
  } else if (usernameRegex.test(value)) {
    usernameStatus.value = 'success';
    callback();
  } else {
    usernameStatus.value = 'error';
    if (value.length < 2) {
      callback(new Error('需至少2個字符'));
    } else if (value.length > 20) {
      callback(new Error('不得超過20個字符'));
    } else {
      callback(new Error('只能包含中文、英文或數字'));
    }
  }
};

const validateEmail = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback();
  } else if (emailRegex.test(value)) {
    emailStatus.value = 'success';
    callback();
  } else {
    emailStatus.value = 'error';
    callback(new Error('請輸入有效的電子郵件地址'));
  }
};

const validatePassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback();
  } else {
    const symbolsValid = /^[a-zA-Z0-9@#$%^&*-]*$/.test(value);
    const hasTwoTypes = passwordRegex.test(value);
    const lengthValid = value.length >= 8 && value.length <= 20;

    if (symbolsValid && hasTwoTypes && lengthValid) {
      passwordStatus.value = 'success';
      callback();
    } else {
      passwordStatus.value = 'error';
      let errorMsg = '';
      
      if (!symbolsValid) {
        errorMsg = `只能使用大小寫英文、數字和符號（${allowedSymbols}）`;
      } else if (!hasTwoTypes) {
        errorMsg = '必須由字母、數字、特殊字符中的至少兩種組成';
      } else if (!lengthValid) {
        errorMsg = value.length < 8 ? '需至少8個字符' : '不得超過20個字符';
      }
      
      callback(new Error(errorMsg));
    }
  }
};

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback();
  } else if (value === registerForm.password) {
    confirmPasswordStatus.value = 'success';
    callback();
  } else {
    confirmPasswordStatus.value = 'error';
    callback(new Error('兩次密碼不一致'));
  }
};

// 表單驗證規則
const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '請輸入使用者名稱', trigger: 'blur' },
    { validator: validateUsername, trigger: 'change' }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { validator: validateEmail, trigger: 'change' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { validator: validatePassword, trigger: 'change' }
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'change' }
  ]
});

// 監聽表單值變化，清空狀態
watch(() => registerForm.username, (val) => {
  if (val === '') usernameStatus.value = '';
});

watch(() => registerForm.email, (val) => {
  if (val === '') emailStatus.value = '';
});

watch(() => registerForm.password, (val) => {
  if (val === '') {
    passwordStatus.value = '';
    // 當密碼變更時，重新驗證確認密碼
    if (registerForm.confirmPassword) {
      registerFormRef.value?.validateField('confirmPassword');
    }
  }
});

watch(() => registerForm.confirmPassword, (val) => {
  if (val === '') confirmPasswordStatus.value = '';
});

// 註冊處理函數
const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      
      // 模擬註冊處理
      setTimeout(() => {
        console.log('註冊請求：', {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        });
        
        ElMessage.success('註冊成功！');
        router.replace({ name: 'login' });
        loading.value = false;
      }, 1000);
    } else {
      ElMessage.error('請填寫完整註冊資訊');
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
  
  &.right-panel {
    min-width: 400px;
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
  font-size: 24px;
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
  padding-bottom: 40px;
  font-family: monospace;
}

.register-form {
  width: 60%;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
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

.success-icon {
  color: #10b981;
}

.error-icon {
  color: #ef4444;
}

:deep(.register-button) {
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