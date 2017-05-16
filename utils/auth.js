/**
 * auth验证方法
 */
const config = require("config/config");
const jwt = require("jsonwebtoken");//https://lybenson.com/2017/04/30/node-jsonwebtoken%E7%9A%84%E4%BD%BF%E7%94%A8/


// 验证Auth
const authToken = req => {
    console.log(req.headers)
    if(!req.headers && req.headers.authorization){
        const parts = req.headers.authorization.split(" ");
        if(Object.is(parts.length,2) && Object.is(parts[0],"Bearer")){
            return parts[1];
        }
    }
    return false;
}

//验证权限
const authIsVerified = req => {
    const token = authToken(req);
    if(token){
        try{
            const decodedToken = jwt.verify(token,config.AUTH.jwtTokenSecret);//返回解码后payload信息
            //验证token是否过期
            if(decodedToken.exp > Math.floor(Data.now() / 1000)){
                return true;
            }
        }catch(err){}
    }
    return false;
}

module.exports = authIsVerified;