// 持久层
const mongoose = require('mongoose');
//.create()插入  .remove()删除  .update()修改替换  .find()查询    

module.exports.LastingLogon = async function (data) {
    var queryCriteria;
    if(data.type=='login'){
        queryCriteria =  {
            accountNumber:data.accountNumber,
            name:data.name,
            password:data.password
        }    
    }else{
        queryCriteria =  {
            accountNumber:data.accountNumber,
        }    
    }
    var overData = await mongoose.model("userInfo").find(queryCriteria);
    if(data.type=='login'){
        if(overData.length!=1){
            return {code:1,text:"账号或密码错误"};
        }
        return  {code:200,text:"登录成功",data:overData};
    }else{
        if(overData.length!=1){
            // return {code:1,text:"账号或密码错误"};
            var overData = await mongoose.model("userInfo").create({
                accountNumber:queryCriteria.accountNumber,
                name:data.name,
                password:data.password,
                content:{},
            });
            return  {code:200,text:overData._id?"注册成功":"注册失败",data:data};
        }
        return  {code:1,text:"该账号已存在，注册失败！"};
    }

}