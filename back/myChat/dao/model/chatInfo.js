/**
 * 聊天信息
 */
const mongoose = require("mongoose"); //引入mongodb
const chatInfo = new mongoose.Schema({
    token: String, // 用户Token (后台生成)
    msgList: [ // 消息列表
        {
            otherToken: String,
            
        },
    ],
});
mongoose.model("chatInfo", chatInfo, "chatInfo"); //第一个friends为数据库的名称，第二个为上方变量
