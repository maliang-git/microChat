/**
 * 用户中心
 *  */
var express = require("express");
var router = express.Router();
const { serviceRegister } = require("../service/user-center"); //引入服务层的方法

/**
 * 用户注册
 * */
router.post("/register", async function(req, res, next) {
    res.send(await serviceRegister(req.body));
});

module.exports = router;
