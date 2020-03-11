var mongoose = require('mongoose');
//引入mongodb

require('./model/userInfo');//用户信息

var dbURI = "mongodb://localhost:27017/myData";

mongoose.connect(dbURI, { useNewUrlParser: true }, function (err) {
  if (err) {
    console.log('Connection Error:' + err)
  } else {
    console.log('数据库mongodb已成功开启' + dbURI);
  }
});

