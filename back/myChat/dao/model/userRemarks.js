const mongoose = require("mongoose"); //引入mongodb
const userRemarks = new mongoose.Schema({
    token: String, // 用户Token
    remarksName: Object, // 用户备注名
    labelName:Object // 用户标签
});

mongoose.model("userRemarks", userRemarks, "userRemarks"); //第一个userInfo为数据库的名称，第二个为上方变量