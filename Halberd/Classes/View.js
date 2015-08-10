var View = (function () {
    function View(key, parameters, liaison) {
        this.Key = key;
        this.Parameters = parameters;
        this.Liaison = liaison;
        //can find liaison by key
    }
    View.prototype.Show = function () {
        //get the html 
        //set the ViewContainer inner html
        var url = "ViewKey" + this.Key.toString();
        var found = sessionStorage.getItem(url);
        var callback = this.SetHTML;
        var liaison = this.Liaison;
        var view = this;
        if (!found || window["IsDebug"]) {
            Ajax.Html(this.Liaison.ViewUrl, function (result) {
                if (result) {
                    sessionStorage.setItem(url, result);
                    callback(result, liaison, view);
                }
            });
        }
        else {
            this.SetHTML(found, this.Liaison, this);
        }
    };
    View.prototype.SetHTML = function (html, liaison, view) {
        liaison.Container.innerHTML = html;
        var elements = liaison.Container.Get(function (ele) {
            return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
        });
        for (var i = 0; i < elements.length; i++) {
            Binding.DataContainer.Auto(elements[i]);
        }
        if (liaison.Loaded) {
            liaison.Loaded(view);
        }
        if (ViewManager.PostLoaded) {
            ViewManager.PostLoaded(view);
        }
    };
    return View;
})();
//# sourceMappingURL=View.js.map