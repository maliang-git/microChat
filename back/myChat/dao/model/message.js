/**
 * 即时通讯消息
 */
const mongoose = require("mongoose"); //引入mongodb
const message = new mongoose.Schema({
    token: String, // 用户Token (后台生成)
    friendsReq: Array, // 用户请求添加好有
});
mongoose.model("message", message, "message"); //第一个userInfo为数据库的名称，第二个为上方变量

