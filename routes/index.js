const config = require("config/config");
const controllers = require("controllers/index");

const routes = (app) => {
    //拦截器
    app.all("*",(req,res,next) => {
        console.log("进来了！！！")
        //设置 Header和跨域解决
        //const allowedOrigins = []
        const origin = req.headers.origin || "";
        //console.log(req.headers.origin);//查看请求头信息
        if(origin.includes("localhost")){  //includes：判断数组中是否包含localhost
            res.setHeader("Access-Control-Allow-Origin",origin);
        }
        res.header('Access-Control-Allow-Headers', 'Authorization, Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With');
        res.header('Access-Control-Allow-Methods', 'PUT,PATCH,POST,GET,DELETE,OPTIONS');
        res.header('Access-Control-Max-Age', '1728000');
        res.header('Content-Type', 'application/json;charset=utf-8');
        res.header('X-Powered-By', 'Nodepress 1.0.0');

        //OPTIONS
        if(req.method == "OPTIONS"){ //判断请求方法是否为OPTIONS
            res.sendStatus(200);
            return false;
        }

        //这里的作用？
        if(Object.is(process.env.NODE_ENV,"production")){ //Object.is(value1,value2):判断两个值是否相等；
            const { origin,referer } = req.headers; //使用解构赋值
            const originVerified = (!origin || origin.includes("localhost") && (!referer || referer.includes("localhost")));
            if(!originVerified){
                res.status(403).jsonp({ code: 0, message: '来者何人！' })
                return false;
            }
        }

        // 排除auth的post请求 && 评论的post请求 && like请求
        const isLike = Object.is(req.url, '/like') && Object.is(req.method, 'POST');
        const isPostAuth = Object.is(req.url, '/auth') && Object.is(req.method, 'POST');
        const isPostComment = Object.is(req.url, '/comment') && Object.is(req.method, 'POST');
        if (isLike || isPostAuth || isPostComment) {
            next();
            return false;
        };

        // // 拦截所有非管路员的非get请求
        // if (!authIsVerified(req) && !Object.is(req.method, 'GET')) {
        //     res.status(401).jsonp({ code: 0, message: '来者何人！' })
        //     return false;
        // };
        console.log("===")
        next();
    })

    // Api
    app.get("/", (req,res) => {
        console.log("请求进来了！")
        res.jsonp(config.INFO);
    })

    //Auth
    app.all("/auth",function(){

    });
    console.log("asasa")
    // Announcement
    app.all('/announcement', controllers.announcement.list);
    app.all('/announcement/:announcement_id', controllers.announcement.item);

    app.all("*",(req,res) => {
        res.status(404).jsonp({
            code:0,
            message:"无效的请求"
        })
    })
}

module.exports = routes;