/**
 * 
 * 公告数据模块
 * 
 */
const mongoose = require("../config/mongodb").mongoose;
const autoIncrement = require('mongoose-auto-increment'); //保存文档时自动递增架构上的任何ID字段。
const mongoosePaginate = require('mongoose-paginate');  //分页

//自增ID初始化
autoIncrement.initialize(mongoose.connection);

//公告模块
const announcementSchema = new mongoose.Schema({
    content:{type:String,default:""}, //公告内容
    state:{type:Number,default:1},    //发布状态： 0未发布  1发布
    create_at:{type:Date,default:Date.now}, //发布时间
    update_at:{type:Date,default:Date.now} //最后修改时间
})

// 翻页 + 自增ID插件配置
announcementSchema.plugin(mongoosePaginate); // plugin用于插件的插入
announcementSchema.plugin(autoIncrement.plugin,{
    model:"Announcement",  //插入的模块中
    field:"id",  //
    startAt:1,  //开始值
    incrementBy:1  //id每次自增数值
});

//时间更新
announcementSchema.pre("findOneAndUpdate",function(next){
    this.findOneAndUpdate({},{update_at:Date.now() });
    next();
})

// 公告模型
const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;//



