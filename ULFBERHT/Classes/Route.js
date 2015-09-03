var Route = (function () {
    function Route(key, parameters, view) {
        this.Key = key;
        this.Parameters = parameters;
        this.View = view;
    }
    Route.prototype.Show = function () {
        //get the html 
        //set the ViewContainer inner html
        var url = "RouteKey" + this.Key.toString();
        var found = sessionStorage.getItem(url);
        var callback = this.SetHTML;
        var view = this.View;
        var router = this;
        if (!found || window["IsDebug"]) {
            Ajax.Html(this.View.ViewUrl, function (result) {
                if (result) {
                    view.Preload(this);
                    sessionStorage.setItem(url, result);
                    callback(result, view, router);
                }
            });
        }
        else {
            this.SetHTML(found, this.View, this);
        }
    };
    Route.prototype.SetHTML = function (html, view, route) {
        view.Preload(this);
        view.Container.innerHTML = html;
        var elements = view.Container.Get(function (ele) {
            return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
        });
        for (var i = 0; i < elements.length; i++) {
            Binding.DataContainer.Auto(elements[i]);
        }
        if (view.Loaded) {
            view.Loaded(route);
        }
    };
    return Route;
})();
//# sourceMappingURL=Route.js.map