var express = require('express');
var everyauth = require('everyauth');
var conf = require('./conf');
var MongoStore = require('connect-mongo')(express);

var gmail = require('./gmail')

/////////////////////////////////////////////////////////
var usersById = {};
var nextUserId = 0;
var usersByGoogleId = {};
var usersByGhId = {};
function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}
everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });
/////////////////////////////////////////////////////////

everyauth.google
.appId(conf.google.clientId)
  .appSecret(conf.google.clientSecret)
  .scope([
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.google.com/m8/feeds/',
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/calendar'
  ].join(' '))
  .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
    googleUser.refreshToken = extra.refresh_token;
    googleUser.expiresIn = extra.expires_in;
    var user = usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
    sess.user = user;
    return user;
  })
  .redirectPath('/');

everyauth.github
  .appId(conf.github.appId)
  .appSecret(conf.github.appSecret)
  .scope('gist')
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, ghUser) {
    var user = usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser));
    sess.user = user;
    return user;
  })
  .redirectPath('/');

var app = express();
app.use(express.static(__dirname + '/public'))
  .use(express.favicon())
  .use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({
    secret: conf.sessionSecret || 'set that secret sldflksdjflksdjfljsdflkjsdflkjdlkasdcm0ej',
    store: new MongoStore({url: 'mongo://localhost:27017/txtntp', safe: true})
  }))
  .use(everyauth.middleware())
  .use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  })

app.get('/', function (req, res) {
  console.log("req.session", req.session)
  res.send(usersById);
});

app.get('/gmail', function(req, res, next) {
  var session = req.session;
  if(!session || !session.auth) { return res.send(401); }
  //TODO: null check
  var email = session.auth.google.user.email;
  var refreshToken = session.auth.google.refreshToken;
  var msg = {to: email, from: "enjalot@gmail.com", subject:"testtt", text:"ayy"};
  gmail.sendEmail(refreshToken, msg, function(err) {
    if(err) return res.send(err)
    res.send("asdf")
  })
})

app.post('/gmail', function(req, res, next) {
  console.log("HEYY");
  console.log("BODy", req.body)
  var session = req.session;
  console.log("SESSION", session)
  if(!session || !session.auth) { return res.send(401); }
  //TODO: null check
  var email = session.auth.google.user.email;
  var refreshToken = session.auth.google.refreshToken;
  var body = req.body;
  return res.send("hi")
  //TODO: null check
  var msg = {
    from: email,
    to: req.body.recipient,
    subject: req.body.subject,
    text: req.body.body
  };
  gmail.sendEmail(refreshToken, msg, function(err) {
    if(err) return res.send(err)
    res.send(200)
  })
})



app.listen(8000);

console.log('Go to http://localhost:8000');

module.exports = app;
