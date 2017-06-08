/**
 * 文章 控制器
 */

//请求方法和处理相应状态函数
const { handleRequest,handleError,handleSuccess } = require("utils/handle");
//百度Push 设置
const { baiduSeoPush, baiduSeoUpdate, baiduSeoDelete } = require("utils/baidu-seo-push");

const Category = require("modules/category");
const Article = require("modules/article");
const Tag = require("modules/tag");
const authIsVerified = require("utils/auth"); //验证用户登陆
const config = require("config/config");
const buildSiteMap = require("utils/sitemap"); //sitemap.js设置

const artilceCtrl = {list:{},item:{}};

artilceCtrl.list.POST = ({body:artilce},res) => {
    console.log(artilce);
    if(!article.title || !artilce.content){
        handleError({res,message:""})
    }
}

exports.list = (req,res) => handleRequest({req,res,controller:artilceCtrl.list});
exports.item = (req,res) => handleRequest({req,res,controller:artilceCtrl.item});