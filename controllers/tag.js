const Tag = require("modules/tag");
const Article = require("modules/article");
const buildSiteMap = require("utils/sitemap"); //sitemap：可方便网站管理员通知搜索引擎他们网站上有哪些可供抓取的网页
const { handleRequest,handleError,handleSuccess } = require("utils/handle");// 用于处理请求方法和请求状态
const { baiduSeoPush,baiduSeoUpdate } = require("utils/baidu-seo-push"); //百度seo
const config = require("config/config");
const tagCtrls = {list:{},item:{}};

//添加标签
tagCtrls.list.POST = ({ body:tag,body: { slug }},res) => {
    console.log(tag)
    //验证slug是否存在
    if(slug == undefined && slug == null){
        handleError({res,message:"缺少slug"});
        return falses;
    }
    // 保存 函数
    const tagSave = () => {
        new Tag(tag).save()
        .then((result = tag) => {
            handleSuccess({res,result,message:"保存成功"});
            buildSiteMap(); //
            baiduSeoPush(`${config.INFO.site}/tag/${result.slug}`);
        })
        .catch((err) => {
            console.log(err);
            handleError({res,err,message:"保存失败"})
        })
    }
    //验证slug是否存在,find查询返回一个数组,数组对象中用length属性
    Tag.find({ slug }).then(({length}) => {
        console.log(length);
        //三元判断
        length ? handleError({res,message:"slug已存在"}) : tagSave();
    })
    .catch((err) => {
        handleError({res,err,message:"标签发布失败"})
    })
}

//获取所有tag
 tagCtrls.list.GET = (req,res) => {
     //使用解构赋值
     let { page = 1,pre_page = 12,keyword = '' } = req.query;
     console.log(req.query);
     //过滤条件
     const options = {
         sort:{ _id:-1 },
         page:Number(page), //转换成数字
         limit:Number(pre_page)
     }
     //查询参数
     const keyWordReg = new RegExp(keyword);
     console.log(keyWordReg); // /keyword/匹配
     const query = { //mongodb查询语句
         "$or":[ //$or:满足其中的一个或多个条件查询
             {'name':keyWordReg},
             {'slug':keyWordReg},
             {'description': keyWordReg}
         ]
     }
     //请求成功处理
     const querySuccess = (tags) => {
         //console.log(tags);
         handleSuccess({
             res,
             message:"获取标签列表",
             result:{
                 pagination:{
                     total:tags.total,  //
                     current_page:options.page,//当前页码
                     total_page:tags.pages, //总页数
                     pre_page:options.limit  //限制查询条数
                 },
                 data:tags.docs
             }
         })
     }
     //根据标签查询文章
     const getTagsCount = (tags) => {
         //用于过滤,查询满足要求；
         let $match = {};
         if (!true) {
             //查询匹配要求的字段文档集合
             $match = { state: 1, public: 1 };
         }
         //mongoose中聚合查询 aggregate([]);
         Article.aggregate([
             { $match }, //$match 用于过滤查询，查询匹配要求的数据
             //把Article文档集合中tag字段拆分成多条,http://www.ithao123.cn/content-275121.html
             { $unwind: "$tag" }, //$unwind:将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值
             { $group:{   //将集合中的文档分组，可用于统计结果
                _id: "$tag", // 添加一个_id:字段，值为$tag的值
                num_tutorial:{ $sum:1 } //num_tutorial：添加一个字段
             }}
         ]).then(articles => {
             //遍历tags
             const newTags = tags.docs.map( tag => {
                 //console.log(tag)
                 //查找
                 const finded = articles.find(article => String(tag._id) === String(article._id));
                 tag.count = finded ? finded.num_tutorial : 0;
                 return tag;
             })
             tags.doce = newTags;
             querySuccess(tags);
         }).catch((err) => {
             querySuccess(tags);
         }) 
     }
     //分页查询
     Tag.paginate(query,options) //使用分页查询
     .then(tags => { //查询所有tags
         //console.log(tags);
         getTagsCount(tags);
     })
     .catch(err => {
         handleError({res,err,messgage:"获取列表失败"});
     })
 }

 //根据ID删除,   req.params._id
 tagCtrls.item.DELETE = ({params:{_id}},res) => {
     console.log(_id)
     Tag.findByIdAndRemove(_id)
     .then( result => {
         handleSuccess ({res,message:"删除成功",result});
         buildSiteMap();
     })
     .catch(err => {
         console.log(err);
         handleError({res,message:"删除失败",err});
     })
 }

 // 根据ID 修改Tag
 tagCtrls.item.PUT = ({params: { _id},body: tag,body:{ slug }},res) => {
     if(!slug){
         handleError({res,message:"slug不合法"});
         return false;
     };
     console.log(_id);
     //根据slug  查询出来是一个数组
     Tag.find({slug:slug}).then(([_tag]) => {
         console.log(_tag)
         //判断_tag是否存在并且 _tag._id和tag._id是否相等，如果
         const hasExisted = (_tag && (_tag._id == tag._id));
         console.log(hasExisted);
         hasExisted ? handleError({res,message:"slug已存在"}) : putTag();
     }).catch((err) => {
         console.log(err);
         handleError({res,message:"修改前查询失败"},err);
     });
     //修改tag
     const putTag = () => {
         Tag.findByIdAndUpdate(_id,tag,{new:true})
         .then( result => {
             handleSuccess({res,result,message:"修改成功"});
             //buildSiteMap();
             //baiduSeoUpdate(`${config.INFO.site}/tag/${result.slug}`);
         })
         .catch(err => {
             console.log(err)
             handleError({res,message:"修改失败",err});
         })
     }
 }

 //批量删除
 tagCtrls.list.DELETE = ({body:{tags}},res) => {
     if(!tags || !tags.length){
         handleError({res,message:"缺少有效参数"})
         return false;
     }
     Tag.remove({"_id":{$in: tags}}) //$in:接受一个数组
     .then(result => {
         handleSuccess({res,message:"批量删除成功",result});
         buildSiteMap();
     })
     .catch((err) => {
         handleError({res,message:"删除失败",err});
     })
 }


exports.list = (req,res) => { handleRequest({req,res,controller:tagCtrls.list}) };
exports.item = (req,res) => { handleRequest({req,res,controller:tagCtrls.item}) };
