/**
 * 聊天信息
 */
const { dateFn } = require("../../plugs/date.js");
const mongoose = require("mongoose"); //引入mongodb
const msg = new mongoose.Schema({
    content: String, // 聊天内容
    type: Number, // 1:我方消息 2:对方消息
    createdAt: {
        type: String,
        default: dateFn(new Date(), "yyyy-MM-dd hh:mm:ss"),
    }, // 创建时间
    isRead: {
        // 是否阅读
        type: Boolean,
        default: false,
    },
});
const msgList = new mongoose.Schema({
    userInfo: {
        // 对方用户信息
        type: Object,
        required: true, // 设置该字段为必传字段
    },
    msg: [msg],
});
const chatInfo = new mongoose.Schema({
    assUser: { type: mongoose.Schema.Types.ObjectId, ref: "userCenter" }, // 关联用户
    myToken:String,
    msgList: [msgList],
});
mongoose.model("chatInfo", chatInfo, "chatInfo"); //第一个friends为数据库的名称，第二个为上方变量
