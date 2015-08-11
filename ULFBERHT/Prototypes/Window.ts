interface Window {
    SplitPathName(): Array<string>;
    PageLoaded(postLoadFuntion, e?);
    UniqueID(): string;
    MousePosition(e?): { X: number; Y: number; };
    Sleep(milliseconds: number);
    ShortDate();
    PushState(stateobj, title, url);
    Dimensions(): { Height: number; Width: number; };
    SetLocation(url: string);
    Show(viewKey, parameters?: Array<any>);
    Exception(...parameters: any[]);
}
Window.prototype.Exception = function (...parameters: any[]) {
    if (parameters.length == 1) {
        var obj = {};
        for (var i = 0; i < parameters.length; i++) {
            obj["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(obj));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert("Unknown error");
    }
};
Window.prototype.Show = function (viewKey, parameters?: Array<any>) {
    ViewManager.Load(viewKey, parameters);
};
Window.prototype.SetLocation = function (url: string) {
    var temp = <any>window;
    temp.location = url;
};
Window.prototype.Dimensions = function (): { Height: number; Width: number; } {
    var ret = { Height: 0, Width: 0 };
    var temp = <any>window;
    if (typeof temp.innerWidth != 'undefined') {
        ret.Width = temp.innerWidth,
        ret.Height = temp.innerHeight
    }
    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
        'undefined' && document.documentElement.clientWidth != 0) {
        ret.Width = document.documentElement.clientWidth,
        ret.Height = document.documentElement.clientHeight
    }
    else {
        ret.Width = document.getElementsByTagName('body')[0].clientWidth,
        ret.Height = document.getElementsByTagName('body')[0].clientHeight
    }
    return ret;
};
Window.prototype.PushState = function (stateobj, title, url) {
    if (history && history.pushState) {
        if (Is.Array(url)) {
            url = "/" + url.join("/");
        }
        else if (!url) {
            url = "/";
        }
        else if (url.indexOf("/") != 0) {
            url = "/" + url;
        }
        history.pushState(stateobj, title, url);
    }
};
Window.prototype.ShortDate = function () {
    var date = new Date();
    var now = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    return now;
};
Window.prototype.Sleep = function (milliseconds: number) {
    var date = new Date();
    var curDate = new Date();    
    while (curDate.getMilliseconds() - date.getMilliseconds() < milliseconds)
    {
    }
};
Window.prototype.MousePosition = function (e?): { X: number; Y: number; } {
    if (event || e) {
        if (Is.InternetExplorer()) { // grab the x-y pos.s if browser is IE
            return { X: event.clientX + document.body.scrollLeft, Y: event.clientY + document.body.scrollTop };
        } else {  // grab the x-y pos.s if browser is NS
            return { X: e.pageX, Y: e.pageY };
        }
    }
    return { X: 0, Y: 0 };
};
Window.prototype.UniqueID = function (): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).replace("-", "").substring(0, 16);
};
Window.prototype.SplitPathName = function (): Array<string> {
    var ret = new Array<string>();
    var pathName = window.location.pathname;
    pathName = pathName.substring(1);
    var lastCharacter = pathName.charAt(pathName.length - 1);
    if (lastCharacter == "/") {
        pathName = pathName.substring(0, pathName.length - 1);
    }
    var split = pathName.split("/");
    return split;
};
Window.prototype.PageLoaded = function (postLoadFuntion, e?) {    
    if (document.readyState === "complete") {
        postLoadFuntion();        
    }
    else {
        if (window.onload) {
            var curronload = window.onload;
            var newonload = function () {
                curronload(<Event>e);
                postLoadFuntion();                
            };
            window.onload = newonload;
        } else {
            window.onload = function () {
                postLoadFuntion();                
            }
        }
    }
};
function autoBindForms() {
    var elements = document.body.Get(ele=> {
        return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
    });
    for (var i = 0; i < elements.length; i++) {
        Binding.DataContainer.Auto(elements[i]);
    }
};
function WindowLoad(e?) {
    if (document.readyState === "complete") {
        var pg = document.getElementById("progress");
        if (pg != null && Ajax) {
            Ajax.ProgressElement = pg;
        }
        autoBindForms();
    } else {
        if (window.onload) {
            var curronload = window.onload;
            var newonload = function () {
                var pg = document.getElementById("progress");
                if (pg != null && Ajax) {
                    Ajax.ProgressElement = pg;
                }
                curronload(e);
                autoBindForms();
            };
            window.onload = newonload;
        } else {
            window.onload = function () {
                var pg = document.getElementById("progress");
                if (pg != null && Ajax) {
                    Ajax.ProgressElement = pg;
                }
                autoBindForms();
            };
        }
    }
};
WindowLoad();