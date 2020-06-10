/**
 * 好友列表
 */
const mongoose = require("mongoose"); //引入mongodb
const friends = new mongoose.Schema({
    token: String, // 用户Token (后台生成)
    friendsList: Array, // 用户好友列表
});
mongoose.model("friends", friends, "friends"); //第一个friends为数据库的名称，第二个为上方变量

