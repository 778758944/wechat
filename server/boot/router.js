/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-12-02 20:20:52
 * @version $Id$
 */

// var sha1=require("crypto").createHash("sha1");
var crypto=require("crypto");
var request=require("../lib/accessToken.js");
var getPost=require("../lib/post_reciver.js");
var main=require("../lib/main.js");

module.exports=function(app){
	app.use(getPost);
	var Token=app.models.Token;
	var YongHu=app.models.YongHu;
	var JsApi=app.models.JsApi;
	// request.add_kf("test1@test","小娜","123456",Token);
	var router=app.loopback.Router();
	router.get("/wx/coming",function(req,res){
		console.log("msg");
        var sha1=crypto.createHash("sha1");
		var TOKEN="weixin";


		var signature=req.query.signature;
		var timestamp=req.query.timestamp;
		var nonce=req.query.nonce;
		var echoStr=req.query.echostr;

		var tmpArr=[TOKEN,timestamp,nonce];
		tmpArr.sort(function(a,b){
			if(a>b){
				return true;
			}
		});
		var tmpStr=tmpArr[0]+tmpArr[1]+tmpArr[2];
		sha1.update(tmpStr);
		tmpStr=sha1.digest("hex");
		if(tmpStr==signature){
			res.send(echoStr);
			return true;

		}
		else{
			return false;
		}
	});

	router.post("/wx/coming",function(req,res){
		main.res_fn(req,res,Token,YongHu);
	});

	router.get("/wx/users",main.getUsers);
	router.get("/wx/author",main.getAuthor);
	router.get("/wx/author_token",main.getAuthorToken);
	router.get("/wx/menu",main.createMenu);
	router.post("/posttest",function(req,res){
		console.log(req.body);
		res.json(req.body);
	});
	router.post("/jssdk",main.jssdk);
	router.post("/getcity",main.getcity);
	router.get('/accessToken',main.getToken);


	app.use(router);
}
































