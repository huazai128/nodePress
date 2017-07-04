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
    //console.log(keyword,page);

    const arr = ['0','1','-1'];

    // 过滤条件
    let options = {
        sort:{ _id: -1 }, // 根据ID降序
        limit: Number(pre_page || 10), // 限制查询题哦数
        page:Number(page || 1), //当前页码
        populate:["category",'tag'], // 根据category和tag字段查询相关集合数据库；关联查询
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
            //console.log(articles.docs);
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

// 批量删除
articleCtrl.list.DELETE = ({body:{ articles }},res) => {
    console.log(articles);
    console.log("delete");
    if(!articles && !articles.length){
        handleError({res,message:"缺少删除数据"});
        return false;
    }
    Article.remove({"_id":{$in: articles}})
    .then((result) => {
        handleSuccess({res,message:"删除成功",result});
    })
    .catch((err) => {
        handleError({res,message:"删除失败",err});
    })
}

// 批量文件操作
articleCtrl.list.PATCH = ({body:{ articles,action}},res) => {
    console.log(articles)
    if(!articles && !articles.leng){
        handleError({res,message:"缺少字段"});
        return false;
    }
    // 
    let options = {};
    switch(action){
        // 快速发布
        case 1: 
            options.state = 1;
            break;
        // 移置草稿
        case 2: 
            options.state = 0;
            break;
        // 回收站
        case 3: 
            options.state = -1;
            break;
        default:
            break;
    }
    console.log(options.state);
    Article.update({"_id":{ $in: articles }},{ $set: options },{ multi:true })
    .then((result) => {
        handleSuccess({res,message:"修改文章状态成功",result});
    })
    .catch((err) => {
        console.log(err);
        handleError({res,message:"修改文章状态失败",err});
    })
}


// 根据ID获取文章信息
articleCtrl.item.GET = ({params:{ _id }},res) => {
    console.log(_id);
    // 判断Id来源
    const isFindById = Object.is(Number(_id),NaN);  // 判断_id还是id,_id为true，id为false;
    //console.log(isFindById);
    (isFindById ? 
        Article.findById({_id: _id}).select('-meta -create_at -update_at'): // 后台获取
        Article.findOne({id:id,state: 1,public:1}).populate('category tag').exec() // 前台获取
        )
        .then((result) => {
            // id获取
            if(!isFindById){
                result.meta.views += 1;  // 查看数量;
                result.save(); //保存
            }
            // id获取
            if(!isFindById && result.tag.length){ // 
                getRelatedArticles(result.toObject()); // toObject()转成对象
            }else{
                console.log(result);
                handleSuccess({res,message:"文章获取成功",result});
            }
        })
        .catch((err) => {
            handleError({res,message:"获取文章失败",err})
        })

    const getRelatedArticles = result => {
        Article.find({state:1,public:1,tag:{$in: result.tag.map((t) => t._id)}},
        'id title description thumb -_id') // 字段强制显示和强制隐藏
        .exec((err,articles) => {
            result.related = err ? [] : articles;
            handleSuccess({ res, result, message: '文章获取成功' });
        })
    }
}

// 修改ID
articleCtrl.item.PUT = ({params:_id,body:article},res) => {
    console.log(_id);
    console.log(article);
    if(!article.title && !article.content){
        handleError({res,message:"缺少必要参数"});
        return false;
    }
    Article.findByIdAndUpdate(_id,article,{new:true})
    .then((result = article) => {
        handleSuccess({res,message:"文章修改成功",result});
    })
    .catch((err) => {
        console.log(err);
        handleError({res,message:"文章修改失败"},err);
    })
}


// export
exports.list = (req, res) => { handleRequest({ req, res, controller: articleCtrl.list })};
exports.item = (req, res) => { handleRequest({ req, res, controller: articleCtrl.item })};
