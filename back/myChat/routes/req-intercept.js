/**
 * 请求拦截中间件
 * */
var session = require("express-session");
module.exports.interceptConfig = function (req, res, next) {
    /** 配置跨域 */
    res.header("Access-Control-Allow-Origin", req.headers.origin); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
    res.header("Access-Control-Allow-Headers", "Content-Type,request-origin,user-token"); // 设置请求头中允许携带的参数
    res.header("Access-Control-Allow-Credentials", "true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
    res.header("Access-control-max-age", 1000); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数

    /** 每次请求更新session有效时间 */
    req.session._garbage = Date();
    req.session.touch();

    /** 请求拦截 */
    if (req.get("request-origin") && req.get("request-origin") === "WAP") {
        if (req.originalUrl != "/user-center/login" && !req.get("user-token")) {
            res.send({
                code: 5223,
                msg: "用户未登录",
                data: null,
            });
            return;
        }
        next();
    } else {
        res.send({
            code: 414,
            msg: "缺少请求来源request-origin",
            data: null,
        });
    }
};
