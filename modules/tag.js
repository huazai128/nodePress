const mongoose = require('../config/mongodb').mongoose;
const autoIncrement = require('mongoose-auto-increment');  //自动ID增长
const mongoosePaginate = require('mongoose-paginate'); //分页

autoIncrement.initialize(mongoose.connection);

const tagSchema = new mongoose.Schema({

    //标签名称
    name:{ type:String,required:true,validate:/\S+/ },

    // 别名
    slug: { type: String, required: true, validate: /\S+/ },

    // 标签描述
    description: String,

    // 发布日期
    create_at: { type: Date, default: Date.now },

    // 最后修改日期
    update_at: { type: Date },

    // 自定义扩展
    extends: [{ 
        name: { type: String, validate: /\S+/ },
        value: { type: String, validate: /\S+/ } 
    }]
})

tagSchema.plugin(mongoosePaginate);//
tagSchema.plugin(autoIncrement.plugin,{
  model: 'Tag',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

tagSchema.pre("findByIdAndUpdate",(next) => {
    this.findByIdAndUpdate({},{update_at: Date.now()});
    next();
})

// 标签模型
const Tag = mongoose.model('Tag', tagSchema);

// export
module.exports = Tag;