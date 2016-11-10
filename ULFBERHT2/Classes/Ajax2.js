//two object Ajax plain, Ajax Data
//promise based so when done it calls whatever?
//how is this different than call back
var Ajax = (function () {
    function Ajax() {
        this.DisableElement = null;
        this.ManipulateProgressElement = false;
        this.UseAsDateUTC = true;
        this.ContentType = "application/json; charset=utf-8";
    }
    Object.defineProperty(Ajax.prototype, "ResponseText", {
        get: function () {
            return this.XMLHttpRequest.responseText;
        },
        enumerable: true,
        configurable: true
    });
    Ajax.prototype.Submit = function (method, url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.showProgress();
        url = this.getUrl(url);
        this.XMLHttpRequest = new XMLHttpRequest();
        var ajax = this;
        this.XMLHttpRequest.onreadystatechange = function () {
            if (ajax.isRequestReady()) {
                ajax.HideProgress();
                if (ajax.OnRequestCompleted) {
                    ajax.OnRequestCompleted();
                }
            }
        };
        this.XMLHttpRequest.open(method, url, true);
        this.XMLHttpRequest.setRequestHeader("content-type", !Is.FireFox() ? this.ContentType : "application/json;q=0.9");
        this.setCustomHeader();
        try {
            var newParameters = this.getParameters(parameters);
            this.XMLHttpRequest.send(parameters);
        }
        catch (e) {
            this.HideProgress();
            if (window.Exception) {
                window.Exception(e);
            }
        }
    };
    Ajax.prototype.showProgress = function () {
        if (this.ManipulateProgressElement) {
            if (Ajax.ProgressElement) {
                Ajax.ProgressElement.style.display = "inline";
            }
            if (this.DisableElement) {
                if (Is.Array(this.DisableElement)) {
                    for (var i = 0; i < this.DisableElement.length; i++) {
                        this.DisableElement[i].setAttribute("disabled", "disabled");
                    }
                }
                else {
                    this.DisableElement.setAttribute("disabled", "disabled");
                }
            }
        }
    };
    Ajax.prototype.getUrl = function (url) {
        if (url.indexOf("http") == -1 && !Is.NullOrEmpty(Ajax.Host)) {
            url = Ajax.Host + (url.indexOf("/") == 0 ? url : "/" + url);
        }
        return url;
    };
    Ajax.prototype.isRequestReady = function () {
        return this.XMLHttpRequest && this.XMLHttpRequest.readyState == 4;
    };
    Ajax.prototype.HideProgress = function () {
        if (this.ManipulateProgressElement) {
            if (Ajax.ProgressElement != null) {
                Ajax.ProgressElement.style.display = "none";
            }
            if (this.DisableElement) {
                if (Is.Array(this.DisableElement)) {
                    for (var i = 0; i < this.DisableElement.length; i++) {
                        this.DisableElement[i].removeAttribute("disabled");
                    }
                }
                else {
                    this.DisableElement.removeAttribute("disabled");
                }
            }
        }
    };
    Ajax.prototype.setCustomHeader = function () {
        if (this.Header) {
            var header = this.Header();
            if (header) {
                for (var prop in header) {
                    this.XMLHttpRequest.setRequestHeader(prop, header[prop]);
                }
            }
        }
    };
    Ajax.prototype.getParameters = function (parameters) {
        var ret = "";
        if (parameters && this.ContentType == "application/json; charset=utf-8") {
            ret = JSON.stringify(parameters);
            ret = ret.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
            ret = ret.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
            ret = ret.replace(/<script/ig, "");
            ret = ret.replace(/script>/ig, "");
        }
        return ret;
    };
    Ajax.prototype.GetRequestData = function () {
        var ret = null;
        if (this.isRequestReady() && (this.XMLHttpRequest.status == 200 || this.XMLHttpRequest.status == 204) &&
            !Is.NullOrEmpty(this.XMLHttpRequest.responseText)) {
            ret = this.XMLHttpRequest.responseText;
            try {
                ret = JSON.parse(ret);
                if (ret.d) {
                    ret = ret.d;
                }
                this.convertProperties(ret);
            }
            catch (e) {
                ret = null;
                if (window.Exception) {
                    window.Exception(e);
                }
            }
        }
        return ret;
    };
    Ajax.prototype.convertProperties = function (object) {
        var keyMap;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var obj = object[i];
                if (obj) {
                    try {
                        keyMap == null ? this.getKeyMap(obj) : keyMap;
                    }
                    catch (e) {
                        if (window.Exception) {
                            window.Exception(e);
                        }
                    }
                    this.setValues(obj, keyMap);
                }
                for (var prop in obj) {
                    this.convertProperties(obj[prop]);
                }
            }
        }
        else if (Is.Object(object)) {
            var keyMap = this.getKeyMap(object);
            this.setValues(object, keyMap);
            for (var prop in object) {
                this.convertProperties(object[prop]);
            }
        }
    };
    Ajax.prototype.getKeyMap = function (obj) {
        var keyMap = new Array();
        for (var prop in obj) {
            var val = obj[prop];
            if (val && Is.String(val)) {
                val = val.Trim();
                if (val.indexOf("/Date(") == 0 || val.indexOf("Date(") == 0) {
                    keyMap.push({ Key: prop, Type: "Date" });
                }
                else if (val.match(RegularExpression.UTCDate)) {
                    keyMap.push({ Key: prop, Type: "UTCDate" });
                }
                else if (val.match(RegularExpression.ZDate)) {
                    keyMap.push({ Key: prop, Type: "ZDate" });
                }
            }
        }
        return keyMap;
    };
    Ajax.prototype.setValues = function (obj, keyMap) {
        for (var j = 0; j < keyMap.length; j++) {
            var key = keyMap[j].Key;
            var type = keyMap[j].Type;
            var val = obj[key];
            switch (type) {
                case "Date":
                    if (val) {
                        val = val.substring(6);
                        val = val.replace(")/", "");
                        val = parseInt(val);
                        if (val > -62135575200000) {
                            val = new Date(val);
                            obj[key] = val;
                        }
                        else {
                            delete obj[key];
                        }
                    }
                    else {
                        obj[key] = new Date();
                    }
                    break;
                case "UTCDate":
                case "ZDate":
                    var tempDate = new Date(val);
                    if (this.UseAsDateUTC) {
                        tempDate = new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate());
                    }
                    else if (Is.Chrome()) {
                        var offset = new Date().getTimezoneOffset();
                        tempDate = tempDate.Add(0, 0, 0, 0, offset);
                    }
                    obj[key] = tempDate;
                    break;
                default:
                    break;
            }
        }
    };
    Ajax.prototype.Get = function (url, parameters) {
        if (parameters === void 0) { parameters = null; }
        this.Submit("GET", url, parameters);
    };
    Ajax.ProgressElement = null;
    return Ajax;
}());
//# sourceMappingURL=Ajax2.js.map