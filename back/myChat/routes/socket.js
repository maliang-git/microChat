/* WebSocket */
const mongoose = require("mongoose");
var WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 1000 });
wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(data) {
        const params = JSON.parse(data)
        switch(params.type){
            case 1:
            console.log('验证登录')
            loginCheck(params)
            break
            case 2:
            console.log('添加好友')
            break
            default:
        }

        async function loginCheck(params){
            if(params.token){
                let userData = {
                    token: params.token
                }
                let overData = await mongoose.model("userCenter").find(userData);
                if(overData.length > 0 && overData[0].status === 1){
                    ws.send('链接成功');
                }else{
                    ws.send('链接失败');
                }
            }else{
                ws.send('缺少用户token');
            }
        }
        /**
         * 把消息发送到所有的客户端
         * wss.clients获取所有链接的客户端
        */
        // wss.clients.forEach(function each(client) {
        //     client.send(data);
        // });
    });
});
