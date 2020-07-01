/**
 * 用户中心
 */
const mongoose = require("mongoose"); //引入mongodb
const userCenter = new mongoose.Schema({
    token: String, // 用户Token (后台生成)
    loginName: String, // 用户昵称（*必传）
    phone: String, // 手机号（*必传）
    passWord: String, // 密码（*必传）
    userName: String, // 真实姓名
    headImg: String, // 头像
    status: Number, // 登录状态（1：在线 2：下线 ）
    socketId: String, // socketId
    gender: String, // 性别
    content: Object, // 扩展字段
    cityInfo: Object, // 城市信息
    autograph: String, // 签名
    createTime: {
        type: Date,
        default: Date.now,
    },
});

mongoose.model("userCenter", userCenter, "userCenter"); //第一个userInfo为数据库的名称，第二个为上方变量
