<template>
    <div class="container">
        <Logo></Logo>
        <mt-field placeholder="请输入昵称"
                  v-model="formData.phone"
                  style="width:100%;margin-bottom:20px;"></mt-field>
        <mt-field placeholder="请输入手机号"
                  v-model="formData.phone"
                  style="width:100%;margin-bottom:20px;"></mt-field>
        <mt-field placeholder="请输入密码"
                  v-model="formData.passWord"
                  style="width:100%;margin-bottom:20px;"></mt-field>
        <mt-button type="primary"
                   style="width:100%;">立即注册</mt-button>
        <div class="regin">
            <a class="reg-btn"
               @click="$router.push('/')">登录</a>
        </div>
    </div>
</template>

<script>
import Logo from "~/components/public/Logo.vue";
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
<style lang="less">
.mint-cell-wrapper {
    background-image: none;
}
</style>
<style lang="less" scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    min-height: 100vh;
    padding: 0 24px;
    background-color: #f0f2f5;
    overflow: hidden;
    padding-top: 1.2rem;
    .regin {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 0.2rem;
        .reg-btn {
            padding: 0.2rem 0;
            font-size: 0.28rem;
            font-family: PingFang SC;
            font-weight: 500;
            color: #878787;
        }
    }
}
</style>