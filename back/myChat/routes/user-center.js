/**
 * 用户中心
 *  */
var express = require("express");
var router = express.Router();
const {
    serviceRegister,
    serviceLogin,
    serviceSearchUser,
    serviceSetUserRemarks
} = require("../service/user-center"); //引入服务层的方法

/**
 * 用户注册
 * */
router.post("/register", async function (req, res, next) {
    res.send(await serviceRegister(req.body));
});

/**
 * 用户登录
 * */
router.post("/login", async function (req, res, next) {
    res.send(await serviceLogin(req));
});

router.post("/test", async function (req, res, next) {
    res.send("token" + req.session.sessionId);
});

// 搜索用户
router.get("/searchUser", async function (req, res, next) {
    res.send(await serviceSearchUser(req));
});

// 设置用户备注名和标签
router.get("/setUserRemarks", async function (req, res, next) {
    res.send(await serviceSetUserRemarks(req));
});

module.exports = router;
