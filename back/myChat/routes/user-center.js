/**
 * 用户中心
 *  */
var express = require("express");
let formidable = require("formidable");
const formatTime = require("silly-datetime");
const fs = require("fs");
const mongoose = require("mongoose");

var router = express.Router();
const {
    serviceRegister,
    serviceLogin,
    serviceSearchUser,
    serviceSetUserRemarks,
    serviceLoginStateModify,
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

/**
 * 修改用户登录状态
 * */
router.post("/loginStateModify", async function (req, res, next) {
    res.send(await serviceLoginStateModify(req));
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

// 上传图片
router.post("/upload", async function (req, res, next) {
    let AVATAR_UPLOAD_FOLDER = "/avatar";
    //创建上传表单
    var form = new formidable.IncomingForm();
    //设置编码格式
    form.encoding = "utf-8";
    //设置上传目录
    form.uploadDir = "./public" + AVATAR_UPLOAD_FOLDER;
    //保留后缀
    form.keepExtensions = true;
    //文件大小
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.parse(req, function (err, fields, files) {
        let filesFile = files.file;
        if (err) {
            return res.json({
                code: 500,
                msg: "内部服务器错误",
                data: "",
            });
        }
        // 限制文件大小 单位默认字节 这里限制大小为2m
        if (filesFile.size > form.maxFieldsSize) {
            fs.unlink(filesFile.path);
            return res.json({
                code: 414,
                msg: "图片大小不能超过2M",
                data: "",
            });
        }
        console.log(form.headers._id);
        //后缀名
        var extName = "";
        switch (filesFile.type) {
            case "image/pjpeg":
                extName = "jpg";
                break;
            case "image/jpeg":
                extName = "jpg";
                break;
            case "image/png":
                extName = "png";
                break;
            case "image/x-png":
                extName = "png";
                break;
            case "image/gif":
                extName = "gif";
                break;
        }
        if (!extName) {
            return res.json({
                code: 414,
                msg: "不支持上传该图片格式",
                result: "",
            });
        }
        //使用第三方模块silly-datetime
        var t = formatTime.format(new Date(), "YYYYMMDDHHmmss");
        //生成随机数
        var ran = parseInt(Math.random() * 8999 + 10000);
        // 生成新图片名称
        var avatarName = t + "_" + ran + "." + extName;
        // 新图片路径
        var newPath = form.uploadDir + "/" + avatarName;
        // 更改名字和路径
        fs.rename(filesFile.path, newPath, async function (err) {
            if (err) {
                return res.json({
                    code: 414,
                    message: "图片上传失败",
                });
            } else {
                let img =
                    "http://172.16.75.192:3002" +
                    AVATAR_UPLOAD_FOLDER +
                    "/" +
                    avatarName;
                let userInfo = await mongoose
                    .model("userCenter")
                    .findByIdAndUpdate(
                        form.headers._id,
                        { headImg: img },
                        { new: true }
                    );
                return res.json({
                    code: 200,
                    msg: "上传成功",
                    data: userInfo,
                });
            }
        });
    });
});

module.exports = router;
