var Ajax;
(function (Ajax) {
    Ajax.Host = "";
    Ajax.UseAsDateUTC = false;
    Ajax.AutoConvert = true;
    Ajax.ProgressElement = null;
    Ajax.DisableElement = null;
    Ajax.DefaultHeader;
    function Resolver() {
        var subDirectories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subDirectories[_i - 0] = arguments[_i];
        }
        var split = window.SplitPathName()[0].toLowerCase();
        var host = window.location.href.replace(window.location.pathname, "");
        for (var i = 0; i < subDirectories.length; i++) {
            if (subDirectories[i].toLowerCase() == split) {
                Ajax.Host = host + "/" + subDirectories[i], true;
                break;
            }
        }
    }
    Ajax.Resolver = Resolver;
    function ConvertProperties(object) {
        var keyMap;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var obj = object[i];
                if (obj) {
                    try {
                        if (keyMap == null) {
                            keyMap = Ajax.getKeyMap(obj);
                        }
                    }
                    catch (e) {
                        if (window.Exception) {
                            window.Exception(e);
                        }
                    }
                    Ajax.setValues(obj, keyMap);
                }
                for (var prop in obj) {
                    Ajax.ConvertProperties(obj[prop]);
                }
            }
        }
        else if (Is.Object(object)) {
            var keyMap = getKeyMap(object);
            setValues(object, keyMap);
            for (var prop in object) {
                ConvertProperties(object[prop]);
            }
        }
    }
    Ajax.ConvertProperties = ConvertProperties;
    function getKeyMap(obj) {
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
    }
    Ajax.getKeyMap = getKeyMap;
    function HandleOtherStates(xmlhttp) {
        if (xmlhttp.readyState == 4) {
            Ajax.HideProgress();
            if (xmlhttp.status == 404) {
                if (window.Exception) {
                    window.Exception("404 file not found.", xmlhttp);
                }
            }
            else if (xmlhttp.status == 500) {
                if (window.Exception) {
                    window.Exception("500 error.", xmlhttp);
                }
            }
            else {
                if (window.Exception) {
                    window.Exception("Unhandled status:" + xmlhttp.status, xmlhttp);
                }
            }
        }
    }
    Ajax.HandleOtherStates = HandleOtherStates;
    function HideProgress() {
        if (Ajax.ProgressElement != null) {
            Ajax.ProgressElement.style.display = "none";
        }
        if (Ajax.DisableElement) {
            if (Is.Array(Ajax.DisableElement)) {
                for (var i = 0; i < Ajax.DisableElement.length; i++) {
                    Ajax.DisableElement[i].removeAttribute("disabled");
                }
            }
            else {
                Ajax.DisableElement.removeAttribute("disabled");
            }
        }
    }
    Ajax.HideProgress = HideProgress;
    function setValues(obj, keyMap) {
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
                    if (Ajax.UseAsDateUTC) {
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
    }
    Ajax.setValues = setValues;
    function ShowProgress() {
        if (Ajax.ProgressElement) {
            Ajax.ProgressElement.style.display = "inline";
        }
        if (Ajax.DisableElement) {
            if (Is.Array(Ajax.DisableElement)) {
                for (var i = 0; i < Ajax.DisableElement.length; i++) {
                    Ajax.DisableElement[i].setAttribute("disabled", "disabled");
                }
            }
            else {
                Ajax.DisableElement.setAttribute("disabled", "disabled");
            }
        }
    }
    Ajax.ShowProgress = ShowProgress;
    function Submit(method, url, parameters, returnMethod, contentType) {
        var tempUrl = url;
        Ajax.ShowProgress();
        if (url.indexOf("http") == -1 && Ajax.Host != "") {
            tempUrl = Ajax.Host + (url.indexOf("/") == 0 ? url : "/" + url);
        }
        // code for IE7+, Firefox, Chrome, Opera, Safari
        var xmlhttp = new XMLHttpRequest();
        if (xmlhttp) {
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status == 204)) {
                    Ajax.HideProgress();
                    returnMethod(xmlhttp.responseText);
                }
                else {
                    Ajax.HandleOtherStates(xmlhttp);
                }
            };
            xmlhttp.open(method, tempUrl, true);
            if (contentType) {
                xmlhttp.setRequestHeader("content-type", !Is.FireFox() ? contentType : "application/json;q=0.9");
            }
            if (Ajax.DefaultHeader != null) {
                var header = Ajax.DefaultHeader(tempUrl);
                if (header) {
                    for (var prop in header) {
                        xmlhttp.setRequestHeader(prop, header[prop]);
                    }
                }
            }
            try {
                if (parameters) {
                    if (contentType == "application/json; charset=utf-8") {
                        var json = JSON.stringify(parameters);
                        json = json.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
                        json = json.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
                        json = json.replace(/<script/ig, "");
                        json = json.replace(/script>/ig, "");
                        xmlhttp.send(json);
                    }
                    else {
                        xmlhttp.send(parameters);
                    }
                }
                else {
                    xmlhttp.send();
                }
            }
            catch (e) {
                Ajax.HideProgress();
                if (window.Exception) {
                    window.Exception(e);
                }
            }
        }
    }
    Ajax.Submit = Submit;
    function HttpAction(httpAction, url, parameters, successMethod, isRaw) {
        var returnMethod = function (response) {
            if (successMethod) {
                var ret = response;
                if (!isRaw && !Is.NullOrEmpty(ret)) {
                    try {
                        ret = JSON.parse(ret);
                        if (ret.d) {
                            ret = ret.d;
                        }
                        if (Ajax.AutoConvert) {
                            Ajax.ConvertProperties(ret);
                        }
                    }
                    catch (e) {
                        if (window.Exception) {
                            window.Exception(e);
                        }
                    }
                }
                successMethod(ret);
            }
        };
        Ajax.Submit(httpAction, url, parameters, returnMethod, "application/json; charset=utf-8");
    }
    Ajax.HttpAction = HttpAction;
    function Html(url, callBack) {
        var stored = sessionStorage.getItem(url);
        if (!stored) {
            Ajax.HttpAction("GET", url, {}, function (result) {
                sessionStorage.setItem(url, result);
                callBack(result);
            }, true);
        }
        else {
            callBack(stored);
        }
    }
    Ajax.Html = Html;
})(Ajax || (Ajax = {}));
