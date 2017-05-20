/**
 * 
 * 公告控制器
 * 
 */
const authIsVerified = require("utils/auth");
const Announcement = require("modules/announcement");

const { handleRequest,handleError,handleSuccess } = require("utils/handle");

const announcementCtrl = { list:{},item:{} };

//获取所用的公告信息
announcementCtrl.list.GET = (req,res) => {  //使用解构赋值；
    console.log(req.query)
    //获取请求参数
    let { page = 1,pre_page = 10,state,keyword = ""} = req.query;
    //过滤条件
    const options = {
        sort:{_id: -1}, //根据ID进行讲叙
        page:Number(page), //当前页码
        limit:Number(pre_page)  //限制查询条数
    }
    //查询参数
    const querys = {
        "content": new RegExp(keyword)
    }
    //按照type查询
    if(["0","1"].includes(state)){ //includes()判断数组存在当前值
        querys.state = state;
    }
    //分页查询
    Announcement.paginate(querys,options) //根据查询条件查询所有的数据，并进行分页；
        .then((announcements) => { //查询所有的数据
            handleSuccess({
                res,
                message:"公告列表获取成功",
                result:{
                    pagination: {  
                        total: announcements.total,   
                        current_page: options.page,
                        total_page: announcements.pages,
                        pre_page: options.limit
                    },
                    data: announcements.docs
                }
            })
        })
        .catch((err) => {
            handleError({ res, err, message: '公告列表获取失败' });
        })
}
//添加公告
announcementCtrl.list.POST = ({ body:announcement},res) => {
    console.log(announcement);
    if(announcement){
        console.log(announcement);
        new Announcement(announcement).save()
        .then((result = announcement) => {
            handleSuccess({ res, result, message: '公告发布成功' });
        })
        .catch(err => {
            handleError({ res, err, message: '公告发布失败' });
        })
    }else{
        handleError({ res, message: '公告发布数据为空' });
    }
}

//批量删除数据 和前端属性一样
announcementCtrl.list.DELETE = ({body:{ items }},res) => {
    console.log("delete")
    console.log(items);
    //验证
    if(!items || !items.length){
        handleError({res,message:'缺少有效参数'});
        return false;
    }
    //$in(name:["id1","id2",....]);匹配字段值
    Announcement.remove({"_id":{$in: items}})
    .then(result => {
        handleSuccess({res,result,message:"公告批量删除成功"})
    })
    .catch(err => {
        handleError({res,err,message:"公告批量删除失败"})
    })
}

//删除单个公告
announcementCtrl.item.DELETE = ({params:{announcement_id}},res) => {
    Announcement.findByIdAndRemove(announcement_id)
    .then((result) => {
        handleSuccess({res,result,message:"删除成功"});
    })
    .catch(err => {
        handleError({res,err,message:"删除失败"})
    })
}

//修改公告
announcementCtrl.item.PUT = ({params:{ announcement_id },body:item},res) => {

    console.log(announcement_id)
    if (!item.content) {
        handleError({ res, message: '内容不合法' });
        return false;
    };
    Announcement.findByIdAndUpdate(announcement_id, item, { new: true })
    .then(result => {
        handleSuccess({ res, result, message: '公告修改成功' });
    })
    .catch(err => {
        console.log(err);
        handleError({ res, err, message: '公告修改失败' });
    })
}



// export
exports.list = (req, res) => { handleRequest({ req, res, controller: announcementCtrl.list })};
exports.item = (req, res) => { handleRequest({ req, res, controller: announcementCtrl.item })};