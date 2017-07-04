const config = require("config/config");
const modeemailer = require("nodeemailer"); //邮件发送模块
const smtpTransport = require("nodemailer-smtp-transport");
let clientIsValid = false;

