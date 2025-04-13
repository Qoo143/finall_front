<template>
  <el-card class="login-card" shadow="hover">
    <h2 class="title">登入系統</h2>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="帳號" prop="account">
        <el-input v-model="form.account" placeholder="請輸入帳號" />
      </el-form-item>

      <el-form-item label="密碼" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="請輸入密碼"
          show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">登入</el-button>
        <el-button @click="resetForm">重設</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { login } from "@/api/login";
const formRef = ref();

//響應市
const form = ref({
  account: "",
  password: "",
});

//定義提示
const rules = {
  account: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
};

//驗證方法
const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      ElMessage.success("登入成功！");
      // TODO: 可以在這裡呼叫 API 做登入處理
      const res: any = await login(form.value);
      console.log(res);
      //此處res可以取得後端給前端登入的token

      localStorage.setItem("account", res.result.account);
      localStorage.setItem("token", res.token);
    } else {
      ElMessage.error("請完整填寫登入資訊");
    }
  });
};

const resetForm = () => {
  formRef.value.resetFields();
};
</script>

<style scoped lang="scss">
.login-card {
  max-width: 400px;
  margin: 80px auto;
  padding: 30px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}
</style>
