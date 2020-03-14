/**
 * 用户中心
 * 注册、登录
 *  */
var express = require("express");
var router = express.Router();
const { serviceRegister } = require("../service/user-center"); //引入服务层的方法

/**
 * 用户注册
 * loginName 用户昵称
 * phone 手机号
 * passWord 密码
 * userName 真实姓名
 * */
router.post("/register", async function(req, res, next) {
    res.send(await serviceRegister(req.body));
});

module.exports = router;
