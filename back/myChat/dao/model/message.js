/**
 * 即时通讯消息
 */
const { dateFn } = require("../../plugs/date.js");
const mongoose = require("mongoose"); //引入mongodb
const msgList = new mongoose.Schema({
    user_b: {
        type: String,
        ref: "userCenter",
    }, // 请求人信息
    createTime: {
        type: Date,
        default: Date.now,
    },
    updateTime: {
        type: Date,
        default: Date.now,
    },
    reqMsg: String, // 请求留言
    status: {
        type: Number,
        default: 1,
    }, // (1: 请求添加好友，2：已是好友 3：不是好友，也未请求添加)
    isBrowse: {
        type: Number,
        default: 0,
    }, // 是否阅读 (1:已阅，0：未阅读)
});
const message = new mongoose.Schema({
    user_a: {
        type: String,
        ref: "userCenter",
    },
    msgList: [msgList], // 消息列表
});
mongoose.model("message", message, "message"); //第一个userInfo为数据库的名称，第二个为上方变量
