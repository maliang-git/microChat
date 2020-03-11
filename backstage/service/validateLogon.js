// 服务层
const {LastingLogon} = require('../dao/validateLogon');//引入持久层的方法

module.exports.serviceLogon = async function (data) {
    var {accountNumber,password,name} = data;
    if(accountNumber && password && name && accountNumber !='' && password !='' && name !=''){
        return await LastingLogon(data);
    }else{
        return {code:-1,text:"账号或者密码有误"};
    }
//    return await LastingLogon(data);
}