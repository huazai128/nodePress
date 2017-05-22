const http = require("http");
const gc = require("idle-gc");      //用于node.js空闲时，运行垃圾回收机制；
const helmet = require("helmet");   //用于保护node应用的安全；
const express = require("express");
const bodyParser = require("body-parser");
const mongoosePaginate = require("mongoose-paginate"); //分页
require("app-module-path").addPath(__dirname + "/"); //模块路径  模块引用路径

const config = require("config/config");
const mongodb = require("config/mongodb");
const routes = require("routes/index")
const app = express();

//连接数据库
mongodb.connect();

//翻页全局配置
mongoosePaginate.paginate.options = {
    limit:config.APP.LIMIT  // 设置限制查询数据
}

app.set("port",config.APP.PORT);  //设置端口
app.use(helmet()); 
app.use(bodyParser.json({limit:"1mb"})); //限制传输数据大小
app.use(bodyParser.urlencoded({extended:true}));

routes(app);

http.createServer(app).listen(app.get("port"),() => {
    gc.start();//开启垃圾回收机制
    console.log(`NodePress Run! port as ${app.get('port')}`);
})