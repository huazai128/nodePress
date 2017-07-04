const Comment = require("modules/comment");
const { handleRequest,handleError,handleSuccess } = require("utils/handle");
const authIsVerified = require("utils/auth");
const Article = require("modules/article");
const Option = require("modules／option");
const geoip = require("geoip-lite");

const commentCtrl = { list: {},item: {} };

// 更新当前所受影响的文章的评论聚合数据
const updateArticleCommentCount = (post_ids = []) => {
    console.log(post_ids)
    post_ids = [...new Set(post_ids)].filter(id => !!id);
    console.log(post_ids)
}


module.exports = (req,res) => {handleRequest({req,res,controller:commentCtrl}) }