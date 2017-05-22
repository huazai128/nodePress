

const { handleRequest,handleError,handleSuccess } = require("utils/handle");
const { baiduSeoPush, baiduSeoUpdate, baiduSeoDelete } = require("utils/baidu-seo-push");

const Category = require("modules/category");
const Article = require("moduels/artilce");
const Tag = require("modules/tag");
const authIsVerified = require("utils/auth");

const artilceCtrl = {limit:{},item:{}};
