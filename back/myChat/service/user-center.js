/** 
 * 服务层 
 * */ 
const { daoRegister } = require("../dao/user-center");

/**
 * 注册账号
 */
module.exports.serviceRegister = async function(data) {
    const { loginName, phone, passWord } = data;
    if (loginName && phone && passWord) {
        if(loginName.length > 10){
            return { code: 413, msg: "昵称超过限制长度", data: null };
        }
        if (!/^(1)[2,3,4,5,6,7,8,9][0-9]{9}$/.test(phone)) {
            return { code: 413, msg: "手机号有误", data: null };
        }
        if (passWord.length <5 || passWord.length > 20) {
            return { code: 413, msg: "密码不能少于5位,且不能超过20位", data: null };
        }
        return await daoRegister(data);
    }
    if (!loginName) {
        return { code: 413, msg: "缺少昵称", data: null };
    }
    if (!phone) {
        return { code: 413, msg: "缺少电话号码", data: null };
    }
    if (!passWord) {
        return { code: 413, msg: "缺少密码", data: null };
    }
};
