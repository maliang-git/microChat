const mongoose = require('mongoose');//引入mongodb

// 定义数据结构
const userInfo = new mongoose.Schema({
    accountNumber:String,
    name:String,
    password:String,
    content:Object,
});

mongoose.model('userInfo',userInfo,'userInfo');//第一个userInfo为数据库的名称，第二个为上方变量