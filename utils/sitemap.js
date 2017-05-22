/**
 * sitemap:https://github.com/ekalinin/sitemap.js
 */
const fs = require("fs");
const sm = require("sitemap");  // sitemap:可方便网站管理员通知搜索引擎他们网站上有哪些可供抓取的网页
const config = require("config/config");
const Tag = require("modules/tag");
const Article = require("modules/article");
const Category = require("modules/category");
let sitemap = null;

/**
 * Sitemap 可方便网站管理员通知搜索引擎他们网站上有哪些可供抓取的网页。
 * 最简单的 Sitemap 形式，就是XML 文件，在其中列出网站中的网址以及关于每个网址的其他元数据（上次更新的时间、更改的频率以及相对于网站上其他网址的重要程度为何等），
 * 以便搜索引擎可以更加智能地抓取网站
 * url:链接地址
 * changefreq:更新频率
 * priority:权重,相对于其他页面的优先权
 * Sitemap Api:根据 sitemap 访问地址,访问 sitemap 路径时动态生成 xml 流,然后 pipe 到 response
 */
let pages = [
  { url: '', changefreq: 'always', priority: 1 },
  { url: '/about', changefreq: 'monthly', priority: 1 },
  { url: '/project', changefreq: 'monthly', priority: 1 },
  { url: '/sitemap', changefreq: 'always', priority: 1 },
  { url: '/guestbook', changefreq: 'always', priority: 1 }
];

/**
 * 获取数据
 * success: callback一个回调函数
 */
const getDates = success => {
    //创建Sitemap,并设置配置文件
    sitemap = sm.createSitemap({
        hostname:config.INFO.site || 'http://localhost:8000',
        cacheTime: 600000,
        urls:[...pages] //抓取的urls
    });
    /**
     * 查询所有的Tags，在每个tag是生成一个sitemap，每次生成 sitemap 后在根目录下创建一个 sitemap.xml 文件；
     * 然后创建一个路由,当访问 /tag/slug(根据字段slug).xml 路径时,  
     * 我们用文件流读取 /tag/slug.xml 然后 pipe 到 response 流中,返回给客户端.
     * 同理Category和Article都是一样
     * 使用fs来读取文件
     */
    Tag.find({},sort({"_id":-1}))
        .then((tags) => {
            tags.forEach((tag) => {
                sitemap.add({
                    url:`/tag/${tag.slug}`,
                    changefreq:"daily", //更新频率
                    priority: 0.6  //权重
                })
            })
            return Category.find({},sort({"_id":-1}));
        })
        .then((categories) => {
            categories.forEach((category) => {
                sitemap.add({
                    url:`/category/${category.slug}`,
                    changefreq:"daily", //更新频率为一天一次更新
                    priority: 0.6
                })
            })
            return Article.find({ state: 1, public: 1},sort({"_id": -1}));
        })
        .then((articles) => {
            articles.forEach((article) => {
                sitemap.add({
                    url:`/article/${article.id}`,
                    changefreq: 'daily', 
                    lastmodISO: article.create_at.toISOString(), //使用日期toISOString格式
                    priority: 0.8 
                })
            })
            success();
        })
        .catch((err) => {
            success();
            console.warn('生成地图前获取数据库发生错误', err);
        })
}


//生成xml文件
const buildSiteMap = (success,err) => {
    getDates(() => {
        
    })
}
