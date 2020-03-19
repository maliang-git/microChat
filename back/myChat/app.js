var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

/** 用户中心 */
var usersCenter = require("./routes/user-center");

var app = express();


require("./db/index"); //引入mongodb数据库配置
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "sessionId", // 对session id 相关的cookie 进行签名
        resave: false,
        saveUninitialized: true, // 是否保存未初始化的会话
        cookie: {
            maxAge: 1000 * 60 * 5 // 设置session的有效时间，单位毫秒
        }
    })
);

// 配置跨域请求中间件(服务端允许跨域请求)
var allowCors = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
    res.header("Access-Control-Allow-Headers", "Content-Type,request-origin"); // 设置请求头中允许携带的参数
    res.header("Access-Control-Allow-Credentials", "true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
    res.header("Access-control-max-age", 1000); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数
    next();
};
app.use(allowCors); // 使用跨域中间件

app.all("*", function(req, res, next) {
    req.session._garbage = Date(); /** 每次请求更新session有效时间 */
    req.session.touch();
    /** 请求拦截 */
    if (req.get("request-origin") && req.get("request-origin") === "WAP") {
        if (req.originalUrl == "/user-center/register") {
            next();
            return;
        }
        if (req.originalUrl != "/user-center/login" && !req.session.sessionId) {
            res.send({
                code: 5223,
                msg: "用户未登录",
                data: null
            });
            return;
        }
        next();
    } else {
        res.send({
            code: 414,
            msg: "缺少请求来源request-origin",
            data: null
        });
    }
});

/** 用户中心 */
app.use("/user-center", usersCenter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
