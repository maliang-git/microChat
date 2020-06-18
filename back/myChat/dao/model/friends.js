/**
 * 好友列表
 */
const { dateFn } = require("../../plugs/date.js");
const mongoose = require("mongoose"); //引入mongodb
const friendsList = new mongoose.Schema({
    user_b: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCenter",
    }, // 好友信息
    addTime: {
        type: String,
        default: dateFn(new Date(), "yyyy-MM-dd hh:mm:ss"),
    }, // 当前时间
});
const friends = new mongoose.Schema({
    user_a: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCenter",
    },
    friendsList: [friendsList], // 用户好友列表
});
mongoose.model("friends", friends, "friends"); //第一个friends为数据库的名称，第二个为上方变量
