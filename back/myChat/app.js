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
        resave: true,
        saveUninitialized: false, // 是否保存未初始化的会话
        cookie: {
            maxAge: 1000 * 60 * 1 // 设置 session 的有效时间，单位毫秒
        }
    })
);

app.all("*", function(req, res, next) {
    /** 请求拦截 */
    if (req.get("request-origin") && req.get("request-origin") === "WAP") {
        if (req.originalUrl == "/user-center/register") {
            next();
            return
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
