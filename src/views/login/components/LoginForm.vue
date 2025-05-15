<template>
  <!-- 小寶箱 -->
  <div class="wrapper">
    <!-- 左邊的switch -->
    <div class="leftPanel">
      <div class="panelContent">
        <div class="top"><p class="welcomeText">welcome to QianTa</p></div>
        <div class="midle">
          <p class="subText">Don't have an account ?</p>
          <button @click="goRegister" class="switchButton">
            <span>Register</span>
          </button>
        </div>
        <div class="bottom">
          <img
            src="../../../../public/img/QIANTA2.svg"
            alt="Logo"
            class="logo"
          />
          <p class="copyRight">© 2025 QianTa, Inc. 版權所有</p>
        </div>
      </div>
    </div>
    <!-- 右邊的login -->
    <div class="rightPanel">
      <div class="panelContent">
        <p class="title">Login</p>
        <div class="middle">
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
                @keypress.enter="handleLogin"
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
                @keypress.enter="handleLogin"
              />
            </el-form-item>
          </el-form>
          <el-button text class="forget-button"> ForgetPassword? </el-button>
        </div>

        <div class="bottom">
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
            {{ loading ? "Login..." : "Login" }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { useUserInfoStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserInfoStore();
const loginFormRef: any = ref<FormInstance>();
const loading = ref(false);

const goRegister = () => {
  router.push("/register");
};

const loginForm = reactive({
  account: "",
  password: "",
});

// 表單驗證規則
const loginRules = reactive<FormRules>({
  account: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true;

        // 使用 store 的登入方法
        await userStore.userLogin(loginForm);

        ElMessage.success("登入成功！");

        router.push({ name: "Home" });
      } catch (error: any) {
        console.error("登入錯誤:", error);
        ElMessage.error(error.message || "登入失敗，請檢查帳號密碼");
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error("請填寫完整登入資訊");
      return false;
    }
  });
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  display: flex;

  .leftPanel {
    width: 40%;
    height: 100%;
    padding: 96px;

    .welcomeText {
      font-size: 24px;
    }
    .bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .subText {
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .copyRight {
      font-size: 12px;
      margin-top: 1rem;
      color: #6b7280;
    }
    //變化按鈕
    .switchButton {
      font-size: 1.5rem;
      padding: 0.8rem 1.2rem;
      border-radius: 16px;
      border: 2px solid #fb923c;
      color: #fb923c;
      background-color: transparent;
      cursor: pointer;

      position: relative;
      overflow: hidden;
      z-index: 1;
      transition: color 0.3s ease;
      // 👉 關鍵：讓文字層保持在上層

      span {
        position: relative;
        z-index: 1;
      }

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -125%;
        width: 120%;
        height: 120%;
        background-color: #fb923c;
        transition: transform 0.3s ease;
        z-index: 0;
      }

      &:hover::before {
        transform: translateX(90%);
      }

      // 文字 hover 後變白色
      &:hover {
        color: white;
      }
    }
  }
  .rightPanel {
    width: 60%;
    // min-width: 400px;
    height: 100%;
    padding: 86px 16px 96px 16px;

    .title {
      color: $primary-b-d;
      font-size: 3rem;
      font-family: monospace;
    }
    .middle {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      .login-form {
        width: 80%; // 或任何你想要的固定寬度，例如 320px
        max-width: 300px; // 設定最大寬度避免在大螢幕上過寬
      }
    }
    .bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      .social-login {
        width: 80%;
        display: flex;
        justify-content: space-between;
        list-style: none;
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
    }
  }
  .panelContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
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

:deep(.login-button) {
  border: none !important;
  box-shadow: none !important;
  position: relative;
  width: 208px;
  height: 40px;
  margin-top: 20px;
  border-radius: 12px;
  font-size: 16px;
  overflow: hidden;
  // &:hover{
  //   border: none;
  // }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, #f87171, #eab308);
    opacity: 0;
    transition: opacity 0.3s ease;
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
:deep(.forget-button) {
  position: relative;
  color: $primary-b-d;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    height: 1px;
    color: $primary-b-d;
    background-color: currentColor;
    transform: scaleX(0); // 初始寬度為 0
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1); // 鼠標懸停時寬度擴展到 100%
  }
  &:hover {
    background-color: transparent !important; // 移除 hover 背景色
    // 或設置你想要的背景色
  }
}
</style>
