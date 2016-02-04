/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-12-18 19:31:19
 * @version $Id$
 */

 var https=require("https");
 var multi_fn=require("../lib/accessToken");
 module.exports=function(app){
 	// var Token=app.models.Token;
 	
 	var res_fn=function(req,res){
 		console.log(req.body);
		var toUser=req.body.xml.FromUserName;
		var ss="<xml><ToUserName><![CDATA["+toUser+"]]></ToUserName><FromUserName><![CDATA[gh_20709fe6c88a]]></FromUserName><CreateTime>"+new Date().getTime()+"</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[To be Continue]]></Content></xml>";
        // multi_fn.getToken(Token,function(token){
        // 	console.log(token);
        // });


		var options={
			hostname:"api.weixin.qq.com",
			path:"/cgi-bin/user/info",
			method:"GET"
		};

		res.send(ss);
 	}

 	return {
 		res_fn:res_fn	
 	}
}
