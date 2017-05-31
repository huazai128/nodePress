/**
 * 
 * 七牛控制器
 * 
 */

const qiniu = require("qn");
const config = require("config/config");
const client = qiniu.create(config.QINIU);
const { handleRequest } = require("utils/handle");
const qiniuCtrl = {};

qiniuCtrl.GET = (req,res) => {
    res.jsonp({uptoken:client.uploadToken()})
}

module.exports = (req,res) => { handleRequest({ req, res, controller: qiniuCtrl })}