/**
 * 文章 控制器
 */

//请求方法和处理相应状态函数
const { handleRequest,handleError,handleSuccess } = require("utils/handle");
//百度Push 设置
const { baiduSeoPush, baiduSeoUpdate, baiduSeoDelete } = require("utils/baidu-seo-push");

const Category = require("modules/category");
const Article = require("moduels/artilce");
const Tag = require("modules/tag");
const authIsVerified = require("utils/auth"); //验证用户登陆
const config = require("config/config");
const buildSiteMap = require("utils/sitemap"); //sitemap.js设置

const artilceCtrl = {list:{},item:{}};

artilceCtrl.list.GET = (req,res) => {
    //对象解构赋值
    let { page, pre_page, state, public, keyword, category, category_slug, tag, tag_slug, date, hot } = req.query;
    //过滤条件
    let options = {
        sort:{"_id":-1},  //根据id进行降序
        page: Number.parseInt(page || 1), //当前查询页面页1
        limit: Number.parseInt(pre_page || 10), //限制查询
        populate:['category','tag'], //
        select: '-password -content' //强制显示 +：显示 -:不显示
    }
    //查询参数  
    let query = {};

    //按照state查询
    if(['0','1','-1'].includes(state)){
        query.state = state ;//  如果不存在就全部查询
    }

    //按照public查询
    if(['0','1','-1'].includes(public)){
        query.public = public;
    }

    //关键字查询
    if(keyword){
        const keywordReg = new RegExp(keyword);
        query['$or'] = [ //$or:逻辑判断 ，只要满足其中一个或多个查询条件
            { 'title':keywordReg },
            { 'content':keywordReg },
            { 'description':keywordReg }
        ]
    }

    //根据标签id查询
    if(tag){
        query.tag = tag;
    }

    //根据分类查询
    if(category){
        query.category = category;
    }

    //热评查询s
    if(!!hot){
        query.sort = {
            'mate.comments': -1,
            'mate.links': -1
        }
    }

    //时间查询
    if(date){
        const getDate = new Date(date); 
        console.log(getDate);
        if(!Object.is(getDate.toString(),"Invalid Date")){
            query.create_at = {
                '$gte':new Date((getDate / 1000 - 60 * 60 * 8) * 1000),//查询大于等于
                "$lt":new Date((getDate / 1000 + 60 * 60 * 16) * 1000)
            }
        }
    }

    // 如果是前台请求，则重置公开状态和发布状态
    if (!authIsVerified(req)) {
        querys.state = 1;
        querys.public = 1;
    };
}

artilceCtrl.list.POST = ({body:artilce},res) => {
    
}