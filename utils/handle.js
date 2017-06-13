
//请求
exports.handleRequest = ({ req, res, controller }) => {//对象结构是根据对象属性肤质，与顺序无关；
    const method = req.method;
    const support = !!controller[method];//!!强制把其他类型转换成boolean类型
    support && controller[method](req,res);
    support || res.status(405).jsonp({ code: 0, message: '不支持该请求类型！' });
};

//请求错误
exports.handleError = ({ res, message = '请求失败', err = null }) => {
  res.jsonp({ code: 0, message, debug: err });
};

//请求成功
exports.handleSuccess = ({ res, message = '请求成功', result = null }) => {  //result默认为null
  res.jsonp({ code: 1, message, result });
};
