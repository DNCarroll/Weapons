interface String {
    Trim(): string;
    TrimCharacters(characterAtZero: string, characterAtEnd: string): string;
    LeftTrim(): string;
    RightTrim(): string;
    ScriptReplace(sourceObjectOrArray, patternToLookFor, trimFromResultPatter); // uses - RegularExpression module
    SplitOnUpperCase(): string;

    Element(): HTMLElement;
    Form(): HTMLFormElement;
    List(): HTMLUListElement;
    Input(): HTMLInputElement;
    DropDown(): HTMLSelectElement;
    CreateElement(objectProperties?): HTMLElement;    
    CreateElementFromHtml(): HTMLElement;
    ParseHtml(): { Html: string; Scripts: string[]; LoadScripts(): void; };

    CreateObject(): any;    

    Post(parameters, success?);
    Put(parameters, success?);
    Get(parameters, success?, isRaw?: boolean);
    Delete(parameters, success?);
    
    Popup(target: any);
    Ok(target?: any, title?: string, modalClass?: string, okButton?: DialogButton, containerClass?: string, titleClass?: string);

}
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
String.prototype.LeftTrim = function () {
    return this.replace(/^\s+/, "");
};
String.prototype.RightTrim = function () {
    return this.replace(/\s+$/, "");
};
String.prototype.ScriptReplace = function (sourceObjectOrArray, patternToLookFor, trimFromResultPattern) {
    if (!trimFromResultPattern) {
        trimFromResultPattern = RegularExpression.StandardBindingWrapper;
    }
    if (!patternToLookFor) {
        patternToLookFor = RegularExpression.StandardBindingPattern;
    }
    return RegularExpression.Replace(patternToLookFor, this, sourceObjectOrArray, trimFromResultPattern);
};
String.prototype.SplitOnUpperCase = function () {
    if (this && this.length > 0) {
        var split = this.match(/[A-Z][a-z]+/g);
        if (split) {
            return split.join(" ");
        }
    }
    return this;
};

String.prototype.Element = function (): HTMLElement {

    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLElement>obj;
    }
    return null;
};
String.prototype.Form = function (): HTMLFormElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLFormElement>obj;
    }
    return null;
};
String.prototype.List = function (): HTMLUListElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLUListElement>obj;
    }
    return null;
};
String.prototype.Input = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLInputElement>obj;
    }
    return null;
};
String.prototype.DropDown = function (): HTMLSelectElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLSelectElement>obj;
    }
    return null;
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var obj = document.createElement(this);
    if (objectProperties) {
        obj.Set(objectProperties);
    }
    return obj;
};
String.prototype.CreateElementFromHtml = function (): HTMLElement {
    var ret = new Array<HTMLElement>();
    var div = "div".CreateElement({ innerHTML: this });
    while (div.children.length > 0) {
        var child = div.children[div.children.length - 1];
        return <HTMLElement>child;
    }    
};
String.prototype.ParseHtml = function (): any {
    var scripts = new Array();
    var html = this;
    var matches = this.match(/(<script[^>]*>[\s\S]*?<\/script>)/gi);
    if (matches) {
        for (var i = 0; i < matches.length; i++) {
            scripts.push(matches[i]);
            html = html.replace(matches[i], "");
        }
        html = html.replace(/(\r\n|\n|\r)/gm, "");
    }
    var ret = {
        Html: html, Scripts: scripts, LoadScripts: function () {
            for (var i = 0; i < ret.Scripts.length; i++) {
                var script = ret.Scripts[i].replace(/<script[^>]*>/gi, "");
                script = script.replace(/<\/script>/gi, "");
                var match = ret.Scripts[i].match(/id=('|")(.*?)('|")/g);
                var id = null;
                if (match) {
                    match = match[0].replace(/(\"|')/gi, "");
                    match = match.replace("id=", "");
                    id = match;
                    match = document.getElementById(match) ? true : false;
                }
                if (!match && script) {
                    var head = document.getElementsByTagName('head')[0];
                    var scriptElement = document.createElement('script');
                    scriptElement.setAttribute('type', 'text/javascript');
                    scriptElement["IsTemporary"] = true;
                    if (id) {
                        scriptElement.setAttribute('id', id);
                    }
                    scriptElement.textContent = script;
                    head.appendChild(scriptElement);
                }
            }
        }
    };
    return ret;
};

String.prototype.CreateObject = function () {
    return JSON.parse(this);
};

String.prototype.Put = function (parameters?, success?) {
    Ajax.HttpAction("PUT", this, parameters, success);
};
String.prototype.Delete = function (parameters?, success?) {
    Ajax.HttpAction("DELETE", this, parameters, success);
};
String.prototype.Post = function (parameters?, success?) {
    Ajax.HttpAction("POST", this, parameters, success);
};
String.prototype.Get = function (parameters?, success?, isRaw?: boolean) {
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
String.prototype.Ok = function (target?: any, title?: string, modalClass?: string, okButton?: DialogButton, containerClass?: string, titleClass?: string) {
    if (Is.String(target)) {
        target = target.E();
    }
    Dialog.Ok(this, title, target, modalClass, okButton, containerClass, titleClass);
};
String.prototype.Popup = function (target: any) {
    if (Is.String(target)) {
        target = target.E();
    }
    Dialog.Quick("div".CreateElement({
        innerHTML: this,
        border: "solid 1px #000",
        backgroundColor: "#D3D3D3",
        textAlign: "center",
        padding: ".5em"
    }), <HTMLElement>target);
};