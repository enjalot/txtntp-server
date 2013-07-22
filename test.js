var conf = require('./conf')
var oauth_version = "2.0";
var oauth_timestamp = OAuth.timestamp();
var oauth_nonce = OAuth.nonce(6); //random nonce?

var oauth_consumer_key = "NOTFORYOU"; //validated
var oauth_consumer_secret = "NOTFORYOU"; //validated
var oauth_token = "NOTFORYOU"; //validated
var oauth_token_secret = "NOTFORYOU"; //validated
var email = "NOTFORYOU"; //validated

var oauth_signature_method = "HMAC-SHA1";
var method = "GET";
var action = "https://mail.google.com/b/"
    +email
    +"/imap/"; //gmail's request url

//signature
var oauth_signature_method = "HMAC-SHA1"; //from https://developers.google.com/google-apps/gmail/oauth_protocol

//example values for validating signature from     http://oauth.net/core/1.0a/#sig_base_example
oauth_consumer_key="dpf43f3p2l4k3l03";
oauth_nonce="kllo9940pd9333jh";
oauth_signature_method="HMAC-SHA1";
oauth_timestamp="1191242096";
oauth_token="nnch734d00sl2jdk";
oauth_version="1.0";
action="http://photos.example.net/photos?file=vacation.jpg&size=original";
method="GET";

//signature
var signature_basestring_parameters = {
    oauth_version: oauth_version
    , oauth_consumer_key: oauth_consumer_key
    , oauth_timestamp: oauth_timestamp
    , oauth_nonce: oauth_nonce
    , oauth_token: oauth_token
    , oauth_signature_method: oauth_signature_method
}

//var signature_basestring = oauth_consumer_key+"&"+oauth_token_secret;
var signature_basestring = OAuth.SignatureMethod.getBaseString({method: method, action: action, parameters: signature_basestring_parameters});

var methodName = oauth_signature_method;
var signer = OAuth.SignatureMethod.newMethod(methodName, {
                    consumerSecret: oauth_consumer_secret,
                    tokenSecret: oauth_token_secret
                }
                   );
console.log("signature_basestring=["+signature_basestring+"]");

var oauth_signature = signer.getSignature(signature_basestring);

console.log("oauth_signature=["+oauth_signature+"]");

oauth_signature=OAuth.percentEncode(oauth_signature);

console.log("(escaped) oauth_signature=["+oauth_signature+"]"); //prints out tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D as in the [example](http://oauth.net/core/1.0a/#sig_base_example)

//base-string
var baseStringDecoded =  "GET"
    + " "
    + "https://mail.google.com/b/"+email+"/imap/"
    + " "
    + "oauth_consumer_key=\""+oauth_consumer_key+"\","
    + "oauth_nonce=\""+oauth_nonce+"\","
    + "oauth_signature=\""+oauth_signature+"\","
    + "oauth_signature_method=\""+oauth_signature_method+"\","
    + "oauth_timestamp=\""+oauth_timestamp+"\","
    + "oauth_token=\""+oauth_token+"\","
    + "oauth_version=\""+oauth_version+"\"";

var baseString = Base64.encode(  //base64 from http://www.webtoolkit.info/javascript-base64.html
    baseStringDecoded
);


//create imap connection
var imap = new ImapConnection({
                  host: 'imap.gmail.com',
                  port: 993,
                  secure: true,
                  debug: true,
                  xoauth: baseString
              });
