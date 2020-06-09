var MongoClient = require("mongoose");
require("../dao/model/userCenter"); //用户信息
require("../dao/model/userRemarks"); //用户备注与标签
require("../dao/model/message"); //用户socket消息

var dbURI = "mongodb://127.0.0.1:27017/codeNice";

MongoClient.connect(
    dbURI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function(err) {
        if (err) {
            console.log("Connection Error:" + err);
        } else {
            console.log("数据库mongodb已成功开启" + dbURI);
        }
    }
);
