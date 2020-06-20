const mongoose = require("mongoose"); //引入mongodb
const roomItem = new mongoose.Schema(
    {
        origin_user: {
            // 来源用户
            type: mongoose.Schema.Types.ObjectId,
            ref: "userCenter",
        },
        lastMsg: String,
        unread_num: Number, // 未读消息数
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
const room = new mongoose.Schema({
    aff_user: {
        // 所属用户
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCenter",
    },
    roomList: [roomItem],
});
mongoose.model("room", room, "room");
