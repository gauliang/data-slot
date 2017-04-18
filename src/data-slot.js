/**
 * DataSlot(options,callback)
 * options
 * {
 * 		url:{web:'',local:''},
 * 		remotePath:'remotePubRulePath'
 * }
 */
+function (win, doc, $) {
	"use strict";

	var body = doc.body;
	var option = {
		url: {
			web: '',
			local: '',
		},
		remotePath: ''
	}

	var core = function (opts, callback) {
		var iframe,
			AXO,
			source,
			env,
			host = location.host;

		function boot() {
			// create iframe
			if ("ActiveXObject" in win) {
				AXO = new ActiveXObject('htmlfile');
				AXO.open();
				AXO.write("<html><body><iframe id='iframe'></iframe></body></html>");
				AXO.close();
				iframe = AXO.getElementById("iframe");
			} else {
				iframe = document.createElement('iframe');
				iframe.style.cssText = 'display:none';
				body.insertBefore(iframe, body.firstElementChild || body.firstChild);
			}

			iframe = document.createElement('iframe');
			iframe.style.cssText = 'display:none';
			body.insertBefore(iframe, body.firstElementChild || body.firstChild);

			// fix options
			option = $.extend(option, opts);

			// env detect
			if (/localhost/.test(host)) {
				env = 'local.localhost';
			} else if(/^\d+\.\d+\.\d+\.\d+/.test(host)){
				env = 'local.enp';
			} else if(host.length ==0){
				env = 'local.file';
			}else{
				env = 'web';
			}

			init()
		}

		function init() {
			var url = option.url[/^local/.test(env)?'local':'web'];
			var host = window.location.host;

			url = url + (/\?/.test(url) ? "&" : "?") + "host=";

			iframe.src = url + host + '&env=' + env;
			checkFrameName();
		}

		function checkFrameName() {			
			try {
				source = iframe.contentWindow.name;
			}
			catch (e) {
				//console.log(e.message)
			}
			if (source) {
				iframe.src = "about:blank";
				iframe.parentNode.removeChild(iframe);
				iframe = null;
				if (AXO) {
					AXO = null;
					if (win.CollectGarbage) {
						win.CollectGarbage();
					}
				}

				renderer(source)
			} else {
				setTimeout(checkFrameName, 200);
			}
		}

		function getRegion (elements){
			var list = {};
			$.each(elements,function(index,item){
				list[$(item).attr('data-region')] = $(item)
			})
			return list;
		}

		function getRegionData(html){
			var data = {},
				list = null,
				i = 0,
				item,
				reg = new RegExp('<!--region:([a-z-]+)-->[\\s\\S]+<!--/region:\\1-->',"img"),
				analysis = new RegExp('<!--region:([a-z-]+)-->([\\s\\S]+)<!--/region:\\1-->',"im");

			if(list = html.match(reg)){
				for (i = 0; i < list.length; i++) {
					item = list[i].match(analysis);
					data[item[1]] = item[2];
				}
			}			
			return data;
		}

		function injection(template,regiondata){
			var item = null;
			
			for (item in regiondata) {
				template = template.replace("<!--region:"+item+"/-->","<!--region:"+item+"-->"+regiondata[item]+"<!--/region:"+item+"-->");
			}
			return template;
		}

		function renderer(data) {

			var pathReg = null,
				slots = $('[data-slot]'),
				slot = null,
				slotName = null,
				slotContent = null,
				slotReg = null;

			if(env == 'local'){
				pathReg = new RegExp('attachement', 'g');
			}else{
				pathReg = new RegExp('/_/', 'g');
			}

			if(data != '403'){
				$.each(slots, function (index, value) {
					slot = $(value);
					slotName = slot.attr('data-slot');
					slotReg = new RegExp("<!--CS:" + slotName + "-->" + "([\\s\\S]+)" + "<!--CE:" + slotName + "-->", "i");
					slotContent = data.match(slotReg)[1].replace(pathReg, "/" +option.remotePath + "/attachement");
					slot.html(injection(slotContent,getRegionData(slot.html())));
					slot.removeAttr('data-pending');
				});
				
				// callback
				(typeof callback == 'function') && callback();

			}else{
				// error
				$.each(slots, function (index, value) {
					$(value).html("Error:403")
				})
			}
			return null;
		}

		boot();

	}
	win.DataSlot = core;
}(this, document, jQuery)