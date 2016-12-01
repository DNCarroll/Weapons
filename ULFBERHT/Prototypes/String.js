String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.TrimCharacters = function (characterAtZero, characterAtEnd) {
    var ret = this;
    if (characterAtZero) {
        if (ret.indexOf(characterAtZero) == 0) {
            ret = ret.substring(1);
        }
    }
    if (characterAtEnd) {
        var lastCharacter = ret.substring(ret.length - 1);
        if (lastCharacter == characterAtEnd) {
            //not sure about that
            ret = ret.substring(0, ret.length - 1);
        }
    }
    return ret;
};
String.prototype.Element = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.Form = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.List = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.Input = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.DropDown = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.CreateElement = function (objectProperties) {
    var obj = document.createElement(this);
    if (objectProperties) {
        obj.Set(objectProperties);
    }
    return obj;
};
String.prototype.CreateElementFromHtml = function () {
    var ret = new Array();
    var div = "div".CreateElement({ innerHTML: this });
    while (div.children.length > 0) {
        var child = div.children[div.children.length - 1];
        return child;
    }
};
String.prototype.Put = function (parameters, success) {
    Ajax.HttpAction("PUT", this, parameters, success);
};
String.prototype.Delete = function (parameters, success) {
    Ajax.HttpAction("DELETE", this, parameters, success);
};
String.prototype.Post = function (parameters, success) {
    Ajax.HttpAction("POST", this, parameters, success);
};
String.prototype.Get = function (parameters, success, isRaw) {
    var url = this;
    if (parameters) {
        if (Is.Array(parameters)) {
            for (var i = 0; i < parameters.length; i++) {
                url += "/" + parameters[i].toString();
            }
            Ajax.HttpAction("GET", url, null, success, isRaw);
        }
        else {
            url += "/";
            var queryIndicator = "?";
            for (var prop in parameters) {
                if (parameters[prop]) {
                    url += queryIndicator + prop + "=" + parameters[prop].toString();
                    queryIndicator = "&";
                }
            }
            Ajax.HttpAction("GET", url, null, success, isRaw);
        }
    }
    else {
        Ajax.HttpAction("GET", url, null, success, isRaw);
    }
};
//# sourceMappingURL=String.js.map