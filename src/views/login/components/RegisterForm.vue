<template>
  <el-card class="register-card" shadow="hover">
    <h2 class="title">註冊帳號</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
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

      <el-form-item label="確認密碼" prop="rePassword">
        <el-input
          v-model="form.rePassword"
          type="password"
          placeholder="再次輸入密碼"
          show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">註冊</el-button>
        <el-button @click="resetForm">重設</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { register } from "@/api/login";

//幫此表單設計引用名稱
const formRef = ref();

//:model="form" => 設定驗整哪個物件
interface RegisterForm {
  account: string;
  password: string;
  rePassword: string;
}
const form = ref<RegisterForm>({
  account: "",
  password: "",
  rePassword: "",
});

//自訂驗證函式（例如：密碼是否一致）
//一定要呼叫 callback()，不然會卡住！
const validatePasswordMatch = (_: any, value: string, callback: any) => {
  if (value === "") {
    callback(new Error("請再次輸入密碼"));
  } else if (value !== form.value.password) {
    callback(new Error("兩次輸入的密碼不一致"));
  } else {
    callback();
  }
};

//驗證規則基本語法（rules）
//rules 是一個物件，每個 key 對應到 form 的 prop 名稱，每個 key 對應一個陣列，陣列中是驗證規則。
const rules = {
  account: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
  rePassword: [
    { required: true, message: "請再次輸入密碼", trigger: "blur" },
    { validator: validatePasswordMatch, trigger: "blur" },
  ],
};

const submitForm = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success("註冊提交！");
      // TODO: 這裡可以串接 /register API
      register(form.value);
    } else {
      ElMessage.error("請確認註冊資訊是否正確");
    }
  });
};

const resetForm = () => {
  formRef.value.resetFields();
};
</script>

<style scoped lang="scss">
.register-card {
  max-width: 450px;
  margin: 80px auto;
  padding: 30px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}
</style>
