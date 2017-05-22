const mongoose = require('../config/mongodb').mongoose;
const autoIncrement = require('mongoose-auto-increment');  //自动ID增长
const mongoosePaginate = require('mongoose-paginate'); //分页
const ObjectId = mongoose.Schema.Types.ObjectId;

autoIncrement.initialize(mongoose.connection);  //自动ID增长  初始化

const articleSchema = new mongoose.Schema({

    //文章标题
    title:{ type:String,required: true, validate: /\S+/ },

    //文章关键字
    keywords:[{ type:String }],

    //文章描述
    description:{ type:String,default:"" },

    //文章内容
    content:{type:String,required: true, validate: /\S+/ },

    //缩略图
    thumb:String,

    //文章状态 1:发布 0：草稿 -1:回收站
    state:{ type:Number,default: 1 },

    //是否公开 1:公开 0:需要密码 -1:私密
    public:{ type:Number,default: 1 },

    //文章密码 =》 加密状态生效
    password:{ type:String,default:""},

    //发布时间
    create_at:{ type:Date,default:Date.now},

    //更新时间
    update_at:{ type:Date,default:Date.now },

    //文件标签
    tag:[{ type: ObjectId,ref:"Tag"}],

    //文章分类
    category: [{type:ObjectId,ref:"Category",required:true }],

    //其他信息
    meta: { 
        views:{ type:Number,default:0 },  //查看数量
        links:{ type:Number,default:0 },  //访问数量
        comments:{ type:Number,default:0 }, //评论数量
    },

    //自定义扩张
    extends:{
        name: { type: String, validate: /\S+/ },
        value: { type: String, validate: /\S+/ } 
    }
});

articleSchema.set("toObject",{getters: true});//

articleSchema.plugin(mongoosePaginate);// 添加mongoose分页插件
articleSchema.plugin(autoIncrement.plugin,{ //自增ID插件配置
  model: 'Article', //插入到Article集合中
  field: 'id', //字段为id
  startAt: 1, //开始址
  incrementBy: 1  //每次加
})

//更新
articleSchema.pre("findOneAnfUpdate",(next) => {
    this.findOneAndUpdate({},{update_at:Date.now()});
    next();
})

// 列表时用的文章内容虚拟属性
articleSchema.virtual('t_content').get(function() {
  const content = this.content;
  return !!content ? content.substring(0, 130) : content;
});

// 文章模型
const Article = mongoose.model('Article', articleSchema);

// export
module.exports = Article;