const mongoose = require('config/mongodb').mongoose;
const crypto = require("crypto"); // 密码加密;
const config =  require("config/config");

const authSchema = new mongoose.Schema({
    // 用户名
    name:{type:String,default: '' },

    // 个性签名 
    slogan:{type:String,default:""},

    // 头像
    gravatar:{type:String,default:"" },

    // 密码
    password:{type:String,require:true}
});

authSchema.pre("save",(next) => {
    this.password = crypto.createHmac("sha256",this.password).update(config.AUTH.defaultPassword).digest("hex");
    next();
});

const Auth = mongoose.model("Auth",authSchema);

module.exports = Auth;

