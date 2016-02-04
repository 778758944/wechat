/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-12-05 18:56:19
 * @version $Id$
 */
var xml2js=require("xml2js");
var querystring=require("querystring");
var hasBody=function(req){
	return "transfer-encoding" in req.headers || "content-length" in req.headers; 
}

var JF=function(req){
	var type=req.headers["content-type"]||"";
	// console.log(type);
	type=type.split(";")[0];
	if(type=="application/x-www-form-urlencoded"){
		return 1;
	}
	else if(type.indexOf("json")!=-1){
		return 2;
	}
	else if(type.indexOf("xml")!=-1){
		return 3;
	}
}

var postData=function(req,res,next){
	if(hasBody(req)){
		var chunks=[];
		var type=JF(req);
		req.on("data",function(chunk){
			chunks.push(chunk);
		});
		req.on("end",function(){
			var buf=Buffer.concat(chunks).toString();
			if(type==1||type==2){
				req.body=querystring.parse(buf);
				// console.log(req.body);
				next();
			}
			else if(type==3){
				var option={
					explicitArray:false,
				};

				xml2js.parseString(buf,option,function(err,xml){
					if(err){
						console.log(err);
						return;
					}
					// console.log(xml);


					req.body=xml
					next();
				})
			}
		})
	}
	else{
	    next();
	}
}

module.exports=postData;

