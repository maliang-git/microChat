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
    city: String, // 城市
    cityCode: String, // 城市编码
    status:Number, // 登录状态（1：在线 2：下线 ）
    socketId:String, // socketId
    content: Object, // 扩展字段
});



mongoose.model("userCenter", userCenter, "userCenter"); //第一个userInfo为数据库的名称，第二个为上方变量

