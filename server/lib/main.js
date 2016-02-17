/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-12-08 20:09:13
 * @version $Id$
 */
 var loopback=require("loopback");
 var https=require("https");
 var http=require("http");
 var multi_fn=require("../lib/accessToken.js");
 var Token=loopback.findModel("Token");
 var YongHu=loopback.findModel("YongHu");
 var JsApi=loopback.findModel("JsApi");

 module.exports={
 	res_fn:function(req,res,token,YongHu){
 		console.log(req.body);
		var toUser=req.body.xml.FromUserName;
		var ss="<xml><ToUserName><![CDATA["+toUser+"]]></ToUserName><FromUserName><![CDATA[gh_20709fe6c88a]]></FromUserName><CreateTime>"+new Date().getTime()+"</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[To be Continue]]></Content></xml>";

        multi_fn.getToken(token,function(token){

        	var options={
        		hostname:"api.weixin.qq.com",
				path:"/cgi-bin/user/info?access_token="+token+"&openid="+toUser,
				method:"GET"
        	};
        	var request=https.request(options,function(res){
        		multi_fn.deal_res(res,function(res){
        			console.log(res);
        			var obj={
        				"openid":res.openid,
        				"nickname":res.nickname,
        				"sex":res.sex,
        				"city":res.city,
        				"headimg":res.headimgurl
        			}
        			YongHu.upsert(obj,function(err,data){
        				console.log(data);
        			})
        		})
        	});
        	request.end();
        })
		res.send(ss);
 	},

        getUsers:function(req,res){
                multi_fn.getToken(Token,function(token){
                        console.log(token);
                        var option={
                                hostname:"api.weixin.qq.com",
                                method:"GET",
                                path:"/cgi-bin/user/get?access_token="+token,
                        }
                        var request=https.request(option,function(response){
                                multi_fn.deal_res(response,function(response){
                                        console.log(response);
                                        res.json(response);
                                });
                        });
                        request.end();
                });
        },

        getAuthor:function(req,res){
                var url="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx383ded8a7aa722de&redirect_uri=http://wechat.xingwentao.top/wx/author_token&response_type=code&scope=snsapi_userinfo&state=abc#wechat_redirect";
                res.redirect(url);
        },
        getAuthorToken:function(req,res){
                console.log("redirect1");
                console.log(req.query.code);
                var code=req.query.code;
                var option={
                        hostname:"api.weixin.qq.com",
                        method:"GET",
                        path:"/sns/oauth2/access_token?appid=wx383ded8a7aa722de&secret=106366d602a1c21995c9c644638ac937&code="+code+"&grant_type=authorization_code"
                }
                var request=https.request(option,function(result){
                    console.log(result.header);
                        multi_fn.deal_res(result,function(result){
                                console.log(result);
                                var option={
                                        hostname:"api.weixin.qq.com",
                                        method:"GET",
                                        path:"/sns/userinfo?access_token="+result.access_token+"&openid="+result.openid+"&lang=zh_CN"
                                }

                                var request2=https.request(option,function(result){
                                        multi_fn.deal_res(result,function(result){
                                                console.log(result);
                                                var obj={
                                                        "openid":result.openid,
                                                        "nickname":result.nickname,
                                                        "sex":result.sex,
                                                        "city":result.city,
                                                        "headimg":result.headimgurl
                                                }
                                        YongHu.upsert(obj,function(err,data){
                                                console.log(data);
                                        })
                                                res.redirect("http://wechat.xingwentao.top/index.html");
                                        })
                                })
                                request2.end();
                                // res.redirect("/index.html");
                        })
                });
                request.end();
        },

        createMenu:function(req,res){
                var menu={
    "button": [
        {
            "name": "扫码", 
            "sub_button": [
                {
                    "type": "scancode_waitmsg", 
                    "name": "扫码带提示", 
                    "key": "rselfmenu_0_0", 
                    "sub_button": [ ]
                }, 
                {
                    "type": "scancode_push", 
                    "name": "扫码推事件", 
                    "key": "rselfmenu_0_1", 
                    "sub_button": [ ]
                }
            ]
        }, 
        {
            "name": "发图", 
            "sub_button": [
                {
                    "type": "pic_sysphoto", 
                    "name": "系统拍照发图", 
                    "key": "rselfmenu_1_0", 
                   "sub_button": [ ]
                 }, 
                {
                    "type": "pic_photo_or_album", 
                    "name": "拍照或者相册发图", 
                    "key": "rselfmenu_1_1", 
                    "sub_button": [ ]
                }, 
                {
                    "type": "pic_weixin", 
                    "name": "微信相册发图", 
                    "key": "rselfmenu_1_2", 
                    "sub_button": [ ]
                }
            ]
        }, 
        {
            "name": "发送位置", 
            "type": "location_select", 
            "key": "rselfmenu_2_0"
        },
        {
           "type": "media_id", 
           "name": "图片", 
           "media_id": "MEDIA_ID1"
        }, 
        {
           "type": "view_limited", 
           "name": "图文消息", 
           "media_id": "MEDIA_ID2"
        }
    ]
}

                 menu=JSON.stringify(menu);

                 multi_fn.getToken(Token,function(token){
                        var option={
                                hostname:"api.weixin.qq.com",
                                method:"POST",
                                path:"/cgi-bin/menu/create?access_token="+token
                             }
                        var request=https.request(option,function(result){
                                multi_fn.deal_res(result,function(result){
                                        console.log(result);
                                        res.json(result);
                                })
                        });
                        request.write(menu);
                        request.end();
                 })
        },

        jssdk:function(req,res){
            url=req.body.url;
            multi_fn.jssdk(JsApi,url,Token,res);
        },

        getcity:function(req,res){
            var lat=req.body.lat;
            var lng=req.body.lng;
            console.log(lat);
            console.log(lng);
            var option={
                hostname:"api.map.baidu.com",
                method:"GET",
                path:"/geocoder/v2/?ak=hlyy7lEiMdaw34ThSKzGjGjw&location="+lat+","+lng+"&output=json"
            }

            var request=http.request(option,function(result){
                console.log(result.headers);
                console.log(result.body);
                multi_fn.deal_res(result,function(result){
                    console.log(result);
                    res.json(result);
                })
            });
            request.end();
        }


}
























