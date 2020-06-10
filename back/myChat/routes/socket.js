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
            console.log();
            if (myFriendsList.length > 0) {
                // 返回好友列表
                socket.emit(
                    "friends_add_success",
                    myFriendsList[0].friendsList
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
        // 查询对方是否在线
        let overData = await mongoose.model("userCenter").find(userData);
        // 查询请求人信息
        let queryReqInfo = await mongoose
            .model("userCenter")
            .find({ token: data.myToken });
        // 查询当前被请求人留言信息
        let queryResult = await mongoose.model("message").find(userData);
        let friendsReq = {
            reqTime: dateFn(new Date(), "yyyy-MM-dd hh:mm:ss"), // 当前时间
            reqPeople: queryReqInfo[0], // 请求人
            reqMsg: "加个好友吧！", // 请求留言
            type: "", // 线上还是线下
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
            if (type === "online") {
                let otherPartySocketId = overData[0].socketId;
                socket
                    .to(otherPartySocketId)
                    .emit("friends_add_req", [friendsReq]);
            }
            if (queryResult.length === 0) {
                let msg = {
                    token: data.friendToken,
                    friendsReq,
                };
                await mongoose.model("message").create(msg);
            } else {
                let friendsReqList = queryResult[0].friendsReq;
                friendsReqList.push(friendsReq);
                await mongoose
                    .model("message")
                    .updateOne(
                        { token: data.friendToken },
                        { friendsReq: friendsReqList }
                    );
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
                if (otherFriendsList[0].friendsList[i].token === data.myToken) {
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
            let myFriend = myInfo[0].friendsList;
            myFriend.push(otherInfo[0]);
            await mongoose
                .model("friends")
                .updateOne({ token: data.myToken }, { friendsList: myFriend });
            // 返回我的好友
            socket.emit("friends_add_success", myFriend);
        }
        socket.emit("tips_msg", "添加好友成功！");
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
