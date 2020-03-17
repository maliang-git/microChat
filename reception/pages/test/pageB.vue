<template>
    <div class="container">
        页面B
    </div>
</template>

<script>
export default {
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
</style>