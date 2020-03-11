// 表现层
var express = require('express'); // 引入express
var router = express.Router();    // 引入路由
const {serviceLogon} = require('../service/validateLogon');//引入服务层的方法
const {Decrypt,Encrypt} = require("../public/javascripts/secret.js")

// 表现层登录验证接口
router.post("/validateLogon",async function(req,res,next) {  //req接受的数据；res返回的数据；next出错后执行的回调
    //post请求的数据在body里
    res.send(await serviceLogon(req.body))
    console.log(req.body)
});

// 表现层性能检测接口
router.post("/test",async function(req,res,next) {  //req接受的数据；res返回的数据；next出错后执行的回调
    console.log(req.body)
});

module.exports = router;

