<template>
    <div class="honey-logo">
        <div class="wl-logo">
            <i class="iconfont icon-xiaomicopy">&#xe646;</i>
            <img src="~@/assets/images/logo1.png"
                 alt="" />
        </div>
        <div class="describe">
            <img src="~@/assets/images/img_title.png"
                 alt="" />
            <p>Talk about your heart</p>
        </div>
    </div>
</template>
<style lang="less" scoped>
.honey-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 4rem;
    background-color: #fff;
    margin-bottom: 0.4rem;
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
    .wl-logo {
        display: flex;
        align-items: center;
        > i {
            font-size: 0.76rem;
            color: #ff2a12;
            margin-left: 0.3rem;
        }
        > img {
            width: 2.5rem;
            margin-left: -0.3rem;
        }
    }
    .describe {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -0.16rem;
        > img {
            width: 2rem;
        }
        > p {
            font-size: 0.24rem;
            color: #999;
            font-weight: bold;
            margin-top: -0.3rem;
        }
    }
}
</style>
