/**
 * 聊天室列表
 */
const { dateFn } = require("../../plugs/date.js");
const mongoose = require("mongoose"); //引入mongodb
const msgItem = new mongoose.Schema({
    sendUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCenter",
    },
    msgType: {
        type: Number,
        default: 1,
    }, // (消息类型：1、文本消息)
    msgContent: String,
    createTime: {
        type: Date,
        default: Date.now,
    },
});
const room = new mongoose.Schema({
    msgList: [msgItem], // 消息列表
});
mongoose.model("room", room, "room");
