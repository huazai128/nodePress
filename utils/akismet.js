const config = require("config/config");
const akismet = require("akismet-api"); // 垃圾留言过滤系统
let client = akismet.client({  // 配置
    key:config.AKISMET.key, // key
    blog: config.AKISMET.blog // blog  链接
});

let clientIsValid = flase;

//  验证key
client.verifyKey((err,valid) => {
    if(err) return console.warn('Akismet VerifyKey Error:', err.message);
    clientIsValid = valid;
    console.log(`Akismet key ${ valid ? '有效' : '无效' }!`);
});

const akismetClient = {
    checkSpam(options){
        console.log("Akismet验证评论中...",new Data());
        return new Promise((resolve,solve) => {

        })
    }
}