<template>
    <div class="container">
        <a @click="$router.push(`/strA-${'参数id'}.html`)">去到页面A</a>
        <a @click="$router.push(`/strB/${'参数id'}`)">去到页面B</a>
    </div>
</template>

<script>
export default {
    middleware: 'router',
    data() {
        return {

        };
    },
    methods: {
        test() {
            this.$axios.post('/api/user-center/test').then(res => { })
        }
    },
    mounted() {
        this.test()
    }
};
</script>
<style lang="less" scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}
a {
    display: block;
    background-color: pink;
    margin-top: 40px;
    font-size: 30px;
    padding: 8px;
    border-radius: 10px;
}
</style>