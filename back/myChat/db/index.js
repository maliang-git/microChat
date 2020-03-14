var MongoClient = require('mongoose');
require('../dao/model/userCenter');//用户信息

var dbURI = "mongodb://127.0.0.1:27017/codeNice";

MongoClient.connect(dbURI, { useUnifiedTopology:true }, function (err) {
    if (err) {
      console.log('Connection Error:' + err)
    } else {
      console.log('数据库mongodb已成功开启' + dbURI);
    }
});