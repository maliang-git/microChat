<template>
  <div class="container">
    <div class="wl-logo">蜜语</div>
    <mt-field
      placeholder="请输入手机号"
      v-model="formData.phone"
      style="width:100%;margin-bottom:20px;"
    ></mt-field>
    <mt-field
      placeholder="请输入密码"
      v-model="formData.passWord"
      style="width:100%;margin-bottom:20px;"
    ></mt-field>
    <mt-button type="primary" style="width:100%;">登录</mt-button>
  </div>
</template>

<script>
import Logo from "~/components/Logo.vue";

export default {
  components: {
    Logo
  },
  data() {
    return {
      formData: {
        phone: "",
        passWord: ""
      }
    };
  }
};
</script>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  padding: 0 24px;
  background-color: #f0f2f5;
  .form {
    width: 200px;
  }
}
</style>
