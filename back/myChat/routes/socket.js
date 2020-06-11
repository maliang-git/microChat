const { dateFn } = require("../plugs/date.js");
/* WebSocket */
const mongoose = require("mongoose");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
server.listen(1000);

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
        if (data.userToken) {
            let userData = {
                token: data.userToken,
            };
            await mongoose
                .model("userCenter")
                .updateOne(userData, { socketId: id });
            socket.emit(id, "校验登录成功");

            // 查询我的好友列表
            let myFriendsList = await mongoose
                .model("friends")
                .find({ token: data.userToken });
            if (myFriendsList.length > 0) {
                // 返回好友列表
                socket.emit(
                    "friends_add_success",
                    myFriendsList[0].friendsList
                );
            }
            // 查询好友请求列表
            let queryResult = await mongoose
                .model("message")
                .find({ token: data.userToken });
            // 返回好友请求列表
            if (queryResult.length > 0) {
                // 返回好友列表
                socket.emit(
                    "friends_add_req",
                    queryResult[0].friendsReq.reverse()
                );
            }
        } else {
            socket.emit(id, "校验登录失败");
        }
    });

    // 请求添加好友
    socket.on("add_friends", async function (data) {
        let userData = {
            token: data.friendToken,
        };

        // 查询对方是否是我的好友
        let isFrirend = await mongoose
            .model("friends")
            .find({ token: data.myToken });
        if (isFrirend.length > 0) {
            for (let i = 0; i < isFrirend[0].friendsList.length; i++) {
                if (isFrirend[0].friendsList[i].token === data.friendToken) {
                    socket.emit("tips_msg", "对方已经是您的好友了！");
                    return false;
                }
            }
        }

        // 查询对方是否在线
        let overData = await mongoose.model("userCenter").find(userData);
        // 查询请求人信息
        let queryReqInfo = await mongoose
            .model("userCenter")
            .find({ token: data.myToken });
        // 查询当前被请求人留言信息
        let queryResult = await mongoose.model("message").find(userData);
        // 若已向对方发送过请求，对方并且未阅读
        if (queryResult.length > 0) {
            let reqList = queryResult[0].friendsReq;
            for (let i = 0; i < reqList.length; i++) {
                if (reqList[i].token === data.myToken && !reqList[i].isBrowse) {
                    socket.emit(
                        "tips_msg",
                        "您已向对方发送过请求，请耐心等待对方回应!"
                    );
                    return;
                }
            }
        }

        let friendsReq = {
            reqTime: dateFn(new Date(), "yyyy-MM-dd hh:mm:ss"), // 当前时间
            ...queryReqInfo[0]._doc, // 请求人信息
            reqMsg: "加个好友吧！", // 请求留言
            status: 1, // (1: 请求添加好友，2：已是好友 3：不是好友，也未请求添加)
            isBrowse: false, // 是否阅读
        };
        if (overData[0].socketId) {
            console.log("用户在线！");
            dataRest("online");
            socket.emit("tips_msg", "对方在线，好友请求已发送!");
        } else {
            console.log("用户离线！");
            dataRest("offline");
            socket.emit("tips_msg", "对方离线，好友请求已发送!");
        }
        async function dataRest(type) {
            friendsReq.type = type;
            let otherPartySocketId = overData[0].socketId;
            let reqMsg;
            if (queryResult.length === 0) {
                let msg = {
                    token: data.friendToken,
                    friendsReq,
                };
                reqMsg = await mongoose.model("message").create(msg);
            } else {
                let friendsReqList = queryResult[0].friendsReq;
                friendsReqList.push(friendsReq);
                mongoose.set("useFindAndModify", false);
                reqMsg = await mongoose.model("message").findOneAndUpdate(
                    { token: data.friendToken },
                    {
                        $set: {
                            friendsReq: friendsReqList,
                        },
                    },
                    { new: true }
                );
            }
            if (type === "online") {
                socket
                    .to(otherPartySocketId)
                    .emit("friends_add_req", reqMsg.friendsReq.reverse());
            }
        }
    });

    // 同意添加好友
    socket.on("agree_add_friends", async (data) => {
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
                if (otherFriendsList[0].friendsList[i].token === data.myToken && otherFriendsList[0].friendsList[i].status === 2) {
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
        

        // 初次添加好友为双方推送消息
        

        socket.emit("tips_msg", "添加好友成功！");
    });

    // 更新阅读状态
    socket.on("update_read_state", async function (data) {
        // 更新消息列表好友状态
        let queryResult = await mongoose
            .model("message")
            .find({ token: data.myToken });
        queryResult[0].friendsReq.forEach((item) => {
            if (item.token === data.friendToken) {
                item.isBrowse = true; // 已读
            }
        });
        let msgReqList = await mongoose
            .model("message")
            .findOneAndUpdate(
                { token: data.myToken },
                { friendsReq: queryResult[0].friendsReq },
                { new: true }
            );
        socket.emit("friends_add_req", msgReqList.friendsReq.reverse());
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
