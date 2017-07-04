const Option = require("modules/option");
const { handleRequest,handleError,handleSuccess } =  require("utils/handle");
const optionCtrl = {  };

// 获取配置
optionCtrl.GET = (req,res) => {
    Option.findOne({})
    .then((result = {}) => {
        handleSuccess({res,message:"配置数据获取成功",result})
        console.log(result);
    })
    .catch((err) => {
        handleError({res,message:"配置数据获取失败",err})
        console.log(err);
    })
}

// 修改配置
optionCtrl.PUT = ({body:option,body:{_id}},res) => {
    console.log(option)
    if(!_id) delete option._id;
    // 检测黑名单和ping地址列表不能存入空元素
    option.ping_sites = (option.ping_sites || []).filter((t) => !!t); // 用于判断数组是否存在空元素；返回不是的元素
    option.blacklist.ips = (option.blacklist.ips || []).filter((t) => !!t);
    option.blacklist.mails = (option.blacklist.mails || []).filter((t) => !!t);
    option.blacklist.keyword = (option.blacklist.keyword || []).filter((t) => !!t);
    (!!_id ? Option.findByIdAndUpdate({_id:_id}, option, { new: true }) : new Option(option).save())
    .then((result) => {
        console.log(result);
        handleSuccess({res,message:"数据修改成功",result});
    })
    .catch((err) => {
        console.log(err)
        handleError({res,message:"数据修改失败",err});
    })
}

module.exports = (req,res) => { handleRequest({req,res,controller:optionCtrl}) }