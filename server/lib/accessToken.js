/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-12-04 19:41:28
 * @version $Id$
 */
var https=require("https");
var crypto=require("crypto");
var querystring=require("querystring");
var appId="wx383ded8a7aa722de";

var options={
	hostname:"api.weixin.qq.com",
	path:"/cgi-bin/token?grant_type=client_credential&appid=wx383ded8a7aa722de&secret=106366d602a1c21995c9c644638ac937",
	method:"GET"
}



var deal_res=function(res,fn){
	var chunks=[];
	var size=0;
	console.log(res.headers);
	res.on("data",function(d){
		chunks.push(d);
		size+=d.length;
	});
	res.on("end",function(){
		var final_buf=Buffer.concat(chunks,size);
		//console.log(final_buf.toString().headers);
		var resJson=JSON.parse(final_buf.toString());
		fn(resJson);
	});
}

var getToken=function(model,fn){
	var token=model.find(function(err,data){
		if(err){
			console.log(err);
			return;
		}
		else{
			if(data[0]){
				var expires=data[0].expires_in*1000;
				var dateDiff=new Date()-data[0].time;
				if(dateDiff<expires){
					fn(data[0].access_token);
					return
				}
			}
			var req=https.request(options,function(res){
				var chunks=[];
				var size=0;
				res.on("data",function(d){
					chunks.push(d);
					size+=d.length;
				})
				res.on("end",function(){
					var final_buf=Buffer.concat(chunks,size);
					var access=JSON.parse(final_buf.toString());
					if(!access.access_token){
						console.log("wrong in get token");
					}
					else{
						access.time=new Date();
						access.id=1;
						model.upsert(access,function(err,obj){
							if(err){
								console.log(err);
								return;
							}
							fn(obj.access_token)
							return;
						})
					}
				})
			})
			req.end();
		}
	});
}

var add_kf=function(account,nickname,passwd,model){
	var postData=querystring.stringify({
		"kf_account":account,
		"nickname":nickname,
		"password":passwd
	});
	getToken(model,function(token){
		option={
			host:"10.211.55.4",
			path:"/",
			method:"POST",
			port:"3000",
			headers:{
				"Content-Type":"application/x-www-form-urlencoded",
				"Content-Length":postData.length
			}	
		}
		var req=https.request(option,function(res){
			deal_res(res,function(data){
				console.log(data);
			})
		});
		req.write(postData);
		req.end();
	});

}

var signature=function(noncert,jsapi,timestamp,url){
	var sign_str="jsapi_ticket="+jsapi+"&noncestr="+noncert+"&timestamp="+timestamp+"&url="+url;
	console.log(sign_str);
	var sha1=crypto.createHash("sha1");
	sha1.update(sign_str);
	var signature=sha1.digest("hex");
	return {
		appId:appId,
		timestamp:timestamp,
		nonceStr:noncert,
		signature:signature
	}
}


var jssdk=function(model,url,Token,res){
	var noncert="xingwentao";
	model.find(function(err,data){
		if(err){
			console.log(err);
			return;
		}
		else if(data[0]){
			console.log(data);
			var expires=data[0].expires_in*1000;
			var timeDiff=new Date()-data[0].time;
			if(timeDiff<expires){
				var data=signature(noncert,data[0].ticket,new Date().getTime(),url);
				console.log(data);
				res.json(data);
			}
			else{
				getToken(Token,function(token){
				    var options={
				        hostname:"api.weixin.qq.com",
				        method:"GET",
				        path:"/cgi-bin/ticket/getticket?access_token="+token+"&type=jsapi"
				    };

				    var request=https.request(options,function(result){
				        deal_res(result,function(result){
				        	console.log("new");
				            result.id=1;
				            result.time=new Date();
				            model.upsert(result,function(err,data){
				            	if(err){
				            		console.log(err);
				            		return;
				            	}
				            	console.log(data);
				            });
				            var data=signature(noncert,result.ticket,new Date().getTime(),url);
				            res.json(data);
				        })
				    });
				    request.end();
				})
			}
		}
	});
}

module.exports={
	getToken:getToken,
	add_kf:add_kf,
	deal_res:deal_res,
	jssdk:jssdk
}
















