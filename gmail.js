var exports = module.exports
var xoauth2 = require("xoauth2")
var xoauth2gen;
var conf = require('./conf')
var nodemailer = require('nodemailer')

exports.sendEmail = function(refreshToken, msg, callback) {
  var auth = {
      user: msg.from,
      clientId: conf.google.clientId,
      clientSecret: conf.google.clientSecret,
      refreshToken: refreshToken
    };
  var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: { XOAuth2: auth }
  });

  smtpTransport.sendMail(msg, function(error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(response);
    }
    smtpTransport.close();
    callback(error, response)
  });
}
