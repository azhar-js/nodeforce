var querystring = require('querystring'),
	request 	= require('request');

var endpoints = {
	AUTH_ENDPOINT 		: 'https://login.salesforce.com/services/oauth2/authorize',
	TEST_AUTH_ENDPOINT  : 'https://test.salesforce.com/services/oauth2/authorize',
	LOGIN_URI          	: 'https://login.salesforce.com/services/oauth2/token',
	TEST_LOGIN_URI     	: 'https://test.salesforce.com/services/oauth2/token',
	API_VERSIONS        :  ['v20.0', 'v21.0', 'v22.0', 'v23.0', 'v24.0', 'v25.0', 'v26.0', 'v27.0', 'v28.0', 'v29.0']
}

var Connection = function(opts, callback) {

	if(!opts.clientId || typeof opts.clientId  != 'string') {
		throw new Error('Invalid clientId');
	}
	if(!opts.clientSecret || typeof opts.clientSecret != 'string') {
		throw new Error('Invalid Client Secret');
	}
	if(!opts.username || typeof opts.username != 'string') {
		throw new Error('Inavlid username')
	}
	if(!opts.password || typeof opts.password != 'string') {
		throw new Error('Inavlid password');
	}
	if(!opts.environment) {
		opts.environment = 'production';
	}
 	if(!opts.apiVersion) {
 		throw new Error('Invalid apiversion')
 	}
 	else {
		if(/^\d\d\.\d$/.test(opts.apiVersion)) {
 			opts.apiVersion = "v"+opts.apiVersion;
 			this.apiVersion = opts.apiVersion;
 		}
 		else {
 			throw new Error(' apiVersion should be like 27.0 ')
 		}
 	}
 	if(!opts.securityToken) {
 		throw new Error(' Invalid security token')
 	}
 	
 	this.buildAuthObj(opts, callback);
 	return this;
}

Connection.prototype.buildAuthObj = function(opts, callback) {
	var reqObj = {}, uri = "";

		reqObj['client_id'] = opts.clientId;
		reqObj['client_secret'] = opts.clientSecret;		
		reqObj['username'] = opts.username;
		reqObj['password'] = opts.password+opts.securityToken;
		reqObj['grant_type'] = 'password';
		reqObj['environment'] = opts.environment;

		if(opts.environment == 'production') {
			uri = endpoints.LOGIN_URI;
		}			
		else { 
			uri = endpoints.TEST_AUTH_ENDPOINT;
		}

		var reqOpts =  {
			uri : uri,
			method : 'POST',
			body : querystring.stringify(reqObj),
			headers: {
			   'Content-Type': 'application/x-www-form-urlencoded'
		    }
		}
		request(reqOpts, callback);
}


Connection.prototype.query = function(oauth, query, callback) {
console.log('inside query')
	var oauth = JSON.parse(oauth);
	var uri = oauth.instance_url+'/services/data'+this.apiVersion+'/queryAll';
	var opt = { 
			 	"uri" : uri,
			 	"method" : "GET",
			 	"qs" : {q : query}			
			  }
	this.queryApi(oauth, opt, callback);

}
Connection.prototype.queryApi = function(oauth, opt, callback) {
		opt.headers = {
			"Authorization" : "Bearer " + oauth.access_token,
			"accept" : "application/json;charset=UTF-8",
			"content-type" : "application/json"
		} 
		request(opt, callback);

}



			
module.exports.Connection = Connection;
