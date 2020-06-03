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

            let loginUser = {
                token: overData[0].token,
                status: 1, // 登录状态（1：在线 2：下线 ）
            }
            await mongoose.model("userCenter").update(loginUser);

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


module.exports.daoLoginStateModify = async function (req) {
    /**
     * 修改用户登录状态
     */
    var data = req.body;
    const queryCriteria = {
        token: data.userToken,
    };
    var overData = await mongoose.model("userCenter").find(queryCriteria);
    if(overData.length === 1){
        const userLoginInfo = {
            token: data.userToken,
            status: data.status,
        }
        await mongoose.model("userCenter").update(userLoginInfo);
        return {
            code: 200,
            msg: "操作成功",
            data: {},
        };
    }else{
        return {
            code: 200,
            msg: "未查询到当前用户",
            data: {},
        };
    }
};

module.exports.daoSearchUser = async function (req) {
    /**
     * 搜索用户
     */
    var data = req.query;
    let queryCriteria;
    let userArr = [];
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

    if (overData.length > 0) {
        userArr = [
            {
                token: overData[0].token,
                loginName: overData[0].loginName,
                phone: overData[0].phone,
                passWord: overData[0].passWord,
                userName: overData[0].userName,
                headImg: overData[0].headImg,
                city: overData[0].city,
                cityCode: overData[0].cityCode,
            },
        ];
    }
    /* 查询备注名与标签 */
    if (userArr.length > 0) {
        let userToken = overData[0].token;
        let token = req.get("user-token");
        let remarksAndLabel = await mongoose
            .model("userRemarks")
            .find({ token });
        console.log("userToken", userToken);
        console.log(remarksAndLabel);
        if (remarksAndLabel.length > 0) {
            userArr[0].remarksName = remarksAndLabel[0].remarksName[userToken]
                ? remarksAndLabel[0].remarksName[userToken]
                : "";
            userArr[0].labelName = remarksAndLabel[0].labelName[userToken]
                ? remarksAndLabel[0].labelName[userToken]
                : "";
        } else {
            userArr[0].remarksName = "";
            userArr[0].labelName = "";
        }
    }
    return {
        code: 200,
        msg: "操作成功",
        data: userArr,
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
    if (data.remarksName || data.remarksName == "") {
        queryCriteria.remarksName[data.userToken] = data.remarksName;
    }
    if (data.labelName || data.labelName == "") {
        queryCriteria.labelName[data.userToken] = data.labelName;
    }
    console.log(queryCriteria);

    let overData = await mongoose
        .model("userRemarks")
        .find({ token: req.get("user-token") });
    if (overData.length < 1) {
        await mongoose.model("userRemarks").create(queryCriteria);
    } else {
        if (queryCriteria.remarksName) {
            overData[0].remarksName = Object.assign(
                {},
                overData[0].remarksName,
                queryCriteria.remarksName
            );
        }
        if (queryCriteria.labelName) {
            queryCriteria.labelName = Object.assign(
                {},
                overData[0].labelName,
                queryCriteria.labelName
            );
        }
        console.log(queryCriteria);
        await mongoose.model("userRemarks").update(queryCriteria);
    }
    return {
        code: 200,
        msg: "设置成功",
        data: {},
    };
};
