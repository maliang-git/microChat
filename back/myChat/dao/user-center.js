/**
 * 持久层
 */
//.create()插入  .remove()删除  .update()修改替换  .find()查询
const mongoose = require("mongoose");

/**
 * 引入加密插件
 * */
const { Decrypt, Encrypt } = require("../plugs/secret.js");

module.exports.daoRegister = async function(data) {
    const queryCriteria = {
        loginName: data.loginName
    };
    var overData = await mongoose.model("userCenter").find(queryCriteria);
    if (overData.length != 1) {
        // #生成唯一Token(当前时间戳+手机号)
        const token = new Date().getTime() + Encrypt(data.phone);
        await mongoose.model("userCenter").create({
            token, // 用户Token
            loginName: data.loginName, // 用户昵称（*必传）
            phone: data.phone, // 手机号（*必传）
            passWord: data.passWord, // 密码（*必传）
            userName: data.userName, // 真实姓名
            content: {} // 扩展字段
        });
        return {
            code: 200,
            msg: "注册成功",
            data: "注册成功"
        };
    }
    return { code: 414, msg: "该账号已被占用！", data: null };
};
