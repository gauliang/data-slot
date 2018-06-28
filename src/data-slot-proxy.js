if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

/**
 * data-solt proxy.
 */
+function() {

    var core = function(){
        var env = null,
            redirectHost = '',
            htmlText = null;

        var query = (function () {
            var ret = {}, parts, i, p;
            try {
                parts = (document.location.toString().split("?")[1]).split("&");
            }
            catch (e) {
                parts = [];
            }
            for (i = 0; i < parts.length; i++) {
                p = parts[i].split("=");
                ret[p[0]] = p[1];
            }

            redirectHost = ret['host']?ret['host']:null;
            env = ret['env'];
            return ret;
        })();

        var getRedirectUrl = function(){

            var isLocalhost = env == 'local.localhost',
                isEnp = env == 'local.enp',
                isFile = env == 'local.file';

            if(isLocalhost || isEnp || isFile){
                return 'about:blank';
            }else{
                return 'http://' + redirectHost + '/favicon.ico';
            }
        };

        this.getAccredit = function(){
            
            var whiteList = ['example.com'];
            var _arr = null;
            var _domain = null;
            var flag = false;

            if(env=='local.file'){
                return true;
            }

            if(redirectHost==undefined || env == null){
                return flag = false;
            }

            if(env == 'web'){
                _arr = redirectHost.split('.');
                _domain = _arr.shift() && _arr.join('.');
                flag = whiteList.indexOf(_domain) >= 0;
            }else{
                flag = true;
            }

            return flag;
        };

        this.response = function(html){
            htmlText = html;
            if(htmlText!= null){
                window.name = htmlText;
                
                setTimeout(function() {
                    window.location.href = getRedirectUrl();
                }, 100);
                
            }
        };

    }

    core.prototype.init =  function(){
        if (this.getAccredit()) {
            this.response(document.body.innerHTML);
        } else {
            this.response('403');
        }
    }
    window.DataSlotProxy = core;
}(window);
