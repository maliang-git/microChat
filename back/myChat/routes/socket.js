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
                    let friend = await mongoose
                        .model("friends")
                        .findById(data.user_id)
                        .populate({
                            path: "friendsList.user_b",
                            select: fieldTable.user,
                        });
                    if (friend) {
                        socket.emit("friends_add_success", friend.friendsList);
                    }
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
            console.log(reqMsg);
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

            // // 生成聊天室
            // let room = await mongoose.model("room").findByIdAndUpdate(
            //     data.myId,
            //     {
            //         user: data.myId,
            //         $push: {
            //             roomList: {
            //                 msgList: [
            //                     {
            //                         sendUser: data.friendID,
            //                         msgContent: "我们是好友啦",
            //                     },
            //                 ],
            //             },
            //         },
            //     },
            //     { upsert: true, new: true }
            // );
            // console.log(123, room);
        } catch (error) {
            console.log("添加好友", error);
        }
        return;
        let otherInfo = await mongoose
            .model("userCenter")
            .find({ token: data.friendToken }); // 对方信息
        let myInfo = await mongoose
            .model("userCenter")
            .find({ token: data.myToken }); // 我方信息
        otherInfo[0].status = 2;
        myInfo[0].status = 2;
        let otherData = {
            token: data.friendToken,
            friendsList: myInfo[0],
        };
        let myData = {
            token: data.myToken,
            friendsList: otherInfo[0],
        };
        let otherFriendsList = await mongoose
            .model("friends")
            .find({ token: data.friendToken }); // 对方好友列表
        let myFriendsList = await mongoose
            .model("friends")
            .find({ token: data.myToken }); // 我方好友列表

        if (otherFriendsList.length === 0) {
            await mongoose.model("friends").create(otherData);
            // 若对方在线，把我的信息发送给对方
            if (otherInfo[0].socketId) {
                socket
                    .to(otherInfo[0].socketId)
                    .emit("friends_add_success", [myInfo[0]]);
            }
        } else {
            for (let i = 0; i < otherFriendsList[0].friendsList.length; i++) {
                if (
                    otherFriendsList[0].friendsList[i].token === data.myToken &&
                    otherFriendsList[0].friendsList[i].status === 2
                ) {
                    socket.emit("tips_msg", "对方已经是您的好友了！");
                    return;
                }
            }
            let otherFriend = otherFriendsList[0].friendsList;
            otherFriend.push(myInfo[0]);
            await mongoose
                .model("friends")
                .updateOne(
                    { token: data.friendToken },
                    { friendsList: otherFriend }
                );
            // 若对方在线，把我的信息发送给对方
            if (otherInfo[0].socketId) {
                socket
                    .to(otherInfo[0].socketId)
                    .emit("friends_add_success", otherFriend);
            }
        }
        if (myFriendsList.length === 0) {
            await mongoose.model("friends").create(myData);
            // 返回我的好友
            socket.emit("friends_add_success", [otherInfo[0]]);
        } else {
            let myFriend = myFriendsList[0].friendsList;
            myFriend.push(otherInfo[0]);
            await mongoose
                .model("friends")
                .updateOne({ token: data.myToken }, { friendsList: myFriend });
            // 返回我的好友
            socket.emit("friends_add_success", myFriend);
        }

        // 更新请求添加消息列表好友状态
        let queryResult = await mongoose
            .model("message")
            .find({ token: data.myToken });
        queryResult[0].friendsReq.forEach((item) => {
            if (item.token === data.friendToken) {
                item.status = 2; // 已是好友
                item.isBrowse = true; // 已读
            }
        });
        mongoose.set("useFindAndModify", false);
        let msgReqList = await mongoose
            .model("message")
            .findOneAndUpdate(
                { token: data.myToken },
                { friendsReq: queryResult[0].friendsReq },
                { new: true }
            );
        socket.emit("friends_add_req", msgReqList.friendsReq.reverse());

        addChatInfo();
        // 新增聊天信息
        async function addChatInfo() {
            const myMsg = {
                userInfo: otherInfo[0],
                msg: [
                    {
                        content: "我们已经是好友了，现在开始聊天吧。",
                        type: 2, // 1:我方消息 2:对方消息
                    },
                ],
            };
            const friendMsg = {
                userInfo: myInfo[0],
                msg: [
                    {
                        content:
                            "我通过了您的朋友验证请求，现在我们可以开始聊天了",
                        type: 2, // 1:我方消息 2:对方消息
                    },
                ],
            };
            const myChatInfo = await mongoose // 当前用户
                .model("chatInfo")
                .findOneAndUpdate(
                    { myToken: data.myToken },
                    { $push: { msgList: myMsg } },
                    { new: true }
                );
            const friendChatInfo = await mongoose // 对方用户
                .model("chatInfo")
                .findOneAndUpdate(
                    { myToken: data.friendToken },
                    { $push: { msgList: friendMsg } },
                    { new: true }
                );
            // 发送消息给双方
            socket.emit("chat_info_rec", myChatInfo.msgList);
            socket
                .to(otherInfo[0].socketId)
                .emit("chat_info_rec", friendChatInfo.msgList);
        }

        socket.emit("tips_msg", "添加好友成功！");
    });

    // 更新阅读状态
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

    // 发送信息
    socket.on("send_messge", async function (data) {
        console.log(data);
        let otherInfo = await mongoose
            .model("userCenter")
            .find({ token: data.friendToken }); // 对方信息
        let myInfo = await mongoose
            .model("userCenter")
            .find({ token: data.myToken }); // 我方信息
        addChatInfo();
        // 新增聊天信息
        async function addChatInfo() {
            const myMsg = {
                content: data.messge,
                type: 1, // 1:我方消息 2:对方消息
                isRead: true,
            };
            const friendMsg = {
                content: data.messge,
                type: 2, // 1:我方消息 2:对方消息
                isRead: false,
            };

            const myChatInfo = await mongoose // 当前用户
                .model("chatInfo")
                .findOneAndUpdate(
                    {
                        myToken: data.myToken,
                        "msgList.userInfo.token": otherInfo[0].token,
                    },
                    {
                        $push: {
                            "msgList.$.msg": myMsg,
                        },
                    },
                    { new: true }
                );
            const friendChatInfo = await mongoose // 当前用户
                .model("chatInfo")
                .findOneAndUpdate(
                    {
                        myToken: data.friendToken,
                        "msgList.userInfo.token": myInfo[0].token,
                    },
                    {
                        $push: {
                            "msgList.$.msg": friendMsg,
                        },
                    },
                    { new: true }
                );
            //  发送消息给双方
            socket.emit("chat_info_rec", myChatInfo.msgList);
            socket
                .to(otherInfo[0].socketId)
                .emit("chat_info_rec", friendChatInfo.msgList);
        }
    });
    // 加入指定房间
    socket.on("join_room", async function (roomName) {});
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
