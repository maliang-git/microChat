/**
 * 用户中心
 *  */
var express = require("express");
var router = express.Router();
const { serviceRegister, serviceLogin } = require("../service/user-center"); //引入服务层的方法

/**
 * 用户注册
 * */
router.post("/register", async function(req, res, next) {
    res.send(await serviceRegister(req.body));
});

/**
 * 用户登录
 * */
router.post("/login", async function(req, res, next) {
    res.send(await serviceLogin(req));
});

router.post("/test", async function(req, res, next) {
    res.send("token" + req.session.sessionId);
});

module.exports = router;
