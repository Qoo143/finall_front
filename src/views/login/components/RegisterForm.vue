<template>
  <!-- 小寶箱 -->
  <div class="wrapper">
    <!-- 左邊的login -->
    <div class="leftPanel">
      <div class="panelContent">
        <p class="title">Register</p>
        <div class="middle">
          <el-form
            :model="registerForm"
            :rules="registerRules"
            ref="registerFormRef"
            class="register-form"
          >
            <!-- 帳號輸入框 -->
            <el-form-item prop="account">
              <el-input
                v-model="registerForm.account"
                placeholder="請輸入帳號"
                :prefix-icon="User"
              />
            </el-form-item>

            <!-- 密碼輸入框 -->
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="請輸入密碼"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <!-- 確認密碼輸入框 -->
            <el-form-item prop="rePassword">
              <el-input
                v-model="registerForm.rePassword"
                type="password"
                placeholder="請再次輸入密碼"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="bottom">
          <el-button
            @click="handleRegister"
            class="register-button"
            color="#fdba74"
            :loading="loading"
          >
            {{ loading ? "註冊中..." : "Register" }}
          </el-button>
        </div>
      </div>
    </div>
    <!-- 右邊的switch -->
    <div class="rightPanel">
      <div class="panelContent">
        <div class="top"><p class="welcomeText">welcome to QianTa</p></div>
        <div class="middle">
          <p class="subText">already have account ?</p>
          <button @click="goLogin" class="switchButton">
            <span>Login</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { register } from "@/api/login"; // 導入 register API

const router = useRouter();
const registerFormRef: any = ref<FormInstance>();
const loading = ref(false);

const goLogin = () => {
  router.push("/login");
};

const registerForm = reactive({
  account: "",
  password: "",
  rePassword: "",
});

// 表單驗證規則
const registerRules = reactive<FormRules>({
  account: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
  rePassword: [
    { required: true, message: "請再次輸入密碼", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error("兩次輸入的密碼不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true;

        // 呼叫註冊 API
        const res = await register({
          account: registerForm.account,
          password: registerForm.password,
        });

        // 根據後端回傳結果處理
        if (res.code === 0) {
          ElMessage.success(res.message || "註冊成功！");
          // 註冊成功，導向登入頁
          router.push("/login");
        } else {
          // 伺服器返回錯誤
          ElMessage.error(res.message || "註冊失敗，請稍後再試");
        }
      } catch (error: any) {
        console.error("註冊錯誤:", error);
        // 顯示詳細錯誤
        if (error.response?.data?.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error("網路錯誤，請稍後再試");
        }
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error("請填寫完整註冊資訊");
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


  .rightPanel {
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
    .middle {
      display: flex;
      flex-direction: column;
      align-items: center;

      .subText {
        font-size: 1rem;
        margin-bottom: 1rem;
      }
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
      margin: 0 auto;

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
  .leftPanel {
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
      .register-form {
        width: 80%;
        max-width: 300px;
      }
    }
    .bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
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

:deep(.register-button) {
  border: none !important;
  box-shadow: none !important;
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
</style>
