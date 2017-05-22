const mongoose = require("config/mongodb").mongoose;
const autoIncrement = require('mongoose-auto-increment');  //自动ID增长
const mongoosePaginate = require('mongoose-paginate'); //分页
const ObjectId = mongoose.Schema.Types.ObjectId;


//自增ID初始化
autoIncrement.initialize(mongoose.connection);

//分类集合
const categorySchema = new mongoose.Schema({

    // 分类名称
    name: { type:String,required: true,validate: /\S+/ },

    // 别名
    slug:{ type:String,required:true,validate:/\S+/ },

    //分类描述
    description: String,
    // 父分类ID
    pid:{ type:ObjectId,ref:"Category",default:null },

    //创建时间
    create_at:{ type: Date,default: Date.now },

    //最后修改日期
    update_at:{type: Date},

    //自定义扩展
    extends:[{
        name: { type: String, validate: /\S+/ },
        value: { type: String, validate: /\S+/ }
    }]
})

categorySchema.set("toObject",{getters: true });  //?什么作用
categorySchema.plugin(mongoosePaginate);  //分页插件
categorySchema.plugin(autoIncrement.plugin,{
    model: 'Category',  //model
    field: 'id',  //添加一个字段
    startAt: 1,  //开始址
    incrementBy: 1 //每次添加值为1
})

//更新
categorySchema.pre("findOneAndUpdate",(next) => {
    this.findOneAndUpdate({},{update_at:Date.now()});
    next();
})

const Category = mongoose.model("Category",categorySchema);

module.exports = Category;

