/**
 * 持久层
 */
//.create()插入  .remove()删除  .update()修改替换  .find()查询
const mongoose = require("mongoose");

/**
 * 引入加密插件
 * */
const { Decrypt, Encrypt } = require("../plugs/secret.js");

module.exports.daoRegister = async function (data) {
    /**
     * 注册账号
     */
    const queryCriteria = {
        phone: data.phone,
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
            userName: "", // 真实姓名
            headImg: "", // 头像
            city: "", // 城市
            cityCode: "", // 城市编码
            content: {}, // 扩展字段
        });
        return {
            code: 200,
            msg: "注册成功",
            data: "注册成功",
        };
    }
    return { code: 414, msg: "该手机号已注册！", data: null };
};

module.exports.daoLogin = async function (req) {
    /**
     * 用户登录
     */
    var data = req.body;
    const queryCriteria = {
        phone: data.phone,
    };
    var overData = await mongoose.model("userCenter").find(queryCriteria);
    if (overData.length != 1) {
        return {
            code: 414,
            msg: "该用户不存在",
            data: "该用户不存在",
        };
    } else {
        if (overData[0].passWord === data.passWord) {
            const sessionId = await Encrypt(new Date().getTime()); // 用当前时间戳生成sessionId并加密，用于验证用户每次操作是否登录过期
            req.session.sessionId = sessionId; // 登录成功，缓存session
            console.log(req.session);
            let data = {
                sessionId,
                ...overData[0]._doc,
            };
            return {
                code: 200,
                msg: "登录成功",
                data,
            };
        } else {
            return {
                code: 414,
                msg: "密码错误",
                data: "密码错误",
            };
        }
    }
};

module.exports.daoSearchUser = async function (req) {
    /**
     * 搜索用户
     */
    var data = req.query;
    let queryCriteria;
    /* 手机号查询 */
    queryCriteria = {
        phone: data.keyData,
    };
    let overData = [];
    overData = await mongoose.model("userCenter").find(queryCriteria);
    /* 用户名查询 */
    queryCriteria = {
        loginName: data.keyData,
    };
    overData.concat(
        overData,
        await mongoose.model("userCenter").find(queryCriteria)
    );
    return {
        code: 200,
        msg: "操作成功",
        data: overData,
    };
};

module.exports.daoSetUserRemarks = async function (req) {
    /**
     * 设置用户备注名和标签
     */

    let data = req.query;
    let queryCriteria = {
        token: req.get("user-token"),
        remarksName: {},
        labelName: {},
    };
    if (data.remarksName) {
        queryCriteria.remarksName[data.userToken] = data.remarksName;
    }
    if (data.labelName) {
        queryCriteria.labelName[data.userToken] = data.labelName;
    }
    
    console.log(queryCriteria);

    // queryCriteria = {
    //     phone: data.keyData,
    // };

    // let overData = [];
    // overData = await mongoose.model("userCenter").find(queryCriteria);
    // /* 用户名查询 */
    // queryCriteria = {
    //     loginName: data.keyData,
    // };
    // overData.concat(
    //     overData,
    //     await mongoose.model("userCenter").find(queryCriteria)
    // );
    // return {
    //     code: 200,
    //     msg: "操作成功",
    //     data: overData,
    // };
};
