/* WebSocket */
var WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 1000 });
wss.on("connection", function connection(ws) {
    console.log("链接成功！");
    ws.on("message", function incoming(data) {
        /**
         * 把消息发送到所有的客户端
         * wss.clients获取所有链接的客户端
         */
        console.log(data);
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    });
});
