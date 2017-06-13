const Category = require("modules/category");
const Article = require("modules/article");
const { handleRequest,handleError,handleSuccess } = require("utils/handle");
const { config } = require("config/config");
const categoryCtrl = { list:{},item:{} };
const { baiduSeoPush,baiduSeoUpdate } = require("utils/baidu-seo-push");
const buildSiteMap = require("utils/sitemap");

// 添加category；
categoryCtrl.list.POST = ({body: category,body:{ slug }},res) => {

    if(!category.pid){ // 不存在 
        delete category.pid; // 删除
    }
    if(category.slug == undefined){
        handleError({res,message:"请填写完表单"});
        return false;
    }
    // 查询slug是否存在
    Category.find({slug})
    .then((categoies) => {
        console.log(categoies)
        categoies.length && handleError({ res,message:"slug标签存在" });
        categoies.length || saveCategory();
    })
    .catch((err) => {
        handleError({res,message:"保存失败",err});
    })

    // 保存
    const saveCategory = () => {
        new Category(category).save()
        .then((result) => {
            handleSuccess({res,message:"保存成功",result});
            //buildSiteMap();
        })
        .catch((err) => {
            handleError({res,message:"保存失败",err});
        })
    }
}

// 获取所有分类
categoryCtrl.list.GET = ( req,res) => {
    // 
    const { page = 1,per_page = 10 } = req.query;

    // 查询配置
    let options = {
        sort:{'_id': -1},
        limit: Number(per_page),
        page:Number(page)
    }

    // 获取分类文章
    const getCatrgoriesCount = (cagetories) => {
        let $match = {}; // 用于过滤条件
        if(!true){
            $match = { state: 1, public:1} // 只能查询 state：1 public：1 
        }
        // aggregate([]):// 接受数组;
        Article.aggregate([
            { $match },
            { $unwind:"$category" },  // $unwind:将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值
            { $group:{  // /将集合中的文档分组，可用于统计结果
                _id:"$category", // 添加一个_id:字段，值为$category的值
                num_tutorial:{ $sum: 1 } // $sum:求和；求当前字段总数
            } }
        ]).then((articles) => {
            //console.log(articles);
            const newCagetories = cagetories.docs.map((category) => { // 遍历所有的分类
                // 判断分类id是否和 $group中添加的_id相等
                const finded = articles.find(article => String(category._id) === String(article._id));
                category.count = finded ? finded.num_tutorial : 0;
                return category; 
            });
            cagetories.docs = newCagetories;  //查询与文章有关的分类；
            requestSuccess(cagetories);
        }).catch(err => {
            requestSuccess(cagetories); // 这里直接查询分类
        })
    }

    // 分页查询categories
    Category.paginate({},options)
    .then((cagetories) => {
        //console.log(cagetories);
        getCatrgoriesCount(cagetories);
    })
    .catch(err => {
        handleError({ res,message:"请求分类数据失败",err })
    }); 

    // 请求处理成功
    const requestSuccess = ( categoies ) => {
        handleSuccess({
            res,
            message:"数据请求成功",
            result:{
                data: categoies.docs,
                pagination:{
                     total:categoies.total,  // 分类总数
                     current_page:options.page,//当前页码
                     total_page:categoies.pages, //总页数
                     pre_page:options.limit  //限制查询条数
                 },
            }
        })
    }
}

categoryCtrl.item.PUT = ({params:{ _id },body:category,body:{ slug }},res) => {
    if(!slug){
        handleError({res,message:"缺少slug字段"});
        return false;
    }

    // 查询slug
    Category.find(slug)
    .then(([_category]) => { // find：查询是一个数组 利用结构赋值；
        const hasExit = (_category && (_category._id == category._id))
    })
}





exports.list = (req,res) => { handleRequest({req,res,controller:categoryCtrl.list}) };
exports.item = (req,res) => { handleRequest({req,res,controller:categoryCtrl.item}) };
