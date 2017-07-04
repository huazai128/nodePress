// 评论数据模型

const mongoose = require("config/mongodb").mongoose;
const autoIncrement = require('mongoose-auto-increment'); // ID自增长
const mongoosePaginate = require('mongoose-paginate'); // 分页组件

autoIncrement.initialize(mongoose.connection); // 初始化ID自增长

// 评论模型
const commentShema = new mongoose.Schema({
    // 第三方评论ID
    third_id: { type:Number },
    
    // 评论所有的文章ID，0 台标系统留言
    post_id:{ type:Number,required:true },

    // pid， 0代表默认留言
    pid: {type: Number,default: 0},

    // 评论内容
    content: { type:String,required: true},

    // 是否置顶
    is_top: { tyep:Boolean,default: false},

    // 被赞次数
    likes: { type:Number,default: 0 },

    // 评论生产者
    author: {
  	    name: { type: String, required: true, validate: /\S+/ },
        email: { type: String, required: true, validate: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/ },
        site: { type: String, validate: /^((https|http):\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/ }
    },

    // IP地址
    ip: { type:String},

    // IP物理地址
    ip_location: { type:Object },

    // 用户UA
    agent:{ type:String,validate:/\S+/ },

    // 状态 0待审核／1已通过／-1已删除／-2 垃圾评论
    state: { type:String,default: 1 },

    // 发布日期
    create_at:{ type:Date,default:Date.now },

    // 最后更新时间
    update_at: {type:Date },

    // 自定义扩展
    extends: [{
        name: { type:String,validate: /\S+/ },
        value: { type:String,validate: /\S+/ }
    }]
});
commentShema.plugin(mongoosePaginate),
commentShema.plugin(autoIncrement.plugin,{
    model:"Comment",
    field:"id",
    startAt: 1,
    incrementBy: 1
});

commentShema.pre("findByIdAndUpdate", (next) => {
    this.findByIdAndUpdate({},{update_at:Date.now()});
    next();
})

const Comment = mongoose.model("Comment",commentShema);

module.exports = Comment;

