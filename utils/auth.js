/**
 * auth验证方法
 */
const config = require('config/config');
const jwt = require('jsonwebtoken');

// 验证Auth
const authToken = req => {
    // 获取请求头信息
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    console.log(parts);
    if (Object.is(parts.length, 2) && Object.is(parts[0], 'Bearer')) {
      return parts[1];
    }
  }
  return false;
};

// 验证权限
const authIsVerified = req => {
  const token = authToken(req);
  console.log(token);
  if (token) { // 验证用户信息是否过期；
    try {
      // 解析过期时间
      const decodedToken = jwt.verify(token, config.AUTH.jwtTokenSecret);
      if (decodedToken.exp > Math.floor(Date.now() / 1000)) {
        return true;
      }
    } catch (err) {}
  }
  return false;
};

module.exports = authIsVerified;