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

const articleCtrl = { list:{}, item:{} };

// 新增文章
articleCtrl.list.POST = ({ body: article },res) => {
    console.log(article);
    if(!article.title || !article.content){
        handleError({res,message:"文本框未填写完整"});
        return false;
    }
    new Article(article).save()
    .then((result = article) => {
        handleSuccess({res,result,message:"发表文章成功"});
    })
    .catch((err) => {
        handleError({res,err,message:"发表文章失败"});
    })
}

// 获取所有的文章
articleCtrl.list.GET = ( req,res) => {
    // 查询参数
    let { keyword,state,category,public,tag,pre_page,page,date,category_slug,tag_slug,hot } = req.query;
    console.log(req.query);
    const arr = ['0','1','-1']

    // 过滤条件
    let options = {
        sort:{ _id: -1 }, // 根据ID降序
        limit: Number(pre_page || 10), // 限制查询题哦数
        page:Number(page || 1), //当前页码
        select:"-password -content" //强制不显示字段
    }
    let query = {};

    // 判断keyword 
    if(keyword){
        const ketwordReg = new RegExp(keyword);
        query = { 
            "$or":[ //$or: 
                {'title':ketwordReg},
                {'content':ketwordReg},
                {'description':ketwordReg}
            ]
        }
    }

    // 按照state查询
    if(arr.includes(state)){
        query.state = state;
    }

    // 按照公开程度
    if(arr.includes(public)){
        query.public = public;
    }

    // 根据tag查询
    if(tag){
        query.tag = tag;
    }
    // 根据分类查询
    if(category){
        query.category = category;
    }

    // 热评查询
    if(!!hot){
        // 根据评论和查看条数查询
        options.sort = {
            'meta.comments': -1,
            'meta.lickes':-1
        }
    }

    // 根据时间查询
    if(date){
        const getDate = new Date(date); //getDate 获取
        if(!Object.is(getDate.toString(),"Invalid Date")){
            querys.create_at = { // 根据日期查询
                "$gte": new Date((getDate / 1000 - 60 * 60 * 8) * 1000),
                "$lt": new Date((getDate / 1000 + 60 * 60 * 16) * 1000)
            };
        }
    }

    //查询文章
    const getArticles = () => {
        // 分页插叙
        Article.paginate(query,options)
        .then(articles => {
            //console.log(articles);
            handleSuccess({
                res,
                message:"文章列表获取成功",
                result:{
                    data: articles.docs,
                    pagination:{
                        total:articles.total, // 文章总数
                        current_page: articles.page, //  当前页面
                        total_page: articles.pages, // 总分页
                        pre_page: articles.limit //  限制查询条数
                    }
                }
            })
        })
        .catch((err)=> {
            handleError({res,message:"文章查询失败",err})
        })
    }

    // 根据category别名查询 
    if(category_slug){
        Category.find({slug:category_slug})
        .then(([category] = []) => {
            if(category){
                query.category = category._id;
                getArticles();
            }else{
                handleError({ res,message:"分类不存在" })
            }
        })
        .catch((err) =>{
            handleError({res,message:"分类查询错误",err})
        })
    }

    // 根据tags 别名查询
    if(tag_slug){
        Tag.find({slug:tag_slug})
        .then(([tag] = []) => {
            if(tag){
                query.tag = tag._id;
                getArticles();
            }else{
                handleError({res,message:"标签不存在"})
            }
        })
        .catch((err) => {
            handleError({res,message:"查询标签出错",err})
        })
    }
    // 查询
    getArticles();
}

// export
exports.list = (req, res) => { handleRequest({ req, res, controller: articleCtrl.list })};
exports.item = (req, res) => { handleRequest({ req, res, controller: articleCtrl.item })};
