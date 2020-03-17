<template>
    <div class="container">
        页面A
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