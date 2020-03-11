var accountNumber,userPassWord,userName;
function formData(type) {
    var data = {
        accountNumber: accountNumber,
        password: userPassWord,
        name: userName,
        type: type
    };
    return data;
}

function ajax(data) {
    console.log(data)
    $.ajax({
        url: "/validateLogon/validateLogon",
        type: "post",
        data:data,
        success: res => {
            if(data.type === 'login'){
                if(res.code === 200){
                    alert("主页");
                    return false
                }
            }
            if(data.type === 'reg'){
                if(res.code === 200){
                    window.location.href="./index.html"
                    return false
                }
            }
            alert(res.text)
        },
        fail: res => {
            console.log(res);
        },
        error: function (res) {
            console.log(res);
        }
    });
}