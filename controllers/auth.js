const Auth = require("modules/auth"); 
const config = require("config/config");
const crypto = require("crypto");
const { handleRequest,handleError,handleSuccess } = require("utils/handle");
const jwt = require('jsonwebtoken');
const authCtrl = {};

const sha256 = (pwd) => {
    return crypto.createHmac("sha256",pwd).update(config.AUTH.defaultPassword).digest("hex")
};

// 获取个人信息
authCtrl.GET = (req,res) => {
    console.log("====auth");
    Auth.find({},"-_id name slogan gravatar")
    .then(([result = {}]) => {
        handleSuccess({res,message:"获取用户信息成功",result});
    })
    .catch((err) => {
        console.log(err);
        handleError({res,message:"获取用户信息失败"},err);
    });
};

// 登陆
authCtrl.POST = ({body:{username,password}},res) => {
    console.log(username,password);
    Auth.find({},"-_id password")
    .then(([user = {password: sha256(config.AUTH.defaultPassword)}]) => {
        console.log(user.password)
        if(Object.is(sha256(password),user.password)){
            const token = jwt.sign({ // 
                data:config.AUTH.data,
                exp:Math.floor(Date.now() / 1000) + (60 * 60 ), // 设置过期时间
            },config.AUTH.jwtTokenSecret);
            handleSuccess({res,message:"登陆成功",result:{token}})
        }
    })
    .catch((err) => {
        console.log(err);
        handleError({res,message:"登陆失败",err})
    })
};

// 编辑auth
authCtrl.PUT = ({body:auth},res) => {
    
}

module.exports = (req, res) => { handleRequest({ req, res, controller: authCtrl })};
