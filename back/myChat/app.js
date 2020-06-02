var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

/* WebSocket */
require("./routes/socket")

/** 引入请求拦截中间件 */
var { interceptConfig } = require("./routes/req-intercept");

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

// 配置session
app.use(
    session({
        secret: "sessionId", // 对session id 相关的cookie 进行签名
        resave: false, // 强制保存，如果session没有被修改也要重新保存
        saveUninitialized: true, // 如果原先没有session那么就设置，否则不设置
        cookie: {
            maxAge: 1000 * 60 * 5, // 设置session的有效时间，单位毫秒
        },
    })
);

/** 请求拦截 */
app.all("*", interceptConfig);

/** 用户中心 */
app.use("/user-center", usersCenter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
