//  数据库模块
const mongoose = require("mongoose");
const config = require("config/config");
mongoose.Promise = require("bluebird");

exports.mongoose = mongoose;

//数据库连接
exports.connect = () => {
    //连接数据库
    mongoose.connect(config.MONGODB.uri);
    
    //连接出错
    mongoose.connection.on("error",(err) => {
        console.log("数据库连接失败!",err)
    })

    //连接成功
    mongoose.connection.once("open",() => {
        console.log("连接成功!")
    })

    return mongoose;
}