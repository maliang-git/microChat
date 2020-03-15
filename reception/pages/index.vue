<template>
    <div class="container">
        <Logo></Logo>
        <mt-field placeholder="请输入手机号"
                  v-model="formData.phone"
                  style="width:100%;margin-bottom:20px;"
                  :attr="{ maxlength: 11 }"></mt-field>
        <mt-field placeholder="请输入密码"
                  v-model="formData.passWord"
                  style="width:100%;margin-bottom:20px;"
                  :attr="{ maxlength: 20 }"></mt-field>
        <mt-button type="primary"
                   style="width:100%;"
                   @click="loginHandel">登录</mt-button>
        <div class="regin">
            <a class="reg-btn"
               @click="$router.push('/reg')">账号快速注册</a>
        </div>
    </div>
</template>

<script>
import Logo from "~/components/public/Logo.vue";
import { Toast, Indicator } from 'mint-ui';
import { userCenter } from "~/api"
import Cookies from 'js-cookie'
export default {
    components: {
        Logo
    },
    data() {
        return {
            formData: {
                phone: "18142566233",
                passWord: "123456"
            }
        };
    },
    methods: {
        loginHandel() {
            if (!/^(1)[2,3,4,5,6,7,8,9][0-9]{9}$/.test(this.formData.phone)) {
                Toast({ message: '手机号有误' });
                return
            }
            if (this.formData.passWord === '' || this.formData.passWord.length < 5) {
                Toast({ message: '请输入5位以上的密码' });
                return
            }
            Indicator.open({
                spinnerType: 'fading-circle'
            });
            this.$axios.post(userCenter.userLogin,this.formData).then(res=>{
                Indicator.close();
                 if (res.code === 200) {
                    Cookies.set('sessionId',res.data.sessionId);
                    this.formData = {
                        phone: "",
                        passWord: ""
                    }
                    Toast({
                        message: '登录成功'
                    })
                    this.$router.replace("/chat")
                } else {
                    Toast({
                        message: res.msg
                    });
                }
            })
        }
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