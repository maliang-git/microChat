<template>
    <div class="container">
        主页
        <a @click="test">ceshi</a>
    </div>
</template>

<script>
export default {
    data() {
        return {
          
        };
    },
    methods: {
        test(){
            this.$axios.post('/api/user-center/test').then(res => {})
        }
    },
    mounted(){
        this.test()
    }
};
</script>
<style lang="less" scoped>

</style>