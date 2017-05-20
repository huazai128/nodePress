const argv = require("yargs").argv;  //用于获取命令行的数据 node  db_username=huazai

//连接mongodb
exports.MONGODB = {
    uri:`mongodb://127.0.0.1:${argv.dbport || '27017' }/NodePress`,
    username: argv.db_username || 'DB_username',
    password: argv.db_password || 'DB_password'
}

//七牛配置
exports.QINIU = {
    accessKey: argv.qn_accessKey || 'your access key',
    secretKey: argv.qn_secretKey || 'your secret key',
    bucket: argv.qn_bucket || 'your bucket name',
    origin: argv.qn_origin || 'http://nodepress.u.qiniudn.com',
    uploadURL: argv.qn_uploadURL || 'http://up.qiniu.com/'
}

exports.AUTH = {
  data: argv.auth_data || { user: 'root' },
  jwtTokenSecret: argv.auth_key || 'nodepress',
  defaultPassword: argv.auth_default_password || 'root'
}

exports.BAIDU = {
  site: argv.baidu_site || 'your baidu site domain like',
  token: argv.baidu_token || 'your baidu seo push token'
}

exports.EMAIL = {
  account: argv.email_account || 'your email address like',
  password: argv.email_password || 'your email password'
}

exports.AKISMET = {
  key: argv.akismet_key || 'your akismet Key',
  blog: argv.akismet_blog || 'your akismet blog site, like'
}

exports.APP = {
  ROOT_PATH: __dirname,
  LIMIT: 10,
  PORT: 8000
}

exports.INFO = {
  name: 'NodePress',
  version: '1.0.0',
  author: 'Surmon',
  site: 'https://github.com/huazai128',
  powered: ['Vue2', 'Nuxt.js', 'React', 'Angular4', 'Bootstrap4', 'jQuery', 'Video.js', 'Node.js', 'MongoDB', 'Express', 'Nginx']
}
