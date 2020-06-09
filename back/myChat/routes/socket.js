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
        //触发客户端事件c_hi
        // socket.emit("c_hi", "hello too!");
    });

    const { id } = socket;
    console.log(id);
    socket.emit(id, "hello too!");

    // 校验登录
    socket.on("verify_login", async function (data) {
        console.log(data.userToken);
        let userData = {
            token: data.userToken,
        };
        let overData = await mongoose.model("userCenter").find(userData);
        console.log(overData);
        if (overData.length > 0 && overData[0].status === 1) {
            await mongoose
                .model("userCenter")
                .updateOne(userData, { socketId: id });
            socket.emit(id, "校验登录成功");
        } else {
            await mongoose
                .model("userCenter")
                .updateOne(userData, { socketId: "" });
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
        // 查询当前被请求人留言信息
        let queryResult = await mongoose.model("message").find(userData);
        // 查询请求人信息
        let queryReqInfo = await mongoose
            .model("userCenter")
            .find({ token: data.myToken });
        let friendsReq = {
            reqTime: new Date(), // 请求时间
            reqPeople: queryReqInfo[0], // 请求人
            reqMsg: "加个好友吧！", // 请求留言
            type: "", // 线上还是线下
            isBrowse: false, // 是否阅读
        };
        if (overData.length > 0 && overData[0].status === 1) {
            console.log("在线");
            dataRest("online");
        } else {
            console.log("不在线");
            dataRest("oofline");
        }
        socket.emit("tips_msg", "好友请求已发送!");
        async function dataRest(type) {
            friendsReq.type = type;
            if(type === "online") {
                let otherPartySocketId = overData[0].socketId
                socket.to(otherPartySocketId).emit('friends_add_req', friendsReq);
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

    // //断开事件
    // socket.on("disconnect", function (data) {
    //     console.log("断开", data);
    //     // socket.emit("c_leave", "离开");
    //     //socket.broadcast用于向整个网络广播(除自己之外)
    //     //socket.broadcast.emit('c_leave','某某人离开了')
    // });
});

// var WebSocket = require("ws");
// const wss = new WebSocket.Server({ port: 1000 });
// wss.on("connection", function connection(ws) {
//     ws.on("message", function incoming(data) {
//         const params = JSON.parse(data)
//         switch(params.type){
//             case 1:
//             console.log('验证登录')
//             loginCheck(params)
//             break
//             case 2:
//             console.log('添加好友')
//             break
//             default:
//         }

//         async function loginCheck(params){
//             if(params.token){
//                 let userData = {
//                     token: params.token
//                 }
//                 let overData = await mongoose.model("userCenter").find(userData);
//                 if(overData.length > 0 && overData[0].status === 1){
//                     ws.send('链接成功');
//                 }else{
//                     ws.send('链接失败');
//                 }
//             }else{
//                 ws.send('缺少用户token');
//             }
//         }
//         /**
//          * 把消息发送到所有的客户端
//          * wss.clients获取所有链接的客户端
//         */
//         // wss.clients.forEach(function each(client) {
//         //     client.send(data);
//         // });
//     });
// });
