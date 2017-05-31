const Tag = require("modules/tag");
const Article = require("modules/article");
const buildSiteMap = require("utils/sitemap"); //sitemap：可方便网站管理员通知搜索引擎他们网站上有哪些可供抓取的网页
const { handleRequest,handleError,handleSuccess } = require("utils/handle");// 用于处理请求方法和请求状态
const { baiduSeoPush,baiduSeoUpdate } = require("utils/baidu-seo-push"); //百度seo
const config = require("config/config");
const tagCtrls = {list:{},item:{}};

//获取所有的标签
tagCtrls.list.GET = (req,res) => {

}
//添加标签
tagCtrls.list.POST = ({ body:tag,body: { slug }},res) => {

}


exports.list = (req,res) => { handleRequest({req,res,controller:tagCtrls.list}) };
exports.item = (req,res) => { handleRequest({req,res,controller:tagCtrls.item}) };
