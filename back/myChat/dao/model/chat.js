const mongoose = require("mongoose"); //引入mongodb
const chat = new mongoose.Schema({
    msg_type: {
        type: Number,
        default: 1,
    }, // '类型 1：文字；47：emoji；43：音频；436207665：红包；49：文件；48：位置；3：图片',
    create_time: {
        // 发送时间
        type: Date,
        default: Date.now,
    },
    content: String, // 发送内容
    status: {
        // 是否查看 1：是 0：不是
        type: Number,
        default: 0,
    }, // 查看状态
    is_send: {
        // 是否是自己发送 1：是 0：不是
        type: Number,
        default: 1,
    },
    send_user: {
        // 发送人
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCenter",
    },
    to_user: {
        // 接收人
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCenter",
    },
});
mongoose.model("chat", chat, "chat");
