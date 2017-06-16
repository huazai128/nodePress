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

categoryCtrl.item.PUT = ({params:{ _id },body:category,body:{ slug,pid }},res) => {
    if(!slug){
        handleError({res,message:"缺少slug字段"});
        return false;
    }
    console.log(slug);
    // 查询slug
    Category.find({slug:slug})
    .then(([_category]) => { // find：查询是一个数组 利用结构赋值；
        console.log(_category)
        const hasExit = (_category && (_category._id == category._id));
        hasExit ? handleError({res,message:"slug已存在"}) : putCategory();
    })
    .catch((err) => {
        console.log(err);
        handleError({res,message:"查询slug失败",err});
    });

    // 保存
    const putCategory = () => {
        if(['','0','null','false'].includes(pid) || !pid || Object.is(category._id,pid)){
            category.pid = null;
        }
        Category.findByIdAndUpdate(_id,category,{new:true})
        .then((result) => {
            handleSuccess({res,message:"保存成功",result});
        })
        .catch((err) => {
            console.log(err);
            handleError({res,message:"保存失败",err})
        })
    }
}

// 单个删除,关联PID删除，
categoryCtrl.item.DELETE = ({params: { _id }},res) => {
    console.log(_id);
    // 删除对象, 返回删除对象
    const delCategory = () => {
        return Category.findByIdAndRemove(_id) //返回一个Promise
    }

    // 查看哪些category中  使用当前category._id;
    const searchCategory = (category) => {
        return new Promise((resolve,reject) => {
            Category.find({pid: _id})
            .then((categories) => {
                if(!categories.length){
                    resolve({result: category});
                    return false;
                }
                // 根据父pid 查询关联子id；
                //初始化并返回一个Bulk()集合的新的操作构建器。构建器构建了MongoDB批量执行的写操作的有序列表。
                let _category = Category.collection.initializeOrderedBulkOp();//通过有序的操作列表，MongoDB将连续执行列表中的写操作。
                console.log(_category);
                //有序的批量操作;
                _category.find({ '_id': { $in: Array.from(categories, c => c._id) } })
                .update({ $set: { pid: null }})
                .execute((err,data ) => {
                    console.log(data);
                    err ? reject(err) : resolve({result: category});
                })
            })
            .catch((err) => reject(err));
        })   
    }

    // 使用asyn一步函数;会自动交还执行权；
    (async () => {
        const category = await delCategory();  // await关键字:等函数执行完会自定交还执行权，执行下面操作;
        console.log(category,"=======");  // 删除对象
        return await searchCategory(category);
    })()
    .then((result) => {
        handleSuccess({res,nessage:"删除成功",result});
    })
    .catch((err) => {
        handleError({err,message:"删除失败",err});
    });
}

// 多个删除
categoryCtrl.list.DELETE = ({body: categories},res) => {
    if(!categories.length){
        handleError({res,message:"缺少删除数据"})
        return false;
    }
    // 改进版
    const delCategories = () => {
        return Category.remove({"_id": {$in:categories }});
    }
    console.log(categories);
    // 更新值
    const updateCategories = () => { 
        return new Promise((resolve,reject) => {
            Category.find({pid:{$in:categories}})
            .then((_categories) => {
                    console.log(_categories);
                    if(!_categories.length){
                        resolve(null)
                        return false;
                    }
                    Category.find({ '_id': { $in: Array.from(_categories, c => c._id) } })
                    .update({ $set: { pid: null }})
                    .exec((err,data ) => {
                        console.log(data);
                        err ? reject(err) : resolve(data);
                    })
                })
            .catch((err) => {
                console.log(err);
                reject(err);
            })
        })
    }
    (async () => {
        const data = await delCategories();
        console.log(data.result.ok);
        if(!data.result.ok) return false;
        return await updateCategories();
    })()
    .then((result) => {
        handleSuccess({res,message:"删除成功",result});
    })
    .catch((err) => {
        handleError({res,message:"删除失败"});
    })
}




exports.list = (req,res) => { handleRequest({req,res,controller:categoryCtrl.list}) };
exports.item = (req,res) => { handleRequest({req,res,controller:categoryCtrl.item}) };
