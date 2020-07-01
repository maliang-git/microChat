const { dateFn } = require("../plugs/date.js");
/* WebSocket */
const mongoose = require("mongoose");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
server.listen(1000);
mongoose.set("useFindAndModify", false);

// 定义填充字段
const fieldTable = {
    user: "_id city cityCode createTime headImg loginName phone userName token", // 用户
};

//socket部分
io.on("connection", function (socket) {
    console.log("连接成功");

    //接收并处理客户端的hi事件
    socket.on("message", function (data) {
        console.log(data);
    });

    const { id } = socket;
    // 校验登录
    socket.on("verify_login", async function (data) {
        console.log("用户id:", data);
        if (data.user_id) {
            try {
                let isExist = await mongoose
                    .model("userCenter")
                    .findByIdAndUpdate(
                        data.user_id,
                        { socketId: id },
                        { new: true }
                    );
                if (isExist) {
                    socket.emit(id, "校验登录成功");
                    // 查询请求消息列表
                    let reqMsg = await mongoose
                        .model("message")
                        .findById(data.user_id)
                        .populate({
                            path: "msgList.user_b",
                            select: fieldTable.user,
                        });
                    if (reqMsg) {
                        socket.emit(
                            "friends_add_req",
                            reqMsg.msgList.reverse()
                        );
                    }

                    // 查询好友列表
                    findFrendsList(data.user_id);

                    // 查询房间列表
                    returnRoomList(data.user_id);
                } else {
                    socket.emit(id, {
                        type: "signOut",
                        content: "用户不存在",
                    });
                }
            } catch (error) {
                console.log(77, error);
            }
        } else {
            socket.emit(id, {
                type: "signOut",
                content: "校验登录失败",
            });
        }
    });

    socket.on("find_frends_list", async function (data) {
        findFrendsList(data.userId);
    });

    // 查询好友列表
    async function findFrendsList(userId) {
        let friend = await mongoose.model("friends").findById(userId).populate({
            path: "friendsList.user_b",
            select: fieldTable.user,
        });
        if (friend) {
            socket.emit("friends_add_success", friend.friendsList);
        }
    }

    // socket.on("get_room_list", async function (data) {
    //     returnRoomList(data.userId);
    // });

    async function returnRoomList(user_id) {
        // 查询房间列表
        let room = await mongoose
            .model("room")
            .findById(user_id)
            .populate("roomList.origin_user", fieldTable.user);
        if (room) {
            socket.emit("return_room_list", room.roomList);
        }
    }

    // 请求添加好友
    socket.on("add_friends", async function (data) {
        let { send_user, receive_user } = data;
        try {
            // 查询是否已经向对方发送过好友请求
            let isRead = await mongoose.model("message").findOne({
                _id: receive_user,
                "msgList.user_b": send_user,
                msgList: { $elemMatch: { isBrowse: 0 } },
            });
            if (isRead && isRead.msgList.length > 0) {
                socket.emit(
                    "tips_msg",
                    "您已向对方发送过请求，请耐心等待对方回应!"
                );
                return;
            }

            // 查询双方是否已经是好友
            let isFriend = await mongoose.model("friends").findOne({
                _id: send_user,
                "friendsList.user_b": receive_user,
            });
            if (isFriend) {
                socket.emit("tips_msg", "对方已经是您的好友!");
                return;
            }
        } catch (error) {
            console.log(error);
        }
        let msgItem = {
            user_b: send_user, // 请求人id
            reqMsg: "加个好友吧！",
        };
        try {
            reqMsg = await mongoose
                .model("message")
                .findByIdAndUpdate(
                    receive_user,
                    {
                        user_a: receive_user,
                        $push: {
                            msgList: msgItem,
                        },
                    },
                    { upsert: true, new: true } // upsert参数表示没有是否新建，new表示是否返回跟新后的数据
                )
                .populate({
                    path: "user_a",
                    select: "socketId",
                })
                .populate({
                    path: "msgList.user_b",
                    select: fieldTable.user,
                });
            let user_a_socket_id = reqMsg.user_a.socketId;
            socket.emit(
                "tips_msg",
                `${user_a_socket_id ? "对方在线" : "对方离线"}发送添加请求成功!`
            );
            socket
                .to(user_a_socket_id)
                .emit("friends_add_req", reqMsg.msgList.reverse());
        } catch (error) {
            console.log(error);
        }
    });

    // 同意添加好友
    socket.on("agree_add_friends", async (data) => {
        try {
            let isFriend = await mongoose.model("friends").findOne({
                _id: data.myId,
                "friendsList.user_b": data.friendID,
            });
            if (isFriend) {
                socket.emit("tips_msg", "对方已经是您的好友！");
                return;
            }
            let user_a_friends = await mongoose
                .model("friends")
                .findByIdAndUpdate(
                    data.myId,
                    {
                        user_a: data.myId,
                        $push: {
                            friendsList: {
                                user_b: data.friendID,
                            },
                        },
                    },
                    { upsert: true, new: true } // upsert参数表示没有是否新建，new表示是否返回跟新后的数据);
                )
                .populate("friendsList.user_b", fieldTable.user);
            let user_b_friends = await mongoose
                .model("friends")
                .findByIdAndUpdate(
                    data.friendID,
                    {
                        user_a: data.friendID,
                        $push: {
                            friendsList: {
                                user_b: data.myId,
                            },
                        },
                    },
                    { upsert: true, new: true } // upsert参数表示没有是否新建，new表示是否返回跟新后的数据);
                )
                .populate({
                    path: "user_a",
                    select: "socketId",
                })
                .populate({
                    path: "friendsList.user_b",
                    select: fieldTable.user,
                });
            socket.emit("tips_msg", "添加好友成功！");
            socket.emit("friends_add_success", user_a_friends.friendsList);
            socket
                .to(user_b_friends.user_a.socketId)
                .emit("friends_add_success", user_b_friends.friendsList);

            // 生成聊信息
            await mongoose.model("chat").create({
                content: "我通过了您的朋友验证请求，现在我们可以开始聊天了",
                is_send: 0,
                send_user: data.myId,
                to_user: data.friendID,
            });
            await mongoose.model("chat").create({
                content: "我们已经是好友了，现在开始聊天吧",
                is_send: 0,
                send_user: data.friendID,
                to_user: data.myId,
            });

            // 相互生成首页房间
            let send_user_room = await mongoose
                .model("room")
                .findByIdAndUpdate(
                    data.myId,
                    {
                        aff_user: data.myId,
                        $push: {
                            roomList: {
                                origin_user: data.friendID,
                                lastMsg: "我们已经是好友了，现在开始聊天吧",
                                unread_num: 1,
                                nweData: new Date(),
                            },
                        },
                    },
                    { upsert: true, new: true }
                )
                .populate("roomList.origin_user", fieldTable.user);
            let to_user_room = await mongoose
                .model("room")
                .findByIdAndUpdate(
                    data.friendID,
                    {
                        aff_user: data.friendID,
                        $push: {
                            roomList: {
                                origin_user: data.myId,
                                lastMsg:
                                    "我通过了您的朋友验证请求，现在我们可以开始聊天了",
                                unread_num: 1,
                                nweData: new Date(),
                            },
                        },
                    },
                    { upsert: true, new: true }
                )
                .populate("roomList.origin_user", fieldTable.user);
            socket.emit("return_room_list", send_user_room.roomList);
            socket
                .to(user_b_friends.user_a.socketId)
                .emit("return_room_list", to_user_room.roomList);
        } catch (error) {
            console.log("添加好友", error);
        }
    });

    // 更新好友请求消息阅读状态
    socket.on("update_read_state", async function (data) {
        let updateInfo = await mongoose
            .model("message")
            .findOneAndUpdate(
                {
                    _id: data.myId,
                    "msgList._id": data.msgId,
                },
                { $set: { "msgList.$.isBrowse": 1 } },
                { new: true }
            )
            .populate("msgList.user_b", fieldTable.user);
        socket.emit("friends_add_req", updateInfo.msgList.reverse());
    });

    // 更新房间消息阅读状态
    socket.on("update_room_msg_read", async function (data) {
        try {
            let sadasd = await mongoose.model("room").findOneAndUpdate(
                {
                    _id: data.userId,
                    "roomList._id": data.roomId,
                },
                { $set: { "roomList.$.unread_num": 0 } },
                { upsert: true, new: true }
            );
        } catch (error) {
            socket.emit("tips_msg", error);
        }
        returnRoomList(data.userId);
    });

    // 获取聊天窗口房间信息
    socket.on("get_room_info", async function (data) {
        let { to_user, send_user } = data;
        try {
            let roomInfo = await mongoose.model("room").findOne(
                {
                    aff_user: send_user,
                    "roomList.origin_user": to_user,
                },
                { "roomList.$": 1 } // $占位符，返回数组中第一个匹配的数组元素值(子集)
            );
            socket.emit("return_room_info", roomInfo.roomList[0]);
        } catch (error) {
            socket.emit("tips_msg", error);
        }
    });

    // 获取消息列表分页查询
    socket.on("get_msg_list", async function (data) {
        let { send_user, to_user, page, limit } = data;
        let msgList = await mongoose
            .model("chat")
            .find({
                send_user: {
                    $in: [send_user, to_user],
                },
                to_user: {
                    $in: [send_user, to_user],
                },
            })
            .skip((page - 1) * limit)
            .limit(15)
            .sort({ _id: -1 })
            .populate("send_user", fieldTable.user)
            .populate("to_user", fieldTable.user);
        let countTotal = await mongoose
            .model("chat")
            .find({
                send_user: {
                    $in: [send_user, to_user],
                },
                to_user: {
                    $in: [send_user, to_user],
                },
            })
            .countDocuments();
        console.log(12, countTotal);
        socket.emit("return_msg_list", {
            total: countTotal,
            data: msgList.reverse(),
        });
    });

    // 更改用户信息
    socket.on("update_user_info", async function (data) {
        // userId ： 用户id
        // editType ： 更改类型  （head 更改头像，name 昵称，gender 更改性别， region 更改地区，autograph 更改签名）
        // keyWords： 更改内容
        let { userId, editType, keyWords } = data;
        if (!userId) {
            socket.emit("return_user_info", {
                code: 414,
                msg: "缺少userId",
                data: {},
            });
            return;
        }
        if (!editType) {
            socket.emit("return_user_info", {
                code: 414,
                msg: "缺少editType",
                data: {},
            });
            return;
        }
        if (!keyWords) {
            socket.emit("return_user_info", {
                code: 414,
                msg: "缺少keyWords",
                data: {},
            });
            return;
        }
        let updateData = {};
        switch (editType) {
            case "head":
                updatUserInfo();
                break;
            case "name":
                updateData.loginName = keyWords;
                updatUserInfo();
                break;
            case "gender":
                updateData.gender = keyWords;
                updatUserInfo();
                break;
            case "region":
                updateData.cityInfo = keyWords;
                updatUserInfo();
                break;
            case "autograph":
                updateData.autograph = keyWords;
                updatUserInfo();
                break;
            default:
                socket.emit("return_user_info", {
                    code: 414,
                    msg: "editType类型不存在",
                    data: {},
                });
                break;
        }
        async function updatUserInfo() {
            let userInfo = await mongoose
                .model("userCenter")
                .findByIdAndUpdate(userId, updateData, { new: true });
            socket.emit("return_user_info", {
                code: 200,
                msg: "操作成功",
                data: userInfo,
            });
        }
    });

    // 发送信息
    socket.on("send_messge", async function (data) {
        let { to_user, send_user, messge } = data;
        let to_user_socket_id;
        try {
            // 发送聊天信息
            mongoose.model("chat").create(
                {
                    content: messge,
                    send_user,
                    to_user,
                },
                (error, res) => {
                    if (error) {
                        socket.emit("tips_msg", error);
                        return;
                    }
                    mongoose
                        .model("chat")
                        .findById(res._id)
                        .populate({
                            path: "send_user",
                            select: fieldTable.user,
                        })
                        .populate({
                            path: "to_user",
                            select: fieldTable.user + " socketId",
                        })
                        .exec((err, msg) => {
                            if (err) {
                                socket.emit("tips_msg", err);
                                return;
                            }
                            socket.emit("receive_msg", msg);
                            to_user_socket_id = msg.to_user.socketId;
                            socket
                                .to(msg.to_user.socketId)
                                .emit("receive_msg", msg);
                        });
                }
            );

            // 更新房间数据
            let send_room = await mongoose
                .model("room")
                .findOneAndUpdate(
                    {
                        _id: send_user,
                        "roomList.origin_user": to_user,
                    },
                    {
                        $set: {
                            "roomList.$.lastMsg": messge,
                            "roomList.$.nweData": new Date(),
                        },
                    },
                    { new: true }
                )
                .populate("roomList.origin_user", fieldTable.user);
            let to_room = await mongoose
                .model("room")
                .findOneAndUpdate(
                    {
                        _id: to_user,
                        "roomList.origin_user": send_user,
                    },
                    {
                        $set: {
                            "roomList.$.lastMsg": messge,
                            "roomList.$.nweData": new Date(),
                        },
                        $inc: { "roomList.$.unread_num": 1 },
                    },
                    { new: true }
                )
                .populate("roomList.origin_user", fieldTable.user);
            socket.emit("return_room_list", send_room.roomList);
            socket
                .to(to_user_socket_id)
                .emit("return_room_list", to_room.roomList);
        } catch (error) {
            socket.emit("tips_msg", error);
        }
    });
    // 断开事件
    socket.on("disconnect", async function (data) {
        const { id } = socket;
        console.log("断开", id);
        await mongoose
            .model("userCenter")
            .updateOne({ socketId: id }, { socketId: "" });
        // socket.emit("c_leave", "离开");
        //socket.broadcast用于向整个网络广播(除自己之外)
        //socket.broadcast.emit('c_leave','某某人离开了')
    });
});
